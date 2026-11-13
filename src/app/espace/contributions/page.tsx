"use client";

import { LuArchive } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import { Badge, EmptyState, ListRow, PageHead, Panel, RowMain } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";

export default function ContributionsPage() {
  const { state, currentVersion } = useWorkspace();
  const label = state.submission === "pending" ? "En validation" : state.submission === "accepted" ? "Validée" : "Refusée";
  const tone = state.submission === "rejected" ? "error" : state.submission === "pending" ? "warn" : "ok";

  return (
    <>
      <PageHead crumb="PROJET / CONTRIBUTIONS" title="Contributions" description="Propositions et décisions de l’équipe." />
      <Tabs />
      <Panel>
        {state.submission === "none" ? (
          <EmptyState icon={LuArchive} title="Aucune contribution">
            <p>Les propositions de l’équipe apparaîtront ici.</p>
            <Button variant="primary" href={PATHS.submit}>
              Soumettre un ZIP
            </Button>
          </EmptyState>
        ) : (
          <ListRow>
            <RowMain title={state.title} sub={`Kofi Diallo · Base ${state.base || currentVersion}`} />
            <Badge tone={tone}>{label}</Badge>
            {state.submission === "pending" && (
              <Button variant="primary" size="sm" href={PATHS.review}>
                Revoir
              </Button>
            )}
          </ListRow>
        )}
      </Panel>
    </>
  );
}
