"use client";

import { LuFileCode, LuFolder } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import { FormActions, ListRow, PageHead, Panel, RowMain } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";

export default function FilesPage() {
  const { currentVersion } = useWorkspace();
  return (
    <>
      <PageHead crumb="PROJET / FICHIERS" title="Fichiers du projet" description={`Aperçu de la version courante : ${currentVersion}`} />
      <Tabs />
      <Panel>
        <ListRow>
          <LuFolder size={18} />
          <RowMain title="src/" sub="Dossier de démonstration" mono />
        </ListRow>
        <ListRow>
          <LuFileCode size={18} />
          <RowMain title="README.md" sub="Documentation du projet" mono />
        </ListRow>
        <FormActions>
          <Button variant="primary" href={PATHS.copy}>
            Télécharger une copie
          </Button>
        </FormActions>
      </Panel>
    </>
  );
}
