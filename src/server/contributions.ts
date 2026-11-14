import { randomUUID } from "node:crypto";
import { query, tx } from "@/db";
import { AppError, forbidden } from "./errors";
import { logAction } from "./audit";
import { computeChanges, textDiff, toMap, type Change, type TextDiff } from "./diff";
import { createVersion, getVersionByLabel, listVersionFiles, readBlob, type FileMeta } from "./versions";
import { readArchive } from "./zip";
import type { Access, Project } from "./projects";

export type Contribution = {
  id: string;
  project_id: string;
  author_id: string;
  author_name: string;
  title: string;
  summary: string;
  base_version_id: string;
  base_label: string;
  result_label: string | null;
  archive_name: string;
  archive_size: number;
  status: "pending" | "accepted" | "rejected";
  decided_by_name: string | null;
  decided_at: Date | null;
  decision_note: string;
  created_at: Date;
};

const SELECT = `
  select c.id, c.project_id, c.author_id, a.name as author_name, c.title, c.summary, c.base_version_id,
         bv.label as base_label, rv.label as result_label, c.archive_name, c.archive_size, c.status,
         d.name as decided_by_name, c.decided_at, c.decision_note, c.created_at
    from contributions c
    join users a on a.id = c.author_id
    join versions bv on bv.id = c.base_version_id
    left join versions rv on rv.id = c.result_version_id
    left join users d on d.id = c.decided_by`;

export const listContributions = (projectId: string) =>
  query<Contribution>(`${SELECT} where c.project_id = $1 order by c.created_at desc`, [projectId]);

export async function getContribution(projectId: string, id: string): Promise<Contribution | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await query<Contribution>(`${SELECT} where c.project_id = $1 and c.id = $2`, [projectId, id]);
  return rows[0] ?? null;
}

type FileRow = { path: string; sha256: string; size: number; is_text: boolean };
const toMeta = (r: FileRow): FileMeta => ({ path: r.path, sha256: r.sha256, size: r.size, isText: r.is_text });

async function contributionFiles(id: string): Promise<FileMeta[]> {
  const rows = await query<FileRow>("select path, sha256, size, is_text from contribution_files where contribution_id = $1 order by path", [id]);
  return rows.map(toMeta);
}

