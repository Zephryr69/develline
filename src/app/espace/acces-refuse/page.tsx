"use client";

import { LuShieldAlert } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { EmptyState, FormActions, MiniLabel, Panel } from "@/components/ui/Primitives";
import { PATHS } from "@/lib/routes";

export default function DeniedPage() {
  return (
    <div style={{ maxWidth: 640, margin: "35px auto" }}>
      <Panel>
        <EmptyState icon={LuShieldAlert} title="Accès refusé">
          <MiniLabel>ERREUR 403</MiniLabel>
          <p>Vous n’avez pas la permission d’accéder à ce projet ou à cette action. Demandez une invitation au propriétaire ou revenez aux projets publics.</p>
          <FormActions center>
            <Button variant="primary" href={PATHS.public}>
              Voir les projets publics
            </Button>
            <Button variant="outline" href={PATHS.dashboard}>
              Retour au tableau de bord
            </Button>
          </FormActions>
        </EmptyState>
      </Panel>
    </div>
  );
}
