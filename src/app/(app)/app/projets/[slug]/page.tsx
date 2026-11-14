import AccessDenied from "@/components/AccessDenied";
import Button from "@/components/ui/Button";
import ConfirmAction from "@/components/forms/ConfirmAction";
import { Grid2, ListRow, Metric, MiniLabel, Notice, Panel, PanelHead, Paragraph, Progress, ProgressLabel, RowMain, Stack, Tags } from "@/components/ui/Primitives";
import { deliverAction } from "@/actions/projects";
import { projectCtx } from "@/server/context";
import { ACTION_LABELS, listActivity } from "@/server/audit";
import { formatDate, plural, splitTags, timeAgo } from "@/lib/format";
import { sprintInfo } from "@/lib/sprint";
import { projectPath, shipPath } from "@/lib/routes";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await projectCtx(slug);
  if ("denied" in ctx) return <AccessDenied />;
  const { project, access } = ctx;

  const [activity] = await Promise.all([listActivity(project.id, 8)]);
  const info = sprintInfo(project);
  const delivered = project.status === "delivered";

  return (
    <Grid2>
      <Stack>
        <Panel>
          <PanelHead>
            <h2>À propos du projet</h2>
            {access.canSubmit && !delivered && (
              <Button variant="primary" size="sm" href={projectPath(slug, "/contributions/nouvelle")}>
                Proposer une contribution
              </Button>
            )}
          </PanelHead>
          <Paragraph>{project.description}</Paragraph>
          <Tags tags={splitTags(project.stack)} />
          {project.demo_url ? (
            <Paragraph>
              Démo : <a href={project.demo_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-text)", fontWeight: 600 }}>{project.demo_url} ↗</a>
            </Paragraph>
          ) : (
            <Paragraph>Aucun lien de démo pour le moment{access.canDecide ? " : ajoutez-le dans l’onglet Paramètres pour pouvoir livrer." : "."}</Paragraph>
          )}
          {project.context && (
            <>
              <MiniLabel>CONTEXTE</MiniLabel>
              <Paragraph>{project.context}</Paragraph>
            </>
          )}
          {project.docs && (
            <>
              <MiniLabel>DOCUMENTATION</MiniLabel>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--muted)", whiteSpace: "pre-line" }}>{project.docs}</p>
            </>
          )}
        </Panel>

        <Panel>
          <PanelHead>
            <h2>Activité récente</h2>
          </PanelHead>
          {activity.length === 0 ? (
            <Paragraph>Aucune activité pour le moment.</Paragraph>
          ) : (
            activity.map((a) => (
              <ListRow key={a.id}>
                <RowMain
                  title={
                    <>
                      <strong>{a.user_name ?? "Un membre"}</strong> {ACTION_LABELS[a.action] ?? a.action}
                      {a.detail ? <span style={{ color: "var(--muted)", fontWeight: 400 }}> · {a.detail}</span> : null}
                    </>
                  }
                  sub={timeAgo(a.created_at)}
                />
              </ListRow>
            ))
          )}
        </Panel>
      </Stack>

      <Stack>
        <Panel>
          <MiniLabel>SPRINT · {info.label.toUpperCase()}</MiniLabel>
          <Metric>{delivered ? "Livré" : info.state === "expired" ? "Terminé" : `${info.daysLeft} ${plural(info.daysLeft, "jour restant", "jours restants")}`}</Metric>
          <Paragraph small>
            {delivered && project.delivered_at ? `Livré le ${formatDate(project.delivered_at)}` : `Fin du sprint : ${formatDate(project.sprint_ends_at)}`}
          </Paragraph>
          <ProgressLabel
            left="Contributions acceptées"
            right={`${project.accepted_count}/${project.target_versions} · ${info.progress} %`}
          />
          <Progress value={info.progress} />
          <Paragraph>
            Version courante : <strong style={{ color: "var(--text)" }}>{project.current_label}</strong> · {project.version_count} {plural(project.version_count, "version", "versions")}
          </Paragraph>
          {info.state === "expired" && <Notice tone="warn">Le sprint est terminé. Vous pouvez encore livrer le projet.</Notice>}
        </Panel>

        {access.canDecide && (
          <Panel>
            <h2>{delivered ? "Projet livré" : "Prêt à livrer ?"}</h2>
            <Paragraph>
              {delivered
                ? "L’historique est figé. Votre Ship Card est prête à être partagée."
                : "Marquez le projet comme livré pour clore le sprint et publier sa Ship Card (projets publics)."}
            </Paragraph>
            {delivered ? (
              project.visibility === "public" ? (
                <Button variant="primary" href={shipPath(slug)}>
                  Voir la Ship Card
                </Button>
              ) : null
            ) : (
              <ConfirmAction
                action={deliverAction}
                fields={{ slug }}
                title="Marquer le projet comme livré ?"
                body="Le sprint sera clos, l’historique figé et la Ship Card publiée si le projet est public. Cette action est définitive."
                confirmText="Confirmer la livraison"
                variant="primary"
                size="md"
              >
                Marquer comme livré
              </ConfirmAction>
            )}
          </Panel>
        )}
      </Stack>
    </Grid2>
  );
}
