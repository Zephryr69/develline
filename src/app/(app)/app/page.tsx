import { LuFolderPlus, LuInbox } from "react-icons/lu";
import Button from "@/components/ui/Button";
import ProjectCard from "@/components/ProjectCard";
import ActionForm, { SubmitButton } from "@/components/forms/ActionForm";
import { Avatar, Badge, EmptyState, ListRow, PageHead, Panel, PanelHead, RowMain } from "@/components/ui/Primitives";
import { respondInvitationAction } from "@/actions/members";
import { requireUser } from "@/server/auth";
import { listCollaborations, listOwnedProjects } from "@/server/projects";
import { listPendingInvitations } from "@/server/members";
import { initials, timeAgo } from "@/lib/format";
import { PATHS, projectPath } from "@/lib/routes";
import styles from "./page.module.css";

export default async function DashboardPage() {
  const user = await requireUser("/app");
  const [owned, collabs, invitations] = await Promise.all([
    listOwnedProjects(user.id),
    listCollaborations(user.id),
    listPendingInvitations(user),
  ]);

  return (
    <>
      <PageHead
        crumb="TABLEAU DE BORD"
        title={`Bonjour, ${user.name.split(" ")[0]}`}
        description="Vos projets, vos collaborations et vos invitations en un coup d’œil."
        action={
          <Button variant="primary" href={PATHS.newProject}>
            <LuFolderPlus /> Créer un projet
          </Button>
        }
      />

      {invitations.length > 0 && (
        <Panel>
          <PanelHead>
            <h2>Invitations en attente</h2>
            <Badge tone="warn">{invitations.length}</Badge>
          </PanelHead>
          {invitations.map((inv) => (
            <ListRow key={inv.id} wrap>
              <Avatar initials={initials(inv.inviter_name)} />
              <RowMain
                title={inv.project_name}
                sub={`${inv.inviter_name} vous invite à ${inv.role === "contribute" ? "contribuer" : "consulter"} · ${timeAgo(inv.created_at)}`}
              />
              <div className={styles.inviteActions}>
                <ActionForm action={respondInvitationAction}>
                  <input type="hidden" name="memberId" value={inv.id} />
                  <input type="hidden" name="accept" value="1" />
                  <SubmitButton size="sm" pendingLabel="…">Accepter</SubmitButton>
                </ActionForm>
                <ActionForm action={respondInvitationAction}>
                  <input type="hidden" name="memberId" value={inv.id} />
                  <input type="hidden" name="accept" value="0" />
                  <SubmitButton size="sm" variant="outline" pendingLabel="…">Refuser</SubmitButton>
                </ActionForm>
              </div>
            </ListRow>
          ))}
        </Panel>
      )}

      <section className={styles.section}>
        <h2 className={styles.h2}>Mes projets</h2>
        {owned.length === 0 ? (
          <Panel>
            <EmptyState icon={<LuFolderPlus />} title="Aucun projet pour le moment">
              <p>Créez votre premier projet : contexte, stack, durée de sprint, et invitez votre équipe.</p>
              <Button variant="primary" href={PATHS.newProject}>
                Créer un projet
              </Button>
            </EmptyState>
          </Panel>
        ) : (
          <div className={styles.grid}>
            {owned.map((p) => (
              <ProjectCard key={p.id} project={p} href={projectPath(p.slug)} role="Propriétaire" />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Projets où je collabore</h2>
        {collabs.length === 0 ? (
          <Panel>
            <EmptyState icon={<LuInbox />} title="Aucune collaboration">
              <p>Les projets auxquels vous êtes invité apparaîtront ici dès que vous aurez accepté l’invitation.</p>
              <Button variant="outline" href={PATHS.publicProjects}>
                Découvrir des projets
              </Button>
            </EmptyState>
          </Panel>
        ) : (
          <div className={styles.grid}>
            {collabs.map((p) => (
              <ProjectCard key={p.id} project={p} href={projectPath(p.slug)} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
