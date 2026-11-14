import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, deleteSession, getUserByToken, type User } from "./auth-core";

export const SESSION_COOKIE = "dl_session";

/** Utilisateur connecté (ou null). Mis en cache pour la durée d'une requête. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const jar = await cookies();
  return getUserByToken(jar.get(SESSION_COOKIE)?.value);
});

/** Exige une session : redirige vers la page de connexion sinon. */
export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

export async function startSession(userId: string): Promise<void> {
  const { token, expires } = await createSession(userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  await deleteSession(jar.get(SESSION_COOKIE)?.value);
  jar.delete(SESSION_COOKIE);
}
