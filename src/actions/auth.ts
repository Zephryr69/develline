"use server";

import { redirect } from "next/navigation";
import { registerUser, verifyLogin, updateProfile } from "@/server/auth-core";
import { endSession, startSession } from "@/server/auth";
import { guarded, refresh, requireActionUser, str } from "./helpers";
import { safeNext } from "@/lib/routes";
import type { ActionState } from "@/lib/action-state";

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await verifyLogin(str(fd, "email"), str(fd, "password"));
    await startSession(user.id);
    redirect(safeNext(str(fd, "next")));
  });
}

export async function registerAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await registerUser({ name: str(fd, "name"), email: str(fd, "email"), password: str(fd, "password") });
    await startSession(user.id);
    redirect(safeNext(str(fd, "next")));
  });
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

export async function updateProfileAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const user = await requireActionUser();
    await updateProfile(user.id, { name: str(fd, "name"), bio: str(fd, "bio") });
    refresh();
    return { ok: "Profil mis à jour." };
  });
}
