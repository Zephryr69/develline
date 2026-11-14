import { randomUUID } from "node:crypto";
import { query, tx } from "@/db";
import { AppError, forbidden } from "./errors";
import { logAction } from "./audit";
import { createVersion } from "./versions";
import { makeFile, type FileRec } from "./zip";

export type Project = {
  id: string;
  owner_id: string;
  owner_name: string;
  slug: string;
  name: string;
  description: string;
  context: string;
  docs: string;
  stack: string;
  visibility: "public" | "private";
  demo_url: string;
  sprint_weeks: number;
  sprint_ends_at: Date;
  target_versions: number;
  status: "active" | "delivered";
  delivered_at: Date | null;
  current_version_id: string | null;
  current_label: string | null;
  accepted_count: number;
  version_count: number;
  created_at: Date;
};

export type Role = "owner" | "contribute" | "view" | "public" | "none";
export type Access = { role: Role; canView: boolean; canSeeFiles: boolean; canSubmit: boolean; canDecide: boolean };

export const PROJECT_SELECT = `
  select p.*, u.name as owner_name,
    (select label from versions v where v.id = p.current_version_id) as current_label,
    (select count(*)::int from versions v where v.project_id = p.id and v.kind = 'contribution') as accepted_count,
    (select count(*)::int from versions v where v.project_id = p.id) as version_count
  from projects p join users u on u.id = p.owner_id`;

export function slugify(name: string): string {
  const s = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return s || "projet";
}

export function parseStack(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const t of raw.split(",").map((x) => x.trim()).filter(Boolean)) {
    const k = t.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      tags.push(t);
    }
  }
  return tags;
}

export type ProjectInput = {
  name: string;
  description: string;
  context?: string;
  docs?: string;
  stack: string;
  visibility: string;
  demo_url?: string;
  weeks?: number;
};

function validateUrl(url: string): string {
  const u = url.trim();
  if (!u) return "";
  if (u.length > 300) throw new AppError("Le lien de démo est trop long.");
  try {
    const parsed = new URL(u);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    return parsed.href;
  } catch {
    throw new AppError("Le lien de démo doit être une adresse http(s) valide.");
  }
}

function cleanFields(i: ProjectInput, forUpdate = false) {
  const description = i.description.trim();
  const context = (i.context ?? "").trim();
  const docs = (i.docs ?? "").trim();
  const tags = parseStack(i.stack);
  if (description.length < 10 || description.length > 300) throw new AppError("La description doit faire entre 10 et 300 caractères.");
  if (context.length > 2000) throw new AppError("Le contexte est limité à 2 000 caractères.");
  if (docs.length > 5000) throw new AppError("La documentation est limitée à 5 000 caractères.");
  if (tags.length < 1 || tags.length > 10) throw new AppError("Indiquez entre 1 et 10 technologies (séparées par des virgules).");
  if (tags.some((t) => t.length > 24)) throw new AppError("Chaque technologie est limitée à 24 caractères.");
  if (!["public", "private"].includes(i.visibility)) throw new AppError("Visibilité invalide.");
  const out = { description, context, docs, stack: tags.join(", "), visibility: i.visibility as "public" | "private", demo_url: validateUrl(i.demo_url ?? "") };
  if (forUpdate) return out;
  const name = i.name.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > 70) throw new AppError("Le nom du projet doit faire entre 3 et 70 caractères.");
  const weeks = Number(i.weeks ?? 6);
  if (![4, 5, 6].includes(weeks)) throw new AppError("La durée du sprint doit être de 4, 5 ou 6 semaines.");
  return { ...out, name, weeks };
}

