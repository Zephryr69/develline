import type { Metadata } from "next";
import CreateProjectForm from "@/components/forms/CreateProjectForm";
import { PageHead, Panel } from "@/components/ui/Primitives";
import { requireUser } from "@/server/auth";
import { LIMITS } from "@/server/zip";
import { PATHS } from "@/lib/routes";

export const metadata: Metadata = { title: "Créer un projet" };

export default async function NewProjectPage() {
  await requireUser(PATHS.newProject);
  return (
    <>
      <PageHead crumb="PROJETS / NOUVEAU" title="Créer un projet" description="Posez les bases de votre sprint. Vous pourrez modifier ces informations plus tard." />
      <Panel maxWidth={820}>
        <CreateProjectForm maxMb={Math.round(LIMITS.maxZipBytes / 1048576)} />
      </Panel>
    </>
  );
}
