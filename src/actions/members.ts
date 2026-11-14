"use server";

import { redirect } from "next/navigation";
import { inviteMember, removeMember, respondByToken, respondToInvitation, setMemberRole } from "@/server/members";
import { guarded, loadProject, refresh, requireActionUser, str } from "./helpers";
import { projectPath } from "@/lib/routes";
import type { ActionState } from "@/lib/action-state";

export async function inviteAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const slug = str(fd, "slug");
    const { user, project } = await loadProject(slug);
    await inviteMember(user, project, str(fd, "email"), str(fd, "role"));
    refresh(slug);
    return { ok: "Invitation enregistrée. Partagez le lien d’invitation ci-dessous." };
  });
}

export async function respondInvitationAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireActionUser();
    const accept = str(fd, "accept") === "1";
    await respondToInvitation(user, str(fd, "memberId"), accept);
    refresh();
    return { ok: accept ? "Invitation acceptée." : "Invitation refusée." };
  });
}

export async function respondByTokenAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireActionUser();
    const accept = str(fd, "accept") === "1";
    const slug = await respondByToken(user, str(fd, "token"), accept);
    refresh(slug);
    redirect(accept ? projectPath(slug) : "/app");
  });
}

export async function removeMemberAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const slug = str(fd, "slug");
    const { user, project } = await loadProject(slug);
    await removeMember(user, project, str(fd, "memberId"));
    refresh(slug);
    return { ok: "Membre retiré du projet." };
  });
}

export async function setRoleAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const slug = str(fd, "slug");
    const { user, project } = await loadProject(slug);
    await setMemberRole(user, project, str(fd, "memberId"), str(fd, "role"));
    refresh(slug);
    return { ok: "Droit d’accès mis à jour." };
  });
}
