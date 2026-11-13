"use client";

import { LuStore } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { Badge, Grid2, ListRow, Panel, PanelHead, PageHead, Paragraph, Progress, ProgressLabel, ProjectIcon, RowMain, RowSub, Stack, Avatar } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";
import { endDateLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { state, currentVersion, progress } = useWorkspace();

  return (
    <>
      <PageHead
        crumb="ESPACE DE TRAVAIL"
        title="Bonjour, Aïcha"
        description="Vos projets avancent. Retrouvez ici l’essentiel de votre activité."
        action={
          <Button variant="primary" href={PATHS.create}>
            Créer un projet
          </Button>
        }
      />
      <Grid2>
        <Panel>
          <PanelHead>
            <h2>Mes projets</h2>
            <Badge>{state.delivered ? "Livré" : "En cours"}</Badge>
          </PanelHead>
          <ListRow>
            <ProjectIcon icon={LuStore} />
            <RowMain title={state.name} sub={`Propriétaire · ${currentVersion} · Sprint de ${state.weeks} semaines`} />
            <Button variant="outline" size="sm" href={PATHS.project}>
              Ouvrir
            </Button>
          </ListRow>
          <ProgressLabel left="Progression du sprint" right={`${progress} % · ${state.accepted}/4 versions acceptées`} />
          <Progress value={progress} />
          <RowSub top={10}>Fin prévue : {endDateLabel(state.weeks)}</RowSub>
        </Panel>

        <Stack>
          <Panel>
            <PanelHead>
              <h2>Invitations en attente</h2>
              <Badge tone="neutral">{state.invited ? "1" : "0"}</Badge>
            </PanelHead>
            {state.invited ? (
              <ListRow>
                <Avatar initials="KD" />
                <RowMain title="Kofi Diallo" sub="Invitation à contribuer envoyée" />
                <Badge tone="warn">En attente</Badge>
              </ListRow>
            ) : (
              <>
                <Paragraph>Aucune invitation en attente pour le moment.</Paragraph>
                <Button variant="outline" href={PATHS.members}>
                  Inviter un membre
                </Button>
              </>
            )}
          </Panel>
          <Panel>
            <h2>Projets où je collabore</h2>
            <Paragraph>Aucun projet pour le moment. Une invitation acceptée apparaîtra ici.</Paragraph>
          </Panel>
        </Stack>
      </Grid2>

      <Panel spaced>
        <PanelHead>
          <h2>Parcours de démonstration</h2>
          <Badge tone="neutral">11 étapes</Badge>
        </PanelHead>
        <Paragraph>Créez un projet, invitez un membre, soumettez un ZIP, puis passez en revue les changements jusqu’à la Ship Card.</Paragraph>
        <Button variant="primary" href={PATHS.create}>
          Commencer le parcours
        </Button>
      </Panel>
    </>
  );
}
