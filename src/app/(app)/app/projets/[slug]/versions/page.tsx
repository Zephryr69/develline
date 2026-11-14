import { LuDownload, LuRotateCcw } from "react-icons/lu";
import AccessDenied from "@/components/AccessDenied";
import Button from "@/components/ui/Button";
import ConfirmAction from "@/components/forms/ConfirmAction";
import { Badge, ListRow, Notice, Panel, RowMain } from "@/components/ui/Primitives";
import { restoreAction } from "@/actions/contributions";
import { projectCtx } from "@/server/context";
import { listVersions } from "@/server/versions";
import { formatBytes, formatDateTime } from "@/lib/format";
import styles from "./page.module.css";

const KIND = { initial: "Initiale", contribution: "Contribution", restore: "Restauration" } as const;

export default async function VersionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await projectCtx(slug);
  if ("denied" in ctx) return <AccessDenied />;
  const { project, access } = ctx;
  const versions = await listVersions(project.id);

  return (
    <>
      <Notice>Chaque acceptation crée une version. Restaurer une ancienne version crée une nouvelle version identique : rien n’est supprimé de l’historique.</Notice>
      <Panel>
        <div className={styles.timeline}>
          {versions.map((v) => {
            const current = v.id === project.current_version_id;
            return (
              <div key={v.id} className={`${styles.item} ${current ? styles.current : ""}`}>
                <ListRow wrap>
                  <RowMain
                    title={
                      <>
                        {v.label} · {v.title} {current && <Badge>Courante</Badge>} <Badge tone="neutral">{KIND[v.kind]}</Badge>
                      </>
                    }
                    sub={`${v.author_name ?? "—"} · ${formatDateTime(v.created_at)} · ${v.file_count} fichiers · ${formatBytes(v.total_size)}`}
                  />
                  {access.canSeeFiles && (
                    <Button variant="outline" size="sm" href={`/api/projects/${slug}/download?v=${v.label}`}>
                      <LuDownload /> ZIP
                    </Button>
                  )}
                  {access.canDecide && !current && project.status === "active" && (
                    <ConfirmAction
                      action={restoreAction}
                      fields={{ slug, versionId: v.id }}
                      title={`Restaurer ${v.label} ?`}
                      body={`La restauration est non destructive : une nouvelle version sera créée à partir de ${v.label}. Les versions actuelles restent dans l’historique.`}
                      confirmText="Créer une version restaurée"
                    >
                      <LuRotateCcw /> Restaurer
                    </ConfirmAction>
                  )}
                </ListRow>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
