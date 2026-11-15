import { NextResponse } from "next/server";
import { DB_ENV_NAMES, getDatabaseUrl, query } from "@/db";
import { classifyDbError } from "@/server/db-errors";

export const dynamic = "force-dynamic";

/** Diagnostic : /api/health indique si la base de données est configurée et joignable (sans rien divulguer de secret). */
export async function GET() {
  const driver = getDatabaseUrl() ? "postgresql" : process.env.VERCEL ? "aucune base configurée" : "pglite (local)";
  // Noms (jamais les valeurs) des variables liées à la base, pour diagnostiquer une mauvaise configuration.
  const recognized = DB_ENV_NAMES.filter((n) => process.env[n]);
  const related = Object.keys(process.env).filter((k) => /(DATABASE|POSTGRES|PGHOST|NEON)/i.test(k)).sort();
  try {
    const [{ n }] = await query<{ n: number }>("select count(*)::int as n from users");
    return NextResponse.json({ ok: true, database: "ok", driver, users: n, recognized }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[DEVEL line] health :", e);
    const db = classifyDbError(e);
    return NextResponse.json(
      { ok: false, database: db?.kind ?? "other", driver, recognized, variablesLiéesÀLaBase: related, hint: db?.message ?? "Erreur inattendue : consultez les journaux de l’hébergeur." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
