"use server";

import { redirect } from "next/navigation";
import { acceptContribution, rejectContribution } from "@/server/contributions";
import { restoreVersion } from "@/server/versions";
import { guarded, loadProject, refresh, str } from "./helpers";
import { projectPath } from "@/lib/routes";
import type { ActionState } from "@/lib/action-state";

export async function acceptAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const slug = str(fd, "slug");
    const { user, project } = await loadProject(slug);
    await acceptContribution(user, project, str(fd, "id"));
    refresh(slug);
    redirect(projectPath(slug, "/versions"));
  });
}

export async function rejectAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const slug = str(fd, "slug");
    const { user, project } = await loadProject(slug);
    await rejectContribution(user, project, str(fd, "id"), str(fd, "note"));
    refresh(slug);
    redirect(projectPath(slug, "/contributions"));
  });
}

export async function restoreAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const slug = str(fd, "slug");
    const { user, project } = await loadProject(slug);
    const { label } = await restoreVersion(user, project, str(fd, "versionId"));
    refresh(slug);
    return { ok: `Restauration effectuée : nouvelle version ${label}.` };
  });
}
