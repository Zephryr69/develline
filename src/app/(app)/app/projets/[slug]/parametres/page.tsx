import type { Metadata } from "next";
import AccessDenied from "@/components/AccessDenied";
import ActionForm, { SubmitButton } from "@/components/forms/ActionForm";
import { Field, FormActions, FormGrid, Notice, Panel } from "@/components/ui/Primitives";
import { updateProjectAction } from "@/actions/projects";
import { projectCtx } from "@/server/context";

export const metadata: Metadata = { title: "Paramètres du projet" };

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await projectCtx(slug);
  if ("denied" in ctx) return <AccessDenied />;
  const { project, access } = ctx;
  if (!access.canDecide) return <AccessDenied message="Seul le propriétaire peut modifier les paramètres du projet." />;

  return (
    <Panel maxWidth={820}>
      <h2>Paramètres du projet</h2>
      {project.status === "delivered" && <Notice>Le projet est livré : vous pouvez encore mettre à jour sa description, son lien de démo et sa visibilité.</Notice>}
      <ActionForm action={updateProjectAction}>
        <input type="hidden" name="slug" value={slug} />
        <FormGrid>
          <Field label="Description courte *" htmlFor="description" full>
            <textarea id="description" name="description" required minLength={10} maxLength={300} defaultValue={project.description} />
          </Field>
          <Field label="Stack et tags *" htmlFor="stack" hint="Séparez par des virgules.">
            <input id="stack" name="stack" required defaultValue={project.stack} />
          </Field>
          <Field label="Lien de démo externe" htmlFor="demo_url" hint="Requis pour livrer le projet.">
            <input id="demo_url" name="demo_url" type="url" defaultValue={project.demo_url} placeholder="https://mon-projet.vercel.app" />
          </Field>
          <Field label="Contexte" htmlFor="context" full>
            <textarea id="context" name="context" maxLength={2000} defaultValue={project.context} />
          </Field>
          <Field label="Documentation" htmlFor="docs" full>
            <textarea id="docs" name="docs" maxLength={5000} defaultValue={project.docs} />
          </Field>
          <Field label="Visibilité" htmlFor="visibility">
            <select id="visibility" name="visibility" defaultValue={project.visibility}>
              <option value="public">Public</option>
              <option value="private">Privé</option>
            </select>
          </Field>
        </FormGrid>
        <FormActions>
          <SubmitButton>Enregistrer les modifications</SubmitButton>
        </FormActions>
      </ActionForm>
    </Panel>
  );
}
