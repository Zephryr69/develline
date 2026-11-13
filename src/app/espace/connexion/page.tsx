"use client";

import { useRouter } from "next/navigation";
import { LuArrowRight } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { Field, FormActions, FormGrid, PageHead, Panel, Paragraph } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useWorkspace();
  return (
    <>
      <PageHead crumb="BIENVENUE" title="Connexion ou inscription" description="Un profil simple pour commencer à construire." />
      <Panel
        as="form"
        maxWidth={520}
        onSubmit={(e) => {
          e.preventDefault();
          router.push(PATHS.dashboard);
          toast("Bienvenue dans le prototype.");
        }}
      >
        <FormGrid>
          <Field label="Nom affiché" htmlFor="authName" full>
            <input id="authName" placeholder="Votre nom" required />
          </Field>
          <Field label="Adresse e-mail" htmlFor="authEmail" full>
            <input type="email" id="authEmail" placeholder="vous@exemple.com" required />
          </Field>
          <Field label="Mot de passe" htmlFor="authPass" full>
            <input type="password" id="authPass" minLength={8} placeholder="8 caractères minimum" required />
          </Field>
        </FormGrid>
        <FormActions>
          <Button variant="primary" type="submit">
            Continuer <LuArrowRight />
          </Button>
        </FormActions>
        <Paragraph>Prototype uniquement : aucune authentification ni donnée personnelle n’est enregistrée.</Paragraph>
      </Panel>
    </>
  );
}
