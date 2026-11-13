"use client";

import { LuRocket } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import { Badge, Grid2, ListRow, MiniLabel, Metric, Panel, PanelHead, PageHead, Paragraph, Progress, ProgressLabel, RowMain, RowSub, Stack, Tags } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";
import { endDateLabel, safeUrl, splitTags } from "@/lib/utils";

export default function ProjectPage() {
  const { state, currentVersion, progress, requestDeliver } = useWorkspace();

  return (
    <>
      <PageHead
        crumb={`MES PROJETS / ${state.name}`}
        title={state.name}
        description={state.description}
        action={<Badge tone={state.delivered ? "ok" : "neutral"}>{state.delivered ? "Livré" : "En cours"}</Badge>}
      />
      <Tabs />
      <Grid2>
        <Stack>
          <Panel>
            <PanelHead>
              <h2>À propos du projet</h2>
              <Button variant="outline" size="sm" href={PATHS.copy}>
                Copie de travail
              </Button>
            </PanelHead>
            <Paragraph>{state.description}</Paragraph>
            <Tags tags={splitTags(state.stack)} />
            <Paragraph>
              Démo externe :{" "}
              <a href={safeUrl(state.demo)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                Ouvrir la démo ↗
              </a>
            </Paragraph>
          </Panel>

          <Panel>
            <PanelHead>
              <h2>Activité récente</h2>
              <Button variant="outline" size="sm" href={PATHS.versions}>
                Voir les versions
              </Button>
            </PanelHead>
            {state.history.length ? (
              state.history
                .slice(-3)
                .reverse()
                .map((h, i) => (
                  <ListRow key={`${h}-${i}`}>
                    <RowMain title={h} sub="Dans ce prototype · à l’instant" />
                  </ListRow>
                ))
            ) : (
              <Paragraph>Aucune action récente. Invitez un membre pour commencer.</Paragraph>
            )}
          </Panel>
        </Stack>

        <Stack>
          <Panel>
            <MiniLabel>SPRINT {state.delivered ? "TERMINÉ" : "EN COURS"}</MiniLabel>
            <Metric>{state.delivered ? "Livré" : `${state.weeks * 7} jours restants`}</Metric>
            <RowSub>Date de fin : {endDateLabel(state.weeks)}</RowSub>
            <ProgressLabel left="Versions acceptées" right={`${state.accepted}/4 · ${progress} %`} />
            <Progress value={progress} />
            <Paragraph>
              Version courante : <strong style={{ color: "var(--text)" }}>{currentVersion}</strong>
            </Paragraph>
          </Panel>
          <Panel>
            <h2>Prêt à livrer ?</h2>
            <Paragraph>Marquez le projet comme livré pour générer sa Ship Card publique.</Paragraph>
            {state.delivered ? (
              <Button variant="primary" href={PATHS.card}>
                Voir la Ship Card
              </Button>
            ) : (
              <Button variant="primary" onClick={requestDeliver}>
                Marquer comme livré <LuRocket />
              </Button>
            )}
          </Panel>
        </Stack>
      </Grid2>
    </>
  );
}
