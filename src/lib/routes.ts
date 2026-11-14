export const PATHS = {
  home: "/",
  login: "/connexion",
  register: "/inscription",
  dashboard: "/app",
  newProject: "/app/projets/nouveau",
  profile: "/app/profil",
  publicProjects: "/projets",
  docs: "/ressources/documentation",
  security: "/ressources/securite",
  faq: "/ressources/faq",
  legal: "/ressources/mentions-legales",
  privacy: "/ressources/confidentialite",
} as const;

export const projectPath = (slug: string, sub = "") => `/app/projets/${slug}${sub}`;
export const publicProjectPath = (slug: string) => `/projets/${slug}`;
export const shipPath = (slug: string) => `/ship/${slug}`;

/** Chemin de retour sûr après connexion (évite les redirections ouvertes). */
export function safeNext(next: string | undefined | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) return next;
  return PATHS.dashboard;
}
