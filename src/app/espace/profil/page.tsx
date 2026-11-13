"use client";

import Button from "@/components/ui/Button";
import { Avatar, Grid2, ListRow, MiniLabel, Metric, PageHead, Panel, Paragraph, RowMain } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";
import { plural } from "@/lib/utils";

export default function ProfilePage() {
  const { state } = useWorkspace();
  return (
    <>
      <PageHead crumb="MEMBRE / PROFIL" title="Kofi Diallo" description="Développeur collaborateur · Profil de démonstration" />
      <Grid2>
        <Panel>
          <Avatar initials="KD" size="lg" />
          <h2 style={{ marginTop: 16 }}>Kofi Diallo</h2>
          <Paragraph>Construire des solutions utiles, une version à la fois.</Paragraph>
          <Metric>{state.accepted}</Metric>
          <MiniLabel>{plural(state.accepted, "CONTRIBUTION ACCEPTÉE", "CONTRIBUTIONS ACCEPTÉES")}</MiniLabel>
        </Panel>
        <Panel>
          <h2>Contributions par projet</h2>
          {state.accepted ? (
            <ListRow>
              <RowMain title={state.name} sub={`${state.title} · ${state.accepted} ${plural(state.accepted, "contribution acceptée", "contributions acceptées")}`} />
              <Button variant="outline" size="sm" href={PATHS.card}>
                Voir
              </Button>
            </ListRow>
          ) : (
            <Paragraph>Aucune contribution acceptée pour le moment.</Paragraph>
          )}
        </Panel>
      </Grid2>
    </>
  );
}
