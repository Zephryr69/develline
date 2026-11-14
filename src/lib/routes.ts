import {
  LuLayoutDashboard,
  LuFolderPlus,
  LuUser,
  LuFolderOpen,
  LuBookOpen,
  LuShield,
  LuCircleHelp,
  LuFileText,
  LuLock,
} from "react-icons/lu";

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

// ========== AJOUTS MANQUANTS ==========

export type SidebarItem = {
  href: string;
  label: string;
  icon: React.ComponentType;
};

export const WORKSPACE_ITEMS: SidebarItem[] = [
  { href: PATHS.dashboard, label: "Tableau de bord", icon: LuLayoutDashboard },
  { href: PATHS.newProject, label: "Nouveau projet", icon: LuFolderPlus },
  { href: PATHS.profile, label: "Profil", icon: LuUser },
];

export const DISCOVER_ITEMS: SidebarItem[] = [
  { href: PATHS.publicProjects, label: "Projets publics", icon: LuFolderOpen },
  { href: PATHS.docs, label: "Documentation", icon: LuBookOpen },
  { href: PATHS.security, label: "Sécurité", icon: LuShield },
  { href: PATHS.faq, label: "FAQ", icon: LuCircleHelp },
];

export const RESOURCES: Record<string, { title: string; body: string }> = {
  documentation: {
    title: "Documentation",
    body: "Bienvenue dans la documentation de DEVEL line. Ici vous trouverez toutes les informations pour bien démarrer et utiliser la plateforme.",
  },
  securite: {
    title: "Sécurité",
    body: "La sécurité est au cœur de DEVEL line. Nous protégeons vos projets et vos données avec des pratiques modernes.",
  },
  faq: {
    title: "FAQ",
    body: "Retrouvez ici les réponses aux questions les plus fréquentes concernant DEVEL line.",
  },
  "mentions-legales": {
    title: "Mentions légales",
    body: "Mentions légales de la plateforme DEVEL line.",
  },
  confidentialite: {
    title: "Politique de confidentialité",
    body: "Politique de confidentialité et de protection des données personnelles.",
  },
};