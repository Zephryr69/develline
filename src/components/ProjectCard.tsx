import Link from "next/link";
import { LuBox, LuClock3, LuGitCommitHorizontal } from "react-icons/lu";
import { Tags } from "@/components/ui/Primitives";
import SprintBadge from "@/components/SprintBadge";
import { sprintInfo } from "@/lib/sprint";
import { plural, splitTags } from "@/lib/format";
import type { Project } from "@/server/projects";
import styles from "./ProjectCard.module.css";

export default function ProjectCard({ project, href, role }: { project: Project; href: string; role?: string }) {
  const info = sprintInfo(project);
  return (
    <Link href={href} className={styles.card}>
      <div className={styles.top}>
        <span className={styles.icon}>
          <LuBox />
        </span>
        <SprintBadge project={project} />
      </div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <Tags tags={splitTags(project.stack)} />
      <div className={styles.meta}>
        <span>
          <LuGitCommitHorizontal /> {project.current_label} · {project.version_count} {plural(project.version_count, "version", "versions")}
        </span>
        {info.state !== "delivered" && (
          <span>
            <LuClock3 /> {info.state === "expired" ? "Sprint expiré" : `${info.daysLeft} j restants`}
          </span>
        )}
        <span className={styles.owner}>{role ?? `Par ${project.owner_name}`}</span>
      </div>
    </Link>
  );
}
