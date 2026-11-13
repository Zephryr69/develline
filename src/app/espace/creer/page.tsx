"use client";

import { useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { Field, FormActions, FormGrid, PageHead, Panel } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";

export default function CreateProjectPage() {
  const { state, createProject } = useWorkspace();
  const [name, setName] = useState(state.name);
  const [stack, setStack] = useState(state.stack);
  const [description, setDescription] = useState(state.description);
  const [demo, setDemo] = useState(state.demo);
  const [weeks, setWeeks] = useState(state.weeks);

  return (
    <>
      <PageHead crumb="PROJET / NOUVEAU" title="Créer un projet" description="Posez les bases de votre sprint. Vous pourrez compléter ces informations plus tard." />
      <Panel
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          createProject({ name, description, stack, demo: demo || "https://example.com", weeks });
        }}
      >
        <FormGrid>
          <Field label="Nom du projet *" htmlFor="pname">
            <input id="pname" value={name} onChange={(e) => setName(e.target.value)} required maxLength={70} />
          </Field>
          <Field label="Stack et tags *" htmlFor="pstack" hint="Séparez les tags par une virgule : Mobile Money, WhatsApp API, USSD…">
            <input id="pstack" value={stack} onChange={(e) => setStack(e.target.value)} required />
          </Field>
          <Field label="Description courte *" htmlFor="pdesc" full>
            <textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </Field>
          <Field label="Contexte du projet" htmlFor="context" full>
            <textarea id="context" placeholder="Quel problème résolvez-vous ? Pour qui ?" />
          </Field>
          <Field label="Documentation" htmlFor="docs" full>
            <textarea id="docs" placeholder="Instructions pour démarrer, ressources utiles…" />
          </Field>
          <Field label="URL de démo externe" htmlFor="demo">
            <input id="demo" type="url" value={demo} onChange={(e) => setDemo(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Visibilité" htmlFor="visibility">
            <select id="visibility" defaultValue="Public">
              <option>Public</option>
              <option>Privé</option>
            </select>
          </Field>
          <Field label="Durée du sprint *" htmlFor="weeks" hint="La date de fin est calculée à partir d’aujourd’hui.">
            <select id="weeks" value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>
              <option value={4}>4 semaines</option>
              <option value={5}>5 semaines</option>
              <option value={6}>6 semaines</option>
            </select>
          </Field>
        </FormGrid>
        <FormActions>
          <Button variant="primary" type="submit">
            Créer le projet <LuArrowRight />
          </Button>
          <Button variant="outline" href={PATHS.dashboard}>
            Annuler
          </Button>
        </FormActions>
      </Panel>
    </>
  );
}
