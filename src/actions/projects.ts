"use server";

import { redirect } from "next/navigation";
import { deliverProject, updateProject } from "@/server/projects";
import { guarded, loadProject, refresh, str } from "./helpers";
import { shipPath } from "@/lib/routes";
import type { ActionState } from "@/lib/action-state";

export async function updateProjectAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const slug = str(fd, "slug");
    const { user, project } = await loadProject(slug);
    await updateProject(user, project, {
      name: project.name,
      description: str(fd, "description"),
      context: str(fd, "context"),
      docs: str(fd, "docs"),
      stack: str(fd, "stack"),
      visibility: str(fd, "visibility"),
      demo_url: str(fd, "demo_url"),
    });
    refresh(slug);
    return { ok: "Projet mis à jour." };
  });
}

export async function deliverAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const slug = str(fd, "slug");
    const { user, project } = await loadProject(slug);
    await deliverProject(user, project);
    refresh(slug);
    redirect(shipPath(slug));
  });
}
