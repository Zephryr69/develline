import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LuBadgeCheck, LuBox, LuExternalLink, LuEye } from "react-icons/lu";
import Button from "@/components/ui/Button";
import ShareButtons from "@/components/ShareButtons";
import { Avatar, ListRow, MiniLabel, Notice, RowMain, Tags } from "@/components/ui/Primitives";
import { getCurrentUser } from "@/server/auth";
import { getAccess, getProjectBySlug, listContributors } from "@/server/projects";
import { getSiteUrl } from "@/server/site";
import { formatDate, initials, plural, splitTags } from "@/lib/format";
import { projectPath, publicProjectPath, shipPath } from "@/lib/routes";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p || p.visibility !== "public") return { title: "Ship Card" };
  return {
    title: `${p.name} — Ship Card`,
    description: p.description,
    openGraph: { title: `${p.name} — Ship Card DEVEL line`, description: p.description, type: "article" },
  };
}

export default async function ShipCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const published = project.status === "delivered" && project.visibility === "public";
  const user = await getCurrentUser();
  const access = await getAccess(project, user);
  const isMember = access.canSeeFiles;
  if (!published && !isMember) notFound();

  const contributors = await listContributors(project.id);
  const siteUrl = await getSiteUrl();
  const days = project.delivered_at
    ? Math.max(1, Math.round((new Date(project.delivered_at).getTime() - new Date(project.created_at).getTime()) / 86400_000))
    : null;
  const statusLabel = project.status === "delivered" ? "Livré" : "En cours";

  return (
    <div className={`container ${styles.wrap}`}>
      {!published && (
        <div className={styles.preview}>
          <Notice tone="warn">
            <LuEye style={{ display: "inline", marginRight: 6 }} />
            Aperçu réservé aux membres :{" "}
            {project.visibility === "private"
              ? "la Ship Card n’est publique que pour les projets publics."
              : "elle sera publique dès que le projet sera marqué comme livré."}
          </Notice>
        </div>
      )}

      <article className={styles.card}>
        <div className={styles.top}>
          <span className={styles.label}>DEVEL LINE / SHIP CARD</span>
          <span className={styles.verified}>
            <LuBadgeCheck /> {statusLabel.toUpperCase()}
          </span>
        </div>
        <div className={styles.body}>
          <div className={styles.icon}>
            <LuBox />
          </div>
          <h1>{project.name}</h1>
          <p className={styles.desc}>{project.description}</p>
          <Tags tags={splitTags(project.stack)} />

          <div className={styles.stats}>
            <div>
              <MiniLabel>STATUT</MiniLabel>
              <strong>{statusLabel}</strong>
            </div>
            <div>
              <MiniLabel>VERSION</MiniLabel>
              <strong>{project.current_label}</strong>
            </div>
            <div>
              <MiniLabel>HISTORIQUE</MiniLabel>
              <strong>
                {project.version_count} {plural(project.version_count, "version", "versions")}
              </strong>
            </div>
            <div>
              <MiniLabel>{days ? "LIVRÉ EN" : "SPRINT"}</MiniLabel>
              <strong>{days ? `${days} ${plural(days, "jour", "jours")}` : `${project.sprint_weeks} semaines`}</strong>
            </div>
          </div>

          <h2 className={styles.h2}>Contributeurs</h2>
          <ListRow>
            <Avatar initials={initials(project.owner_name)} />
            <RowMain title={project.owner_name} sub="Propriétaire · création et revue du projet" />
          </ListRow>
          {contributors.map((c) => (
            <ListRow key={c.user_id}>
              <Avatar initials={initials(c.name)} />
              <RowMain
                title={c.name}
                sub={`${c.count} ${plural(c.count, "contribution acceptée", "contributions acceptées")} · ${c.titles.slice(0, 2).join(", ")}${c.titles.length > 2 ? "…" : ""}`}
              />
            </ListRow>
          ))}

          <p className={styles.note}>
            Les contributions listées ont été relues et acceptées par le propriétaire du projet sur DEVEL line.
            {project.delivered_at ? ` Livré le ${formatDate(project.delivered_at)}.` : ""}
          </p>

          <div className={styles.actions}>
            {project.demo_url && (
              <Button variant="primary" href={project.demo_url} external>
                Voir la démo <LuExternalLink />
              </Button>
            )}
            <Button variant="outline" href={publicProjectPath(project.slug)}>
              Fiche du projet
            </Button>
            {isMember && (
              <Button variant="outline" href={projectPath(project.slug)}>
                Espace du projet
              </Button>
            )}
          </div>
          {published && (
            <div className={styles.share}>
              <MiniLabel>PARTAGER</MiniLabel>
              <ShareButtons url={`${siteUrl}${shipPath(project.slug)}`} title={`Découvrez ${project.name} sur DEVEL line`} />
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
