import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "./auth";
import { getAccess, getProjectBySlug, type Access, type Project } from "./projects";
import type { User } from "./auth-core";
import { projectPath, publicProjectPath } from "@/lib/routes";

export type ProjectCtx = { user: User; project: Project; access: Access };

/**
 * Charge le projet et les droits de l'utilisateur connecté.
 * - non connecté → page de connexion ; projet inconnu → 404 ;
 * - simple visiteur d'un projet public → fiche publique ;
 * - aucun droit (projet privé) → { denied: true } (la page affiche « Accès refusé »).
 */
export const projectCtx = cache(async (slug: string): Promise<ProjectCtx | { denied: true }> => {
  const user = await requireUser(projectPath(slug));
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const access = await getAccess(project, user);
  if (!access.canView) return { denied: true };
  if (access.role === "public") redirect(publicProjectPath(slug));
  return { user, project, access };
});
