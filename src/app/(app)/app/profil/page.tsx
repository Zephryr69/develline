import type { Metadata } from "next";
import Link from "next/link";
import ActionForm, { SubmitButton } from "@/components/forms/ActionForm";
import { Avatar, Field, FormGrid, Grid2, ListRow, MiniLabel, PageHead, Panel, Paragraph, RowMain } from "@/components/ui/Primitives";
import { updateProfileAction } from "@/actions/auth";
import { requireUser } from "@/server/auth";
import { acceptedContributionsOf } from "@/server/projects";
import { initials, plural } from "@/lib/format";
import { publicProjectPath } from "@/lib/routes";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await requireUser("/app/profil");
  const accepted = await acceptedContributionsOf(user.id);
  const total = accepted.reduce((s, a) => s + a.count, 0);

  return (
    <>
      <PageHead crumb="MON COMPTE" title="Mon profil" description="Vos informations et vos contributions acceptées sur des projets publics." />
      <Grid2>
        <Panel>
          <Avatar initials={initials(user.name)} size="lg" />
          <h2 style={{ marginTop: 16 }}>Informations</h2>
          <ActionForm action={updateProfileAction}>
            <FormGrid>
              <Field label="Nom affiché" htmlFor="name" full>
                <input id="name" name="name" defaultValue={user.name} required minLength={2} maxLength={60} />
              </Field>
              <Field label="Adresse e-mail" htmlFor="email" full hint="L’adresse e-mail n’est pas modifiable pour le moment.">
                <input id="email" value={user.email} disabled readOnly />
              </Field>
              <Field label="Présentation" htmlFor="bio" full hint="280 caractères maximum.">
                <textarea id="bio" name="bio" defaultValue={user.bio} maxLength={280} />
              </Field>
            </FormGrid>
            <div style={{ marginTop: 18 }}>
              <SubmitButton>Enregistrer</SubmitButton>
            </div>
          </ActionForm>
        </Panel>

        <Panel>
          <MiniLabel>CONTRIBUTIONS ACCEPTÉES</MiniLabel>
          <div style={{ fontSize: 34, fontWeight: 700, margin: "6px 0 14px" }}>{total}</div>
          {accepted.length === 0 ? (
            <Paragraph>Vos contributions acceptées sur des projets publics apparaîtront ici.</Paragraph>
          ) : (
            accepted.map((a) => (
              <ListRow key={a.slug}>
                <RowMain
                  title={<Link href={publicProjectPath(a.slug)}>{a.project_name}</Link>}
                  sub={`${a.count} ${plural(a.count, "contribution", "contributions")} · ${a.titles.slice(0, 2).join(", ")}${a.titles.length > 2 ? "…" : ""}`}
                />
              </ListRow>
            ))
          )}
        </Panel>
      </Grid2>
    </>
  );
}