export async function createProject(userId: string, input: ProjectInput, archiveFiles?: FileRec[]): Promise<Project> {
  const f = cleanFields(input) as ReturnType<typeof cleanFields> & { name: string; weeks: number };
  const base = slugify(f.name);

  const slug = await tx(async (q) => {
    let slug = base;
    for (let i = 2; (await q("select 1 from projects where slug = $1", [slug])).length; i++) slug = `${base}-${i}`;

    const id = randomUUID();
    const ends = new Date(Date.now() + f.weeks * 7 * 86400_000);
    await q(
      `insert into projects (id, owner_id, slug, name, description, context, docs, stack, visibility, demo_url, sprint_weeks, sprint_ends_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [id, userId, slug, f.name, f.description, f.context, f.docs, f.stack, f.visibility, f.demo_url, f.weeks, ends]
    );

    const files =
      archiveFiles && archiveFiles.length
        ? archiveFiles
        : [makeFile("README.md", Buffer.from(readmeFor(f.name, f.description, f.context, f.docs, f.stack), "utf8"), true)];
    await createVersion(q, { projectId: id, kind: "initial", title: "Version initiale", authorId: userId, files });
    await logAction(q, id, userId, "project.created", f.name);
    return slug;
  });

  return (await getProjectBySlug(slug))!;
}

function readmeFor(name: string, description: string, context: string, docs: string, stack: string): string {
  const parts = [`# ${name}`, "", description];
  if (context) parts.push("", "## Contexte", "", context);
  if (docs) parts.push("", "## Documentation", "", docs);
  parts.push("", "## Stack", "", ...stack.split(", ").map((s) => `- ${s}`), "");
  return parts.join("\n");
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const rows = await query<Project>(`${PROJECT_SELECT} where p.slug = $1`, [slug]);
  return rows[0] ?? null;
}

export async function getAccess(project: Project, user: { id: string } | null): Promise<Access> {
  if (user && project.owner_id === user.id) return { role: "owner", canView: true, canSeeFiles: true, canSubmit: true, canDecide: true };
  if (user) {
    const m = await query<{ role: "contribute" | "view" }>(
      "select role from project_members where project_id = $1 and user_id = $2 and status = 'accepted'",
      [project.id, user.id]
    );
    if (m[0]) return { role: m[0].role, canView: true, canSeeFiles: true, canSubmit: m[0].role === "contribute", canDecide: false };
  }
  if (project.visibility === "public") return { role: "public", canView: true, canSeeFiles: false, canSubmit: false, canDecide: false };
  return { role: "none", canView: false, canSeeFiles: false, canSubmit: false, canDecide: false };
}

export const listOwnedProjects = (userId: string) =>
  query<Project>(`${PROJECT_SELECT} where p.owner_id = $1 order by p.created_at desc`, [userId]);

export const listCollaborations = (userId: string) =>
  query<Project>(
    `${PROJECT_SELECT} where p.id in (select project_id from project_members where user_id = $1 and status = 'accepted')
      order by p.created_at desc`,
    [userId]
  );

export async function listPublicProjects(search = ""): Promise<Project[]> {
  const s = search.trim().slice(0, 60);
  if (s) {
    // Recherche insensible à la casse et aux accents.
    const folded = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const like = "%" + folded.replace(/[%_\\]/g, "\\$&") + "%";
    return query<Project>(
      `${PROJECT_SELECT} where p.visibility = 'public'
          and translate(lower(p.name || ' ' || p.description || ' ' || p.stack), 'àâäáãéèêëíîïóôöõúùûüçñ', 'aaaaaeeeeiiioooouuuucn') like $1
        order by (p.status = 'delivered') desc, p.created_at desc limit 60`,
      [like]
    );
  }
  return query<Project>(`${PROJECT_SELECT} where p.visibility = 'public' order by (p.status = 'delivered') desc, p.created_at desc limit 60`);
}

export async function updateProject(user: { id: string }, project: Project, input: ProjectInput): Promise<void> {
  if (project.owner_id !== user.id) throw forbidden("Seul le propriétaire peut modifier le projet.");
  const f = cleanFields(input, true);
  await tx(async (q) => {
    await q(
      "update projects set description=$2, context=$3, docs=$4, stack=$5, visibility=$6, demo_url=$7 where id=$1",
      [project.id, f.description, f.context, f.docs, f.stack, f.visibility, f.demo_url]
    );
    await logAction(q, project.id, user.id, "project.updated");
  });
}

export async function deliverProject(user: { id: string }, project: Project): Promise<void> {
  if (project.owner_id !== user.id) throw forbidden("Seul le propriétaire peut marquer le projet comme livré.");
  if (project.status === "delivered") throw new AppError("Ce projet est déjà livré.");
  if (!project.demo_url) throw new AppError("Ajoutez un lien de démo déployée (onglet Paramètres) avant de livrer le projet.");
  await tx(async (q) => {
    await q("update projects set status = 'delivered', delivered_at = now() where id = $1", [project.id]);
    await logAction(q, project.id, user.id, "project.delivered", project.name);
  });
}

export type Contributor = { user_id: string; name: string; count: number; titles: string[] };

/** Contributeurs crédités : auteurs des contributions acceptées. */
export async function listContributors(projectId: string): Promise<Contributor[]> {
  const rows = await query<{ user_id: string; name: string; title: string }>(
    `select c.author_id as user_id, u.name, c.title
       from contributions c join users u on u.id = c.author_id
      where c.project_id = $1 and c.status = 'accepted' order by c.decided_at`,
    [projectId]
  );
  const map = new Map<string, Contributor>();
  for (const r of rows) {
    const c = map.get(r.user_id) ?? { user_id: r.user_id, name: r.name, count: 0, titles: [] };
    c.count++;
    c.titles.push(r.title);
    map.set(r.user_id, c);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export type AcceptedByProject = { project_name: string; slug: string; count: number; titles: string[] };

export async function acceptedContributionsOf(userId: string): Promise<AcceptedByProject[]> {
  const rows = await query<{ project_name: string; slug: string; title: string }>(
    `select p.name as project_name, p.slug, c.title
       from contributions c join projects p on p.id = c.project_id
      where c.author_id = $1 and c.status = 'accepted' and p.visibility = 'public' order by c.decided_at desc`,
    [userId]
  );
  const map = new Map<string, AcceptedByProject>();
  for (const r of rows) {
    const e = map.get(r.slug) ?? { project_name: r.project_name, slug: r.slug, count: 0, titles: [] };
    e.count++;
    e.titles.push(r.title);
    map.set(r.slug, e);
  }
  return [...map.values()];
}
