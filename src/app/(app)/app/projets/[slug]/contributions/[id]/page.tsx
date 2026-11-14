import Link from "next/link";
import { LuCheck, LuX } from "react-icons/lu";
import AccessDenied from "@/components/AccessDenied";
import ConfirmAction from "@/components/forms/ConfirmAction";
import DiffViewer from "@/components/DiffViewer";
import { Avatar, Badge, Notice, Panel, PanelHead, Paragraph, RowSub } from "@/components/ui/Primitives";
import { acceptAction, rejectAction } from "@/actions/contributions";
import { projectCtx } from "@/server/context";
import { getChanges, getContribution, getFileDiff } from "@/server/contributions";
import { notFound } from "next/navigation";
import { formatBytes, formatDateTime, initials } from "@/lib/format";
import { projectPath } from "@/lib/routes";
import styles from "./page.module.css";

const LABEL = { added: "+ Ajouté", modified: "~ Modifié", deleted: "− Supprimé" } as const;
const STATUS = {
  pending: { label: "En validation", tone: "warn" },
  accepted: { label: "Acceptée", tone: "ok" },
  rejected: { label: "Rejetée", tone: "error" },
} as const;

export default async function ContributionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ file?: string }>;
}) {
  const { slug, id } = await params;
  const { file } = await searchParams;
  const ctx = await projectCtx(slug);
  if ("denied" in ctx) return <AccessDenied />;
  const { project, access } = ctx;

  const c = await getContribution(project.id, id);
  if (!c) notFound();

  const changes = await getChanges(c);
  const selected = changes.find((ch) => ch.path === file) ?? changes[0];
  const diff = selected ? await getFileDiff(c, selected.path) : null;
  const pending = c.status === "pending";
  const staleBase = project.current_label !== c.base_label;
  const st = STATUS[c.status];

  return (
    <>
      <p className={styles.back}>
        <Link href={projectPath(slug, "/contributions")}>← Toutes les contributions</Link>
      </p>
      <Panel>
        <PanelHead>
          <div className={styles.titleRow}>
            <Avatar initials={initials(c.author_name)} />
            <div>
              <h2>{c.title}</h2>
              <RowSub>
                {c.author_name} · base {c.base_label}
                {c.result_label ? ` → ${c.result_label}` : ""} · {formatDateTime(c.created_at)} · {c.archive_name} ({formatBytes(c.archive_size)})
              </RowSub>
            </div>
          </div>
          <Badge tone={st.tone}>{st.label}</Badge>
        </PanelHead>
        <Paragraph>{c.summary}</Paragraph>

        {c.status === "rejected" && (
          <Notice tone="warn">
            Rejetée{c.decided_by_name ? ` par ${c.decided_by_name}` : ""}. {c.decision_note ? `Motif : ${c.decision_note}` : "La version principale est restée inchangée."}
          </Notice>
        )}
        {c.status === "accepted" && <Notice>Acceptée{c.decided_by_name ? ` par ${c.decided_by_name}` : ""} : nouvelle version {c.result_label}.</Notice>}
        {pending && staleBase && (
          <Notice tone="warn">
            Cette contribution est basée sur {c.base_label}, mais la version courante est {project.current_label}. L’acceptation applique uniquement ses changements ; un conflit est signalé si un même fichier a été modifié entre-temps.
          </Notice>
        )}

        {pending && access.canDecide && (
          <div className={styles.decide}>
            <ConfirmAction
              action={acceptAction}
              fields={{ slug, id: c.id }}
              title="Accepter cette contribution ?"
              body={`Une nouvelle version sera créée et la contribution sera créditée à ${c.author_name}.`}
              confirmText="Accepter et créer la version"
              variant="primary"
              size="md"
            >
              <LuCheck /> Accepter la contribution
            </ConfirmAction>
            <ConfirmAction
              action={rejectAction}
              fields={{ slug, id: c.id }}
              title="Rejeter cette contribution ?"
              body="La version principale restera inchangée. Le collaborateur pourra corriger et soumettre à nouveau."
              confirmText="Confirmer le rejet"
              confirmVariant="danger"
              variant="danger"
              size="md"
              noteField={{ name: "note", label: "Motif (facultatif)", placeholder: "Ex. Ajoutez des tests, corrigez le nommage…" }}
            >
              <LuX /> Rejeter
            </ConfirmAction>
          </div>
        )}
      </Panel>

      <div className={styles.review}>
        <Panel>
          <PanelHead>
            <h2>Fichiers</h2>
            <Badge tone="neutral">{changes.length}</Badge>
          </PanelHead>
          {changes.map((ch) => (
            <Link
              key={ch.path}
              href={projectPath(slug, `/contributions/${c.id}?file=${encodeURIComponent(ch.path)}`)}
              className={`${styles.change} ${selected?.path === ch.path ? styles.changeActive : ""}`}
            >
              <span className={`${styles.status} ${styles[ch.status]}`}>{LABEL[ch.status]}</span>
              <span className={`${styles.path} mono`}>{ch.path}</span>
            </Link>
          ))}
        </Panel>

        <Panel>
          {selected ? (
            <>
              <PanelHead>
                <h2 className="mono" style={{ fontSize: 13, wordBreak: "break-all" }}>{selected.path}</h2>
                <span className={`${styles.status} ${styles[selected.status]}`}>{LABEL[selected.status]}</span>
              </PanelHead>
              {diff?.kind === "text" ? (
                <DiffViewer diff={diff.diff} />
              ) : diff?.kind === "binary" ? (
                <Paragraph>
                  Fichier binaire : {formatBytes(diff.oldSize)} → {formatBytes(diff.size)}. Les différences ligne par ligne ne s’appliquent qu’aux fichiers texte.
                </Paragraph>
              ) : (
                <Paragraph>Aucune différence à afficher.</Paragraph>
              )}
            </>
          ) : (
            <Paragraph>Aucun changement détecté.</Paragraph>
          )}
        </Panel>
      </div>
    </>
  );
}
