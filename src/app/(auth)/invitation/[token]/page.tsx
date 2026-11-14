import type { Metadata } from "next";
import Link from "next/link";
import ActionForm, { SubmitButton } from "@/components/forms/ActionForm";
import Button from "@/components/ui/Button";
import { Notice } from "@/components/ui/Primitives";
import { respondByTokenAction } from "@/actions/members";
import { getCurrentUser } from "@/server/auth";
import { getInvitationByToken } from "@/server/members";
import { PATHS } from "@/lib/routes";
import styles from "../../form.module.css";

export const metadata: Metadata = { title: "Invitation" };
export const dynamic = "force-dynamic";

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await getInvitationByToken(token);
  const user = await getCurrentUser();
  const here = `/invitation/${token}`;

  if (!inv || inv.status !== "pending") {
    return (
      <div className={styles.card}>
        <h1>Invitation indisponible</h1>
        <p>Ce lien n’est plus valide : l’invitation a déjà été traitée ou annulée par le propriétaire.</p>
        <Button variant="primary" href={PATHS.dashboard}>
          Aller à mon espace
        </Button>
      </div>
    );
  }

  const role = inv.role === "contribute" ? "contribuer" : "consulter";

  return (
    <div className={styles.card}>
      <h1>Rejoindre « {inv.project_name} »</h1>
      <p>
        {inv.inviter_name} vous invite à <strong>{role}</strong> sur ce projet.
      </p>
      {user ? (
        <ActionForm action={respondByTokenAction}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="accept" value="1" />
          <Notice>Vous êtes connecté en tant que {user.name} ({user.email}).</Notice>
          <div className={styles.actions}>
            <SubmitButton pendingLabel="Un instant…">Accepter l’invitation</SubmitButton>
          </div>
        </ActionForm>
      ) : (
        <div className={styles.actions}>
          <Button variant="primary" href={`${PATHS.login}?next=${encodeURIComponent(here)}`}>
            Se connecter
          </Button>
          <Button variant="outline" href={`${PATHS.register}?next=${encodeURIComponent(here)}`}>
            Créer un compte
          </Button>
        </div>
      )}
      <p className={styles.alt}>
        <Link href="/">Retour à l’accueil</Link>
      </p>
    </div>
  );
}
