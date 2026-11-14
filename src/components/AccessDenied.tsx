import { LuShieldAlert } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { EmptyState, FormActions, MiniLabel, Panel } from "@/components/ui/Primitives";
import { PATHS } from "@/lib/routes";

export default function AccessDenied({ message }: { message?: string }) {
  return (
    <div style={{ maxWidth: 640, margin: "40px auto" }}>
      <Panel>
        <EmptyState icon={<LuShieldAlert />} title="Accès refusé">
          <MiniLabel>ERREUR 403</MiniLabel>
          <p style={{ marginTop: 12 }}>
            {message ?? "Vous n’avez pas la permission d’accéder à cette ressource. Demandez une invitation au propriétaire du projet ou parcourez les projets publics."}
          </p>
          <FormActions center>
            <Button variant="primary" href={PATHS.publicProjects}>
              Voir les projets publics
            </Button>
            <Button variant="outline" href={PATHS.dashboard}>
              Mon tableau de bord
            </Button>
          </FormActions>
        </EmptyState>
      </Panel>
    </div>
  );
}
