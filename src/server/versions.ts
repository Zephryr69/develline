import { randomUUID } from "node:crypto";
import { query, tx, toBuffer, type Query } from "@/db";
import { AppError, forbidden } from "./errors";
import { logAction } from "./audit";
import type { FileRec } from "./zip";

export type FileMeta = { path: string; sha256: string; size: number; isText: boolean };
export type Version = {
  id: string;
  project_id: string;
  number: number;
  label: string;
  title: string;
  kind: "initial" | "contribution" | "restore";
  author_id: string | null;
  author_name: string | null;
  contribution_id: string | null;
  file_count: number;
  total_size: number;
  created_at: Date;
};

type NewFile = FileMeta & { data?: Buffer };

export async function createVersion(
  q: Query,
  a: {
    projectId: string;
    kind: Version["kind"];
    title: string;
    authorId: string | null;
    files: NewFile[];
    contributionId?: string;
    restoredFrom?: string;
  }
): Promise<{ id: string; number: number; label: string }> {
  const [{ n }] = await q<{ n: number }>("select coalesce(max(number) + 1, 0)::int as n from versions where project_id = $1", [a.projectId]);
  const id = randomUUID();
  const label = `v1.${n}`;
  const total = a.files.reduce((s, f) => s + f.size, 0);
  await q(
    `insert into versions (id, project_id, number, label, title, kind, author_id, contribution_id, restored_from, file_count, total_size)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [id, a.projectId, n, label, a.title.slice(0, 200), a.kind, a.authorId, a.contributionId ?? null, a.restoredFrom ?? null, a.files.length, total]
  );
  for (const f of a.files) {
    if (f.data) await q("insert into blobs (sha256, content) values ($1,$2) on conflict (sha256) do nothing", [f.sha256, f.data]);
    await q("insert into version_files (version_id, path, sha256, size, is_text) values ($1,$2,$3,$4,$5)", [id, f.path, f.sha256, f.size, f.isText]);
  }
  await q("update projects set current_version_id = $2 where id = $1", [a.projectId, id]);
  return { id, number: n, label };
}

const VERSION_SELECT = `select v.id, v.project_id, v.number, v.label, v.title, v.kind, v.author_id, u.name as author_name,
  v.contribution_id, v.file_count, v.total_size, v.created_at
  from versions v left join users u on u.id = v.author_id`;

export const listVersions = (projectId: string) =>
  query<Version>(`${VERSION_SELECT} where v.project_id = $1 order by v.number desc`, [projectId]);

export async function getVersionByLabel(projectId: string, label: string): Promise<Version | null> {
  const rows = await query<Version>(`${VERSION_SELECT} where v.project_id = $1 and v.label = $2`, [projectId, label]);
  return rows[0] ?? null;
}

export async function getVersionById(projectId: string, id: string): Promise<Version | null> {
  const rows = await query<Version>(`${VERSION_SELECT} where v.project_id = $1 and v.id = $2`, [projectId, id]);
  return rows[0] ?? null;
}

type FileRow = { path: string; sha256: string; size: number; is_text: boolean };
const toMeta = (r: FileRow): FileMeta => ({ path: r.path, sha256: r.sha256, size: r.size, isText: r.is_text });

export async function listVersionFiles(versionId: string, q: Query = query): Promise<FileMeta[]> {
  const rows = await q<FileRow>("select path, sha256, size, is_text from version_files where version_id = $1 order by path", [versionId]);
  return rows.map(toMeta);
}

export async function readBlob(sha256: string, q: Query = query): Promise<Buffer | null> {
  const rows = await q<{ content: unknown }>("select content from blobs where sha256 = $1", [sha256]);
  return rows[0] ? toBuffer(rows[0].content) : null;
}

export async function loadVersionFilesWithData(versionId: string): Promise<(FileMeta & { data: Buffer })[]> {
  const rows = await query<FileRow & { content: unknown }>(
    `select f.path, f.sha256, f.size, f.is_text, b.content
       from version_files f join blobs b on b.sha256 = f.sha256
      where f.version_id = $1 order by f.path`,
    [versionId]
  );
  return rows.map((r) => ({ ...toMeta(r), data: toBuffer(r.content) }));
}

/** Restauration non destructive : crée une nouvelle version à partir d'une ancienne. */
export async function restoreVersion(
  user: { id: string },
  project: { id: string; owner_id: string; status: string; current_version_id: string | null },
  versionId: string
): Promise<{ label: string }> {
  if (project.owner_id !== user.id) throw forbidden("Seul le propriétaire peut restaurer une version.");
  if (project.status === "delivered") throw new AppError("Le projet est livré : l’historique est figé.");
  const target = await getVersionById(project.id, versionId);
  if (!target) throw new AppError("Version introuvable.", "not_found");
  if (target.id === project.current_version_id) throw new AppError("Cette version est déjà la version courante.");

  return tx(async (q) => {
    const files = await listVersionFiles(target.id, q);
    const created = await createVersion(q, {
      projectId: project.id,
      kind: "restore",
      title: `Restauration de ${target.label}`,
      authorId: user.id,
      files,
      restoredFrom: target.id,
    });
    await logAction(q, project.id, user.id, "version.restored", `${target.label} → ${created.label}`);
    return { label: created.label };
  });
}

export type { FileRec };
