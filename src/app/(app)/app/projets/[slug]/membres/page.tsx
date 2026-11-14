import { LuArrowRight, LuUserMinus } from "react-icons/lu";
import AccessDenied from "@/components/AccessDenied";
import CopyLink from "@/components/CopyLink";
import ActionForm, { SubmitButton } from "@/components/forms/ActionForm";
import ConfirmAction from "@/components/forms/ConfirmAction";
import { Avatar, Badge, Field, FormActions, Grid2, ListRow, Panel, PanelHead, Paragraph, RowMain, Stack } from "@/components/ui/Primitives";
import { inviteAction, removeMemberAction, setRoleAction } from "@/actions/members";
import { projectCtx } from "@/server/context";
import { listMembers } from "@/server/members";
import { getSiteUrl } from "@/server/site";
import { initials } from "@/lib/format";
import styles from "./page.module.css";

export default async function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await projectCtx(slug);
  if ("denied" in ctx) return <AccessDenied />;
  const { project, access } = ctx;
  const [members, siteUrl] = await Promise.all([listMembers(project.id), getSiteUrl()]);
  const roleLabel = (r: string) => (r === "contribute" ? "Contribuer" : "Consulter");
  const visible = access.canDecide ? members : members.filter((m) => m.status === "accepted");

  return (
    <Grid2>
      <Panel>
        <PanelHead>
          <h2>Membres du projet</h2>
        </PanelHead>
        <ListRow>
          <Avatar initials={initials(project.owner_name)} />
          <RowMain title={project.owner_name} sub="Propriétaire" />
          <Badge>Propriétaire</Badge>
        </ListRow>
        {visible.length === 0 && <Paragraph>Aucun membre invité pour le moment.</Paragraph>}
        {visible.map((m) => (
          <ListRow key={m.id} wrap>
            <Avatar initials={initials(m.name ?? m.email)} />
            <RowMain title={m.name ?? m.email} sub={m.name ? m.email : "Pas encore inscrit"} />
            {m.status === "pending" && <Badge tone="warn">Invitation en attente</Badge>}
            {m.status === "declined" && <Badge tone="error">Refusée</Badge>}
            {m.status === "accepted" && !access.canDecide && <Badge tone="neutral">{roleLabel(m.role)}</Badge>}

            {access.canDecide && (
              <div className={styles.tools}>
                {m.status === "accepted" && (
                  <ActionForm action={setRoleAction} className={styles.role}>
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="memberId" value={m.id} />
                    <select name="role" defaultValue={m.role} aria-label={`Droit de ${m.name ?? m.email}`}>
                      <option value="contribute">Contribuer</option>
                      <option value="view">Consulter</option>
                    </select>
                    <SubmitButton size="sm" variant="outline" pendingLabel="…">OK</SubmitButton>
                  </ActionForm>
                )}
                {m.status === "pending" && <CopyLink url={`${siteUrl}/invitation/${m.token}`} label="Lien d’invitation" />}
                <ConfirmAction
                  action={removeMemberAction}
                  fields={{ slug, memberId: m.id }}
                  title={m.status === "accepted" ? "Retirer ce membre ?" : "Annuler cette invitation ?"}
                  body={m.status === "accepted" ? "Cette personne perdra l’accès aux fichiers du projet. Ses contributions déjà acceptées restent créditées." : "Le lien d’invitation ne fonctionnera plus."}
                  confirmText={m.status === "accepted" ? "Retirer" : "Annuler l’invitation"}
                  variant="danger"
                  confirmVariant="danger"
                >
                  <LuUserMinus /> {m.status === "accepted" ? "Retirer" : "Annuler"}
                </ConfirmAction>
              </div>
            )}
          </ListRow>
        ))}
      </Panel>

      <Stack>
        {access.canDecide && project.status === "active" ? (
          <Panel>
            <h2>Inviter un collaborateur</h2>
            <Paragraph>Une invitation donne accès au projet selon le droit choisi. Partagez ensuite le lien d’invitation (par exemple sur WhatsApp).</Paragraph>
            <ActionForm action={inviteAction} resetOnOk>
              <input type="hidden" name="slug" value={slug} />
              <Stack>
                <Field label="Adresse e-mail" htmlFor="email">
                  <input id="email" name="email" type="email" required placeholder="collaborateur@exemple.com" />
                </Field>
                <Field label="Droit d’accès" htmlFor="role" hint="« Contribuer » permet de proposer des changements. « Consulter » donne un accès en lecture.">
                  <select id="role" name="role" defaultValue="contribute">
                    <option value="contribute">Contribuer</option>
                    <option value="view">Consulter</option>
                  </select>
                </Field>
              </Stack>
              <FormActions>
                <SubmitButton pendingLabel="Envoi…">
                  Inviter <LuArrowRight />
                </SubmitButton>
              </FormActions>
            </ActionForm>
          </Panel>
        ) : (
          <Panel>
            <h2>Droits d’accès</h2>
            <Paragraph>Seul le propriétaire peut inviter des membres et modifier leurs droits.</Paragraph>
          </Panel>
        )}
      </Stack>
    </Grid2>
  );
}
