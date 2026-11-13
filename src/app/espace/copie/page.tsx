"use client";

import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { Field, FormActions, Notice, PageHead, Panel, Paragraph } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";
import { downloadFile } from "@/lib/utils";

export default function CopyPage() {
  const { state, currentVersion, toast } = useWorkspace();
  const versions = state.versions.slice().reverse();
  const [selected, setSelected] = useState("");
  const value = selected || `${versions[0].id} — ${versions[0].text}`;

  const download = () => {
    downloadFile(
      "copie-de-travail-DEVEL-line.txt",
      `Prototype DEVEL line\nProjet : ${state.name}\nVersion : ${value || currentVersion}\nCeci est un fichier de démonstration.`,
      "text/plain"
    );
    toast("Copie de démonstration téléchargée.");
  };

  return (
    <>
      <PageHead crumb="PROJET / COPIE DE TRAVAIL" title="Télécharger une copie" description="Partez d’une version connue avant de proposer vos modifications." />
      <Panel maxWidth={700}>
        <h2>Choisir une version</h2>
        <Paragraph>La copie contient les fichiers de la version sélectionnée. Notez sa version : elle sera demandée lors de l’envoi.</Paragraph>
        <Field label="Version de base" htmlFor="copyVersion">
          <select id="copyVersion" value={value} onChange={(e) => setSelected(e.target.value)}>
            {versions.map((v) => (
              <option key={v.id}>{`${v.id} — ${v.text}`}</option>
            ))}
          </select>
        </Field>
        <FormActions>
          <Button variant="primary" onClick={download}>
            Télécharger la copie <LuDownload />
          </Button>
          <Button variant="outline" href={PATHS.submit}>
            Soumettre une contribution
          </Button>
        </FormActions>
        <div style={{ marginTop: 18 }}>
          <Notice>Prototype : le téléchargement contient un fichier explicatif, pas les fichiers réels du projet.</Notice>
        </div>
      </Panel>
    </>
  );
}
