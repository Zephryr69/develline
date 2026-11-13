"use client";

import Button from "@/components/ui/Button";
import { FormActions, Notice, PageHead, Panel, Paragraph } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";

export default function ArchiveErrorPage() {
  const { state } = useWorkspace();
  return (
    <>
      <PageHead crumb="CONTRIBUTION / VALIDATION" title="Archive refusée" description="Votre projet et la version principale n’ont pas été modifiés." />
      <Panel maxWidth={700}>
        <Notice tone="error">{state.errorReason || "Chemin interdit détecté : ../config/.env. Ce fichier pourrait exposer des informations sensibles."}</Notice>
        <h2>Comment corriger votre archive ?</h2>
        <Paragraph>
          Retirez les fichiers sensibles, les chemins qui sortent du dossier du projet et les fichiers non autorisés. Vérifiez que l’archive est au format ZIP et ne dépasse pas 20 Mo, puis réessayez.
        </Paragraph>
        <FormActions>
          <Button variant="primary" href={PATHS.submit}>
            Corriger et réessayer
          </Button>
          <Button variant="outline" href={PATHS.project}>
            Retour au projet
          </Button>
        </FormActions>
        <Paragraph>
          <strong>Note du prototype :</strong> les contrôles présentés sont simulés ; une vraie vérification doit être effectuée côté serveur.
        </Paragraph>
      </Panel>
    </>
  );
}
