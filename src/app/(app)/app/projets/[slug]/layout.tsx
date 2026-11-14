import Link from "next/link";
import { LuBadgeCheck, LuEye, LuLock } from "react-icons/lu";
import AccessDenied from "@/components/AccessDenied";
import SprintBadge from "@/components/SprintBadge";
import Tabs from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Primitives";
import { projectCtx } from "@/server/context";
import { query } from "@/db";
import { projectPath, publicProjectPath, shipPath } from "@/lib/routes";
import styles from "./layout.module.css";

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await projectCtx(slug);
  if ("denied" in ctx) return <AccessDenied />;
  const { project, access } = ctx;

  const [{ n }] = await query<{ n: number }>("select count(*)::int as n from contributions where project_id = $1 and status = 'pending'", [project.id]);
  const base = projectPath(slug);
  const tabs = [
    { href: base, label: "Aperçu", exact: true },
    { href: `${base}/fichiers`, label: "Fichiers" },
    { href: `${base}/contributions`, label: "Contributions", count: access.canDecide ? n : 0 },
    { href: `${base}/versions`, label: "Versions" },
    { href: `${base}/membres`, label: "Membres" },
    ...(access.canDecide ? [{ href: `${base}/parametres`, label: "Paramètres" }] : []),
  ];

  return (
    <>
      <div className={styles.head}>
        <div>
          <div className={styles.crumb}>
            <Link href="/app">Mes projets</Link> / {project.name}
          </div>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <div className={styles.badges}>
          <SprintBadge project={project} />
          <Badge tone="neutral">
            {project.visibility === "public" ? <LuEye /> : <LuLock />} {project.visibility === "public" ? "Public" : "Privé"}
          </Badge>
          <Badge tone="neutral">
            {access.role === "owner" ? "Propriétaire" : access.role === "contribute" ? "Contributeur" : "Lecteur"}
          </Badge>
          {project.visibility === "public" && (
            <Link href={publicProjectPath(slug)} className={styles.link}>
              Page publique
            </Link>
          )}
          {project.status === "delivered" && project.visibility === "public" && (
            <Link href={shipPath(slug)} className={styles.link}>
              <LuBadgeCheck /> Ship Card
            </Link>
          )}
        </div>
      </div>
      <Tabs items={tabs} />
      {children}
    </>
  );
}
