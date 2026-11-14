import type { Metadata } from "next";
import { LuSearch } from "react-icons/lu";
import ProjectCard from "@/components/ProjectCard";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { listPublicProjects } from "@/server/projects";
import { publicProjectPath, PATHS } from "@/lib/routes";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Projets publics" };
export const dynamic = "force-dynamic";

export default async function PublicProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const projects = await listPublicProjects(q);

  return (
    <div className={`container ${styles.wrap}`}>
      <span className="eyebrow">DÉCOUVRIR</span>
      <h1 className={styles.title}>Projets publics</h1>
      <p className={styles.lead}>Des projets réels, construits en équipe, avec leurs versions et leurs contributeurs.</p>

      <form className={styles.search} role="search" action={PATHS.publicProjects}>
        <LuSearch />
        <input name="q" defaultValue={q} placeholder="Rechercher par nom, description ou technologie" aria-label="Rechercher un projet" maxLength={60} />
        <Button type="submit" variant="primary" size="sm">
          Rechercher
        </Button>
      </form>

      {projects.length === 0 ? (
        <EmptyState icon={<LuSearch />} title={q ? "Aucun projet trouvé" : "Aucun projet public pour le moment"}>
          <p>{q ? "Essayez un autre mot-clé." : "Soyez le premier à publier un projet."}</p>
          <Button variant="primary" href={PATHS.newProject}>
            Créer un projet
          </Button>
        </EmptyState>
      ) : (
        <div className={styles.grid}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} href={publicProjectPath(p.slug)} />
          ))}
        </div>
      )}
    </div>
  );
}
