import type { IconType } from "react-icons";
import {
  LuBadgeCheck,
  LuCompass,
  LuDownload,
  LuFileDiff,
  LuFolderOpen,
  LuFolderPlus,
  LuHistory,
  LuLayoutDashboard,
  LuLogIn,
  LuPalette,
  LuShieldAlert,
  LuUserRound,
  LuUsersRound,
  LuArchive,
} from "react-icons/lu";

export const PATHS = {
  dashboard: "/espace",
  create: "/espace/creer",
  project: "/espace/projet",
  members: "/espace/membres",
  copy: "/espace/copie",
  submit: "/espace/soumettre",
  review: "/espace/revue",
  versions: "/espace/versions",
  denied: "/espace/acces-refuse",
  card: "/espace/ship-card",
  profile: "/espace/profil",
  public: "/espace/projets-publics",
  auth: "/espace/connexion",
  design: "/espace/design-system",
  files: "/espace/fichiers",
  contributions: "/espace/contributions",
  archiveError: "/espace/archive-refusee",
  docs: "/espace/ressources/documentation",
  security: "/espace/ressources/securite",
  faq: "/espace/ressources/faq",
  legal: "/espace/ressources/mentions-legales",
  privacy: "/espace/ressources/confidentialite",
} as const;

export type SidebarItem = { href: string; label: string; icon: IconType };

export const WORKSPACE_ITEMS: SidebarItem[] = [
  { href: PATHS.dashboard, label: "Tableau de bord", icon: LuLayoutDashboard },
  { href: PATHS.create, label: "Créer un projet", icon: LuFolderPlus },
  { href: PATHS.project, label: "Fiche projet", icon: LuFolderOpen },
  { href: PATHS.members, label: "Membres et invitations", icon: LuUsersRound },
  { href: PATHS.copy, label: "Copie de travail", icon: LuDownload },
  { href: PATHS.submit, label: "Soumettre un ZIP", icon: LuArchive },
  { href: PATHS.review, label: "Revue des changements", icon: LuFileDiff },
  { href: PATHS.versions, label: "Historique des versions", icon: LuHistory },
  { href: PATHS.denied, label: "Accès refusé", icon: LuShieldAlert },
  { href: PATHS.card, label: "Ship Card publique", icon: LuBadgeCheck },
  { href: PATHS.profile, label: "Profil membre", icon: LuUserRound },
];

export const DISCOVER_ITEMS: SidebarItem[] = [
  { href: PATHS.public, label: "Projets publics", icon: LuCompass },
  { href: PATHS.auth, label: "Connexion / inscription", icon: LuLogIn },
  { href: PATHS.design, label: "Mini design system", icon: LuPalette },
];

export const RESOURCES: Record<string, { title: string; body: string }> = {
  documentation: {
    title: "Documentation",
    body: "Créez un projet, invitez votre équipe, puis téléchargez une copie de travail. Les contributions sont proposées sous forme de ZIP et revues par le propriétaire.",
  },
  securite: {
    title: "Sécurité des archives",
    body: "En production, validez les archives côté serveur : taille, extension, chemins, fichiers sensibles et contenu. Ne faites jamais confiance au seul nom du fichier.",
  },
  faq: {
    title: "Questions fréquentes",
    body: "Faut-il connaître Git ? Non. Le parcours est conçu autour de copies de travail et d’archives ZIP. La démo est-elle hébergée ici ? Non, utilisez un lien externe.",
  },
  "mentions-legales": {
    title: "Mentions légales",
    body: "Cette page est une maquette de démonstration. Les mentions légales de la plateforme seront à compléter avant mise en production.",
  },
  confidentialite: {
    title: "Confidentialité",
    body: "Cette maquette ne transmet pas vos formulaires à un serveur. Les informations du prototype restent en mémoire dans votre navigateur jusqu’au rechargement.",
  },
};
