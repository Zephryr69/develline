import Link from "next/link";
import { LuArchive } from "react-icons/lu";
import AccessDenied from "@/components/AccessDenied";
import Button from "@/components/ui/Button";
import { Avatar, Badge, EmptyState, ListRow, Panel, RowMain } from "@/components/ui/Primitives";
import { projectCtx } from "@/server/context";
import { listContributions } from "@/server/contributions";
import { initials, timeAgo } from "@/lib/format";
import { projectPath } from "@/lib/routes";

const STATUS = {
  pending: { label: "En validation", tone: "warn" },
  accepted: { label: "Acceptée", tone: "ok" },
  rejected: { label: "Rejetée", tone: "error" },
} as const;

export default async function ContributionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await projectCtx(slug);
  if ("denied" in ctx) return <AccessDenied />;
  const { project, access } = ctx;
  const list = await listContributions(project.id);

  return (
    <Panel>
      {list.length === 0 ? (
        <EmptyState icon={<LuArchive />} title="Aucune contribution">
          <p>Les propositions de l’équipe apparaîtront ici.</p>
          {access.canSubmit && project.status === "active" && (
            <Button variant="primary" href={projectPath(slug, "/contributions/nouvelle")}>
              Proposer une contribution
            </Button>
          )}
        </EmptyState>
      ) : (
        <>
          {access.canSubmit && project.status === "active" && (
            <div style={{ marginBottom: 14 }}>
              <Button variant="primary" size="sm" href={projectPath(slug, "/contributions/nouvelle")}>
                Proposer une contribution
              </Button>
            </div>
          )}
          {list.map((c) => (
            <ListRow key={c.id} wrap>
              <Avatar initials={initials(c.author_name)} />
              <RowMain
                title={<Link href={projectPath(slug, `/contributions/${c.id}`)}>{c.title}</Link>}
                sub={`${c.author_name} · base ${c.base_label}${c.result_label ? ` → ${c.result_label}` : ""} · ${timeAgo(c.created_at)}`}
              />
              <Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge>
              <Button variant="outline" size="sm" href={projectPath(slug, `/contributions/${c.id}`)}>
                {c.status === "pending" && access.canDecide ? "Revoir" : "Détails"}
              </Button>
            </ListRow>
          ))}
        </>
      )}
    </Panel>
  );
}
