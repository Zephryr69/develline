import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LuArrowUpRight, LuBadgeCheck, LuExternalLink, LuLayoutDashboard } from "react-icons/lu";
import Button from "@/components/ui/Button";
import SprintBadge from "@/components/SprintBadge";
import { Avatar, ListRow, MiniLabel, Notice, Panel, RowMain, Tags } from "@/components/ui/Primitives";
import { getCurrentUser } from "@/server/auth";
import { getAccess, getProjectBySlug, listContributors } from "@/server/projects";
import { formatDate, initials, plural, splitTags } from "@/lib/format";
import { PATHS, projectPath, shipPath } from "@/lib/routes";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  return p && p.visibility === "public" ? { title: p.name, description: p.description } : { title: "Projet" };
}

export default async function PublicProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const user = await getCurrentUser();
  const access = await getAccess(project, user);
  if (!access.canView) notFound();

  const contributors = await listContributors(project.id);
  const isMember = access.role === "owner" || access.role === "contribute" || access.role === "view";
  const published = project.status === "delivered" && project.visibility === "public";

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.head}>
        <div>
          <span className="eyebrow">PROJET PUBLIC</span>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <Tags tags={splitTags(project.stack)} />
        </div>
        <div className={styles.side}>
          <SprintBadge project={project} />
          <div className={styles.actions}>
            {isMember && (
              <Button variant="primary" href={projectPath(project.slug)}>
                <LuLayoutDashboard /> Ouvrir l’espace du projet
              </Button>
            )}
            {published && (
              <Button variant={isMember ? "outline" : "primary"} href={shipPath(project.slug)}>
                <LuBadgeCheck /> Voir la Ship Card
              </Button>
            )}
            {project.demo_url && (
              <Button variant="outline" href={project.demo_url} external>
                Voir la démo <LuExternalLink />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.col}>
          {project.context && (
            <Panel>
              <h2>Contexte</h2>
              <p className={styles.text}>{project.context}</p>
            </Panel>
          )}
          <Panel>
            <h2>Contributeurs</h2>
            <ListRow>
              <Avatar initials={initials(project.owner_name)} />
              <RowMain title={project.owner_name} sub="Propriétaire · création du projet" />
            </ListRow>
            {contributors.length === 0 ? (
              <p className={styles.text}>Les contributions acceptées apparaîtront ici.</p>
            ) : (
              contributors.map((c) => (
                <ListRow key={c.user_id}>
                  <Avatar initials={initials(c.name)} />
                  <RowMain title={c.name} sub={`${c.count} ${plural(c.count, "contribution acceptée", "contributions acceptées")}`} />
                </ListRow>
              ))
            )}
          </Panel>
        </div>
        <div className={styles.col}>
          <Panel>
            <MiniLabel>EN BREF</MiniLabel>
            <dl className={styles.facts}>
              <div><dt>Version</dt><dd>{project.current_label}</dd></div>
              <div><dt>Historique</dt><dd>{project.version_count} {plural(project.version_count, "version", "versions")}</dd></div>
              <div><dt>Sprint</dt><dd>{project.sprint_weeks} semaines</dd></div>
              <div><dt>Créé le</dt><dd>{formatDate(project.created_at)}</dd></div>
              {project.delivered_at && <div><dt>Livré le</dt><dd>{formatDate(project.delivered_at)}</dd></div>}
            </dl>
          </Panel>
          {!isMember && (
            <Notice>
              La collaboration se fait sur invitation du propriétaire. {user ? "" : <>
                <a className={styles.link} href={PATHS.login}>Connectez-vous</a> pour retrouver vos invitations.</>}
            </Notice>
          )}
          {!user && (
            <Button variant="outline" href={PATHS.newProject}>
              Créer mon projet <LuArrowUpRight />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
