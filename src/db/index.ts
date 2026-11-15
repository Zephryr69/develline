import path from "node:path";
import { SCHEMA_SQL } from "./schema";

export type Row = Record<string, any>;
export type Query = <T = Row>(sql: string, params?: unknown[]) => Promise<T[]>;

type Driver = {
  close: () => Promise<void>;
  query: Query;
  tx: <T>(fn: (q: Query) => Promise<T>) => Promise<T>;
};

/** Noms de variables acceptés (Neon, Vercel Postgres, Supabase…), dans l'ordre de préférence. */
export const DB_ENV_NAMES = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "NEON_DATABASE_URL",
] as const;

export function getDatabaseUrl(): string | undefined {
  for (const name of DB_ENV_NAMES) {
    const v = process.env[name]?.trim();
    if (v) return v;
  }
  return undefined;
}

/**
 * Nettoie l'URL PostgreSQL : retire les options (sslmode, channel_binding…) que les hébergeurs ajoutent
 * et que le pilote interprète mal selon les versions ; le SSL est configuré séparément.
 */
export function prepareConnectionString(raw: string): { connectionString: string; local: boolean } {
  const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
  try {
    const u = new URL(trimmed);
    for (const k of ["sslmode", "channel_binding", "sslrootcert", "ssl"]) u.searchParams.delete(k);
    return { connectionString: u.toString(), local: /^(localhost|127\.0\.0\.1|\[::1\])$/.test(u.hostname) };
  } catch {
    return { connectionString: trimmed, local: /localhost|127\.0\.0\.1/.test(trimmed) };
  }
}

const g = globalThis as unknown as { __dlDb?: Promise<Driver> };

async function createDriver(): Promise<Driver> {
  const url = getDatabaseUrl();

  if (url) {
    const { Pool } = await import("pg");
    const { connectionString, local } = prepareConnectionString(url);
    // SSL géré explicitement (Neon, Supabase, etc. l'exigent) ; désactivable avec DATABASE_SSL=false.
    const ssl = process.env.DATABASE_SSL === "false" || local ? undefined : { rejectUnauthorized: false };
    const pool = new Pool({ connectionString, ssl, max: 5, connectionTimeoutMillis: 10_000 });

    // Création du schéma sous verrou : plusieurs instances serverless peuvent démarrer en même temps.
    const init = await pool.connect();
    try {
      await init.query("begin");
      await init.query("select pg_advisory_xact_lock(727274)");
      await init.query(SCHEMA_SQL);
      await init.query("commit");
    } catch (e) {
      await init.query("rollback").catch(() => {});
      await pool.end().catch(() => {});
      throw e;
    } finally {
      init.release();
    }

    return {
      close: () => pool.end(),
      query: async (sql, params) => (await pool.query(sql, params as any[])).rows as any,
      tx: async (fn) => {
        const client = await pool.connect();
        try {
          await client.query("begin");
          const result = await fn(async (sql, params) => (await client.query(sql, params as any[])).rows as any);
          await client.query("commit");
          return result;
        } catch (e) {
          await client.query("rollback").catch(() => {});
          throw e;
        } finally {
          client.release();
        }
      },
    };
  }

  // Sur Vercel (ou tout hébergeur serverless), le disque est en lecture seule et éphémère :
  // sans base PostgreSQL, les données seraient perdues. On échoue avec un message clair.
  if (process.env.VERCEL && !process.env.PGLITE_DIR) {
    throw new Error(
      "DATABASE_URL est manquante. Créez une base PostgreSQL (Neon, Supabase…), ajoutez son URL dans les variables d’environnement du projet Vercel (environnement Production), puis redéployez."
    );
  }

  // Développement local sans configuration : PostgreSQL embarqué (PGlite).
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  const pg = dir === "memory" ? new PGlite() : new PGlite(dir);
  await pg.exec(SCHEMA_SQL);
  return {
    close: () => pg.close(),
    query: async (sql, params) => (await pg.query(sql, params as any[])).rows as any,
    tx: async (fn) =>
      pg.transaction(async (t) => fn(async (sql, params) => (await t.query(sql, params as any[])).rows as any)),
  };
}

export function getDb(): Promise<Driver> {
  if (!g.__dlDb) {
    g.__dlDb = createDriver().catch((e) => {
      g.__dlDb = undefined;
      throw e;
    });
  }
  return g.__dlDb;
}

/** Ferme proprement la connexion (scripts et tests). */
export async function closeDb(): Promise<void> {
  if (g.__dlDb) {
    const d = await g.__dlDb;
    g.__dlDb = undefined;
    await d.close();
  }
}

export async function query<T = Row>(sql: string, params?: unknown[]): Promise<T[]> {
  return (await getDb()).query<T>(sql, params);
}

export async function tx<T>(fn: (q: Query) => Promise<T>): Promise<T> {
  return (await getDb()).tx(fn);
}

/** Convertit un champ bytea (Buffer ou Uint8Array selon le pilote) en Buffer. */
export function toBuffer(v: unknown): Buffer {
  if (Buffer.isBuffer(v)) return v;
  if (v instanceof Uint8Array) return Buffer.from(v);
  throw new Error("Valeur binaire invalide");
}
