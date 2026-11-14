import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm, { SubmitButton } from "@/components/forms/ActionForm";
import { Field, FormGrid } from "@/components/ui/Primitives";
import { loginAction } from "@/actions/auth";
import { getCurrentUser } from "@/server/auth";
import { PATHS, safeNext } from "@/lib/routes";
import styles from "../form.module.css";

export const metadata: Metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className={styles.card}>
      <h1>Content de vous revoir</h1>
      <p>Connectez-vous pour retrouver vos projets et vos invitations.</p>
      <ActionForm action={loginAction}>
        <input type="hidden" name="next" value={next ?? ""} />
        <FormGrid>
          <Field label="Adresse e-mail" htmlFor="email" full>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Mot de passe" htmlFor="password" full>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </Field>
        </FormGrid>
        <div className={styles.submit}>
          <SubmitButton full pendingLabel="Connexion…">Se connecter</SubmitButton>
        </div>
      </ActionForm>
      <p className={styles.alt}>
        Pas encore de compte ? <Link href={`${PATHS.register}${suffix}`}>Créer un compte</Link>
      </p>
    </div>
  );
}
