/** Classe une erreur de base de données pour afficher un message utile (sans jamais exposer d'identifiants). */
export type DbProblem = "missing_url" | "unreachable" | "auth" | "ssl" | "schema" | "other";

export function classifyDbError(e: unknown): { kind: DbProblem; message: string } | null {
  const err = e as { code?: string; message?: string } | null;
  const msg = String(err?.message ?? "");
  const code = String(err?.code ?? "");

  if (msg.includes("DATABASE_URL est manquante")) {
    return { kind: "missing_url", message: "Configuration incomplète : aucune variable d’URL de base de données n’est définie (DATABASE_URL). Ajoutez-la dans les variables d’environnement de l’hébergeur, puis redéployez." };
  }
  if (["28P01", "28000"].includes(code) || /password authentication|authentication failed/i.test(msg)) {
    return { kind: "auth", message: "La base de données refuse la connexion : identifiant ou mot de passe incorrect dans DATABASE_URL." };
  }
  if (/ssl|certificate|tls/i.test(msg) && !/ECONN|ENOTFOUND/.test(code)) {
    return { kind: "ssl", message: "Connexion sécurisée à la base impossible (SSL). Vérifiez DATABASE_URL, ou essayez DATABASE_SSL=false si votre base n’utilise pas SSL." };
  }
  if (["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN", "ENETUNREACH", "3D000"].includes(code) || /timeout|connect|getaddrinfo/i.test(msg)) {
    return { kind: "unreachable", message: "La base de données est inaccessible. Vérifiez l’adresse dans DATABASE_URL (avec Supabase, utilisez l’adresse « pooler »)." };
  }
  if (/relation .* does not exist|syntax error|permission denied/i.test(msg) || code.startsWith("42")) {
    return { kind: "schema", message: "La base de données est joignable mais le schéma n’a pas pu être créé : vérifiez que l’utilisateur a le droit de créer des tables." };
  }
  return null;
}
