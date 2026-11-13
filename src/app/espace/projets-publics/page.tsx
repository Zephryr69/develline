"use client";

import { LuStore } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { Badge, FormActions, ListRow, PageHead, Panel, ProjectIcon, RowMain, Tags } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";
import { splitTags } from "@/lib/utils";

export default function PublicProjectsPage() {
  const { state } = useWorkspace();
  return (
    <>
      <PageHead crumb="DÉCOUVRIR" title="Projets publics" description="Découvrez les projets et leurs preuves de livraison." />
      <Panel maxWidth={650}>
        <ListRow>
          <ProjectIcon icon={LuStore} />
          <RowMain title={state.name} sub={state.description} />
          <Badge>{state.delivered ? "Livré" : "En cours"}</Badge>
        </ListRow>
        <Tags tags={splitTags(state.stack)} />
        <FormActions>
          <Button variant="primary" href={PATHS.card}>
            Voir la Ship Card
          </Button>
        </FormActions>
      </Panel>
    </>
  );
}
