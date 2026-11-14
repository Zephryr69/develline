import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm, { SubmitButton } from "@/components/forms/ActionForm";
import { Field, FormGrid } from "@/components/ui/Primitives";
import { registerAction } from "@/actions/auth";
import { getCurrentUser } from "@/server/auth";
import { PATHS, safeNext } from "@/lib/routes";
import styles from "../form.module.css";

export const metadata: Metadata = { title: "Créer un compte" };
export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className={styles.card}>
      <h1>Créer votre compte</h1>
      <p>Quelques secondes suffisent pour créer votre premier projet ou rejoindre celui d’un ami.</p>
      <ActionForm action={registerAction}>
        <input type="hidden" name="next" value={next ?? ""} />
        <FormGrid>
          <Field label="Nom affiché" htmlFor="name" full>
            <input id="name" name="name" autoComplete="name" required minLength={2} maxLength={60} />
          </Field>
          <Field label="Adresse e-mail" htmlFor="email" full>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Mot de passe" htmlFor="password" full hint="8 caractères minimum.">
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} />
          </Field>
        </FormGrid>
        <div className={styles.submit}>
          <SubmitButton full pendingLabel="Création du compte…">Créer mon compte</SubmitButton>
        </div>
      </ActionForm>
      <p className={styles.alt}>
        Déjà inscrit ? <Link href={`${PATHS.login}${suffix}`}>Se connecter</Link>
      </p>
    </div>
  );
}
