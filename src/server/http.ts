import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { ArchiveError, LIMITS } from "./zip";
import { classifyDbError } from "./db-errors";

export function jsonError(e: unknown) {
  if (e instanceof ArchiveError) return NextResponse.json({ ok: false, error: e.message, issues: e.issues }, { status: 422 });
  if (e instanceof AppError) {
    const status = e.code === "forbidden" ? 403 : e.code === "not_found" ? 404 : e.code === "conflict" ? 409 : 400;
    return NextResponse.json({ ok: false, error: e.message, issues: e.issues }, { status });
  }
  console.error("[DEVEL line] erreur API :", e);
  const db = classifyDbError(e);
  return NextResponse.json({ ok: false, error: db?.message ?? "Une erreur est survenue. Réessayez." }, { status: 500 });
}

export const unauthorized = () => NextResponse.json({ ok: false, error: "Session expirée : reconnectez-vous." }, { status: 401 });

export function tooLarge(req: Request): boolean {
  const len = Number(req.headers.get("content-length") ?? 0);
  return len > LIMITS.maxZipBytes + 1024 * 1024;
}

/** Lit un fichier téléversé dans un FormData (null si absent ou vide). */
export async function readUpload(fd: FormData, field = "file"): Promise<{ name: string; buffer: Buffer } | null> {
  const f = fd.get(field);
  if (!f || typeof f === "string" || f.size === 0) return null;
  if (f.size > LIMITS.maxZipBytes) {
    throw new ArchiveError(`Archive trop volumineuse : la taille maximale est de ${Math.round(LIMITS.maxZipBytes / 1048576)} Mo.`);
  }
  return { name: f.name || "archive.zip", buffer: Buffer.from(await f.arrayBuffer()) };
}