export async function submitContribution(
  user: { id: string },
  project: Project,
  access: Access,
  input: { title: string; summary: string; baseLabel?: string },
  archive: { name: string; buffer: Buffer }
): Promise<{ id: string; changes: number }> {
  if (!access.canSubmit) throw forbidden("Vous n’avez pas le droit de contribuer à ce projet.");
  if (project.status === "delivered") throw new AppError("Ce projet est livré : il n’accepte plus de contributions.");
  if (!project.current_version_id) throw new AppError("Le projet n’a pas de version courante.");

  const title = input.title.trim().replace(/\s+/g, " ");
  const summary = input.summary.trim();
  if (title.length < 3 || title.length > 100) throw new AppError("Le titre doit faire entre 3 et 100 caractères.");
  if (summary.length < 10 || summary.length > 1000) throw new AppError("Le résumé doit faire entre 10 et 1 000 caractères.");

  const pending = await query<{ n: number }>(
    "select count(*)::int as n from contributions where project_id=$1 and author_id=$2 and status='pending'",
    [project.id, user.id]
  );
  if (pending[0].n >= 3) throw new AppError("Vous avez déjà 3 contributions en attente. Attendez la décision du propriétaire.");

  const currentFiles = await listVersionFiles(project.current_version_id);
  const baseTopFolders = new Set(currentFiles.filter((f) => f.path.includes("/")).map((f) => f.path.split("/")[0]));
  const parsed = await readArchive(archive.buffer, { baseTopFolders });

  // Version de base : manifeste de la copie de travail > choix du formulaire > version courante.
  let baseLabel = input.baseLabel?.trim() || "";
  if (parsed.manifest?.project) {
    if (parsed.manifest.project !== project.id) throw new AppError("Cette archive a été téléchargée depuis un autre projet.");
    if (parsed.manifest.version) baseLabel = parsed.manifest.version;
  }
  const base = baseLabel ? await getVersionByLabel(project.id, baseLabel) : null;
  const baseVersion = base ?? (await getVersionByLabel(project.id, project.current_label!));
  if (!baseVersion) throw new AppError("Version de base introuvable.");

  const baseFiles = await listVersionFiles(baseVersion.id);
  const changes = computeChanges(toMap(baseFiles), toMap(parsed.files));
  if (changes.length === 0) throw new AppError(`Aucun changement détecté par rapport à ${baseVersion.label}.`);

  const id = randomUUID();
  await tx(async (q) => {
    await q(
      `insert into contributions (id, project_id, author_id, title, summary, base_version_id, archive_name, archive_size)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, project.id, user.id, title, summary, baseVersion.id, archive.name.slice(0, 120), archive.buffer.length]
    );
    for (const f of parsed.files) {
      await q("insert into blobs (sha256, content) values ($1,$2) on conflict (sha256) do nothing", [f.sha256, f.data]);
      await q("insert into contribution_files (contribution_id, path, sha256, size, is_text) values ($1,$2,$3,$4,$5)", [id, f.path, f.sha256, f.size, f.isText]);
    }
    await logAction(q, project.id, user.id, "contribution.submitted", title);
  });
  return { id, changes: changes.length };
}

export async function getChanges(c: Contribution): Promise<Change[]> {
  const [base, next] = await Promise.all([listVersionFiles(c.base_version_id), contributionFiles(c.id)]);
  return computeChanges(toMap(base), toMap(next));
}

export type FileDiff =
  | { kind: "text"; status: Change["status"]; diff: TextDiff }
  | { kind: "binary"; status: Change["status"]; size: number; oldSize: number };

export async function getFileDiff(c: Contribution, path: string): Promise<FileDiff | null> {
  const [baseFiles, nextFiles] = await Promise.all([listVersionFiles(c.base_version_id), contributionFiles(c.id)]);
  const b = toMap(baseFiles).get(path);
  const n = toMap(nextFiles).get(path);
  if (!b && !n) return null;
  if (b && n && b.sha256 === n.sha256) return null;
  const status: Change["status"] = !b ? "added" : !n ? "deleted" : "modified";
  if ((b && !b.isText) || (n && !n.isText)) return { kind: "binary", status, size: n?.size ?? 0, oldSize: b?.size ?? 0 };
  const [oldBuf, newBuf] = await Promise.all([b ? readBlob(b.sha256) : null, n ? readBlob(n.sha256) : null]);
  return { kind: "text", status, diff: textDiff(oldBuf?.toString("utf8") ?? "", newBuf?.toString("utf8") ?? "") };
}

/** Acceptation : applique les changements de la contribution sur la version courante. */
export async function acceptContribution(user: { id: string }, project: Project, contributionId: string): Promise<{ label: string }> {
  if (project.owner_id !== user.id) throw forbidden("Seul le propriétaire peut accepter une contribution.");
  if (project.status === "delivered") throw new AppError("Le projet est livré : l’historique est figé.");

  return tx(async (q) => {
    const rows = await q<{ id: string; title: string; author_id: string; base_version_id: string; status: string }>(
      "select id, title, author_id, base_version_id, status from contributions where id=$1 and project_id=$2 for update",
      [contributionId, project.id]
    );
    const c = rows[0];
    if (!c) throw new AppError("Contribution introuvable.", "not_found");
    if (c.status !== "pending") throw new AppError("Cette contribution a déjà été traitée.", "conflict");

    const cur = (await q<{ current_version_id: string }>("select current_version_id from projects where id=$1", [project.id]))[0].current_version_id;
    const [baseF, curF, nextF] = await Promise.all([
      listVersionFiles(c.base_version_id, q),
      listVersionFiles(cur, q),
      q<FileRow>("select path, sha256, size, is_text from contribution_files where contribution_id=$1", [c.id]).then((r) => r.map(toMeta)),
    ]);
    const base = toMap(baseF), current = toMap(curF), next = toMap(nextF);
    const changes = computeChanges(base, next);

    // Conflit : un fichier modifié par la contribution a aussi changé depuis la version de base.
    const conflicts = changes
      .filter((ch) => {
        const cu = current.get(ch.path);
        const ba = base.get(ch.path);
        const nx = next.get(ch.path);
        return cu?.sha256 !== ba?.sha256 && cu?.sha256 !== nx?.sha256;
      })
      .map((ch) => ch.path);
    if (conflicts.length) {
      throw new AppError(
        "Conflit : ces fichiers ont changé depuis la version de base de la contribution. Demandez au collaborateur de soumettre à nouveau à partir de la version courante.",
        "conflict",
        conflicts.slice(0, 8)
      );
    }

    const merged = new Map(current);
    for (const ch of changes) {
      if (ch.status === "deleted") merged.delete(ch.path);
      else merged.set(ch.path, next.get(ch.path)!);
    }
    const files = [...merged.values()].sort((a, b) => a.path.localeCompare(b.path));
    if (files.length === 0) throw new AppError("L’acceptation viderait le projet : opération refusée.");
    if (computeChanges(current, merged).length === 0) throw new AppError("Ces changements sont déjà présents dans la version courante.", "conflict");

    const v = await createVersion(q, { projectId: project.id, kind: "contribution", title: c.title, authorId: c.author_id, files, contributionId: c.id });
    await q("update contributions set status='accepted', decided_by=$2, decided_at=now(), result_version_id=$3 where id=$1", [c.id, user.id, v.id]);
    await logAction(q, project.id, user.id, "contribution.accepted", `${c.title} → ${v.label}`);
    return { label: v.label };
  });
}

export async function rejectContribution(user: { id: string }, project: Project, contributionId: string, noteRaw: string) {
  if (project.owner_id !== user.id) throw forbidden("Seul le propriétaire peut rejeter une contribution.");
  const note = noteRaw.trim().slice(0, 500);
  await tx(async (q) => {
    const c = (await q<{ title: string; status: string }>("select title, status from contributions where id=$1 and project_id=$2", [contributionId, project.id]))[0];
    if (!c) throw new AppError("Contribution introuvable.", "not_found");
    if (c.status !== "pending") throw new AppError("Cette contribution a déjà été traitée.", "conflict");
    await q("update contributions set status='rejected', decided_by=$2, decided_at=now(), decision_note=$3 where id=$1", [contributionId, user.id, note]);
    await logAction(q, project.id, user.id, "contribution.rejected", c.title);
  });
}
