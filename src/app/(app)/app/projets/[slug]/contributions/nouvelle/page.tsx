import type { Metadata } from "next";
import AccessDenied from "@/components/AccessDenied";
import ContributionForm from "@/components/forms/ContributionForm";
import { Notice, Panel } from "@/components/ui/Primitives";
import { projectCtx } from "@/server/context";
import { listVersions } from "@/server/versions";
import { LIMITS } from "@/server/zip";

export const metadata: Metadata = { title: "Nouvelle contribution" };

export default async function NewContributionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await projectCtx(slug);
  if ("denied" in ctx) return <AccessDenied />;
  const { project, access } = ctx;
  if (!access.canSubmit) return <AccessDenied message="Vous n’avez pas le droit de contribuer à ce projet. Demandez au propriétaire de vous accorder le droit « Contribuer »." />;
  if (project.status === "delivered") {
    return (
      <Panel>
        <Notice tone="warn">Ce projet est livré : il n’accepte plus de contributions.</Notice>
      </Panel>
    );
  }

  const versions = await listVersions(project.id);
  return (
    <Panel maxWidth={820}>
      <h2>Proposer une contribution</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
        Téléchargez la copie de travail (onglet Fichiers), modifiez-la en local, recompressez-la en ZIP puis déposez-la ici. L’archive est vérifiée avant d’être enregistrée.
      </p>
      <ContributionForm
        slug={slug}
        versions={versions.map((v) => v.label)}
        currentLabel={project.current_label!}
        maxMb={Math.round(LIMITS.maxZipBytes / 1048576)}
      />
    </Panel>
  );
}
