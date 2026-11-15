import { revalidatePath } from "next/cache";
import { AppError } from "@/server/errors";
import { classifyDbError } from "@/server/db-errors";
import { ArchiveError } from "@/server/zip";
import { getCurrentUser } from "@/server/auth";
import { getAccess, getProjectBySlug, type Project, type Access } from "@/server/projects";
import type { User } from "@/server/auth-core";
import type { ActionState } from "@/lib/action-state";

/** Exécute une action serveur et convertit les erreurs métier en message affichable. */
export async function guarded(fn: () => Promise<ActionState | void>): Promise<ActionState> {
  try {
    return (await fn()) ?? {};
  } catch (e) {
    const digest = (e as { digest?: string })?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
    if (e instanceof AppError || e instanceof ArchiveError) return { error: e.message, issues: e.issues };
    console.error("[DEVEL line] erreur d’action :", e);
    const db = classifyDbError(e);
    if (db) return { error: db.message };
    return { error: "Une erreur est survenue. Réessayez dans un instant." };
  }
}

export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function requireActionUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Session expirée : reconnectez-vous.", "forbidden");
  return user;
}

export async function loadProject(slug: string): Promise<{ user: User; project: Project; access: Access }> {
  const user = await requireActionUser();
  const project = await getProjectBySlug(slug);
  if (!project) throw new AppError("Projet introuvable.", "not_found");
  const access = await getAccess(project, user);
  if (!access.canView) throw new AppError("Vous n’avez pas accès à ce projet.", "forbidden");
  return { user, project, access };
}

export function refresh(slug?: string) {
  revalidatePath("/app", "layout");
  if (slug) {
    revalidatePath(`/ship/${slug}`);
    revalidatePath(`/projets/${slug}`);
  }
  revalidatePath("/projets");
}
