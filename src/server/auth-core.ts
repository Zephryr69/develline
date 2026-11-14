import { createHash, randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { query } from "@/db";
import { AppError } from "./errors";

export type User = {
  id: string;
  email: string;
  name: string;
  bio: string;
  created_at: Date;
};

const SESSION_DAYS = 30;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 200;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// Limiteur de tentatives de connexion (mémoire du processus).
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function checkRate(key: string) {
  const a = attempts.get(key);
  if (a && Date.now() - a.first < WINDOW_MS && a.count >= MAX_ATTEMPTS) {
    throw new AppError("Trop de tentatives. Réessayez dans quelques minutes.");
  }
}
function failRate(key: string) {
  const a = attempts.get(key);
  if (!a || Date.now() - a.first >= WINDOW_MS) attempts.set(key, { count: 1, first: Date.now() });
  else a.count++;
}

export async function registerUser(input: { name: string; email: string; password: string }): Promise<User> {
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = normalizeEmail(input.email);
  if (name.length < 2 || name.length > 60) throw new AppError("Indiquez un nom entre 2 et 60 caractères.");
  if (!isEmail(email)) throw new AppError("Adresse e-mail invalide.");
  if (input.password.length < 8) throw new AppError("Le mot de passe doit contenir au moins 8 caractères.");
  if (input.password.length > 128) throw new AppError("Mot de passe trop long (128 caractères maximum).");

  const existing = await query("select 1 from users where lower(email) = $1", [email]);
  if (existing.length) throw new AppError("Un compte existe déjà avec cette adresse e-mail.", "conflict");

  const id = randomUUID();
  const hash = await bcrypt.hash(input.password, 10);
  const rows = await query<User>(
    "insert into users (id, email, name, password_hash) values ($1,$2,$3,$4) returning id, email, name, bio, created_at",
    [id, email, name, hash]
  );
  return rows[0];
}

export async function verifyLogin(emailRaw: string, password: string): Promise<User> {
  const email = normalizeEmail(emailRaw);
  checkRate(email);
  const rows = await query<User & { password_hash: string }>(
    "select id, email, name, bio, created_at, password_hash from users where lower(email) = $1",
    [email]
  );
  const row = rows[0];
  // Comparaison effectuée même si l'utilisateur n'existe pas (évite de révéler les comptes).
  const ok = await bcrypt.compare(password, row?.password_hash ?? "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!row || !ok) {
    failRate(email);
    throw new AppError("E-mail ou mot de passe incorrect.");
  }
  attempts.delete(email);
  const { password_hash: _ph, ...user } = row;
  return user;
}

export async function createSession(userId: string): Promise<{ token: string; expires: Date }> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await query("insert into sessions (id, user_id, expires_at) values ($1,$2,$3)", [hashToken(token), userId, expires]);
  return { token, expires };
}

export async function getUserByToken(token: string | undefined): Promise<User | null> {
  if (!token || token.length < 32) return null;
  const rows = await query<User>(
    `select u.id, u.email, u.name, u.bio, u.created_at
       from sessions s join users u on u.id = s.user_id
      where s.id = $1 and s.expires_at > now()`,
    [hashToken(token)]
  );
  return rows[0] ?? null;
}

export async function deleteSession(token: string | undefined): Promise<void> {
  if (token) await query("delete from sessions where id = $1", [hashToken(token)]);
}

export async function updateProfile(userId: string, input: { name: string; bio: string }): Promise<void> {
  const name = input.name.trim().replace(/\s+/g, " ");
  const bio = input.bio.trim();
  if (name.length < 2 || name.length > 60) throw new AppError("Indiquez un nom entre 2 et 60 caractères.");
  if (bio.length > 280) throw new AppError("La présentation est limitée à 280 caractères.");
  await query("update users set name = $2, bio = $3 where id = $1", [userId, name, bio]);
}
