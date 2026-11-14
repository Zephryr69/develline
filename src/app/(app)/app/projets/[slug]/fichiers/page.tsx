import Link from "next/link";
import { LuDownload, LuFile, LuFileImage } from "react-icons/lu";
import AccessDenied from "@/components/AccessDenied";
import Button from "@/components/ui/Button";
import { Badge, Grid2, ListRow, Notice, Panel, PanelHead, Paragraph } from "@/components/ui/Primitives";
import { projectCtx } from "@/server/context";
import { getVersionByLabel, listVersionFiles, listVersions, readBlob } from "@/server/versions";
import { formatBytes } from "@/lib/format";
import { projectPath } from "@/lib/routes";
import styles from "./page.module.css";

const MAX_PREVIEW = 200 * 1024;

export default async function FilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string; file?: string }>;
}) {
  const { slug } = await params;
  const { v, file } = await searchParams;
  const ctx = await projectCtx(slug);
  if ("denied" in ctx) return <AccessDenied />;
  const { project, access } = ctx;
  if (!access.canSeeFiles) return <AccessDenied />;

  const versions = await listVersions(project.id);
  const version = (v && (await getVersionByLabel(project.id, v))) || versions[0];
  const files = await listVersionFiles(version.id);
  const selected = files.find((f) => f.path === file);
  const blob = selected && selected.isText && selected.size <= MAX_PREVIEW ? await readBlob(selected.sha256) : null;
  const base = projectPath(slug, "/fichiers");
  const link = (label: string, path?: string) => `${base}?v=${label}${path ? `&file=${encodeURIComponent(path)}` : ""}`;

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.versions} role="tablist" aria-label="Versions">
          {versions.slice(0, 8).map((ver) => (
            <Link key={ver.id} href={link(ver.label)} className={`${styles.ver} ${ver.id === version.id ? styles.activeVer : ""}`}>
              {ver.label}
              {ver.id === project.current_version_id ? " ·  courante" : ""}
            </Link>
          ))}
        </div>
        <Button variant="primary" size="sm" href={`/api/projects/${slug}/download?v=${version.label}`}>
          <LuDownload /> Télécharger la copie de travail ({version.label})
        </Button>
      </div>
      <Notice>
        La copie de travail est un ZIP de la version {version.label}. Modifiez-la en local, recompressez-la puis déposez-la dans l’onglet Contributions. Conservez le fichier DEVELLINE.json.
      </Notice>

      <Grid2>
        <Panel>
          <PanelHead>
            <h2>
              Fichiers · {version.label}
            </h2>
            <Badge tone="neutral">{files.length} fichiers</Badge>
          </PanelHead>
          {files.map((f) => (
            <ListRow key={f.path}>
              {f.isText ? <LuFile /> : <LuFileImage />}
              <Link href={link(version.label, f.path)} className={`${styles.file} ${f.path === file ? styles.fileActive : ""} mono`}>
                {f.path}
              </Link>
              <span className={styles.size}>{formatBytes(f.size)}</span>
            </ListRow>
          ))}
        </Panel>

        <Panel>
          {selected ? (
            <>
              <PanelHead>
                <h2 className="mono" style={{ fontSize: 13, wordBreak: "break-all" }}>{selected.path}</h2>
                <Badge tone="neutral">{formatBytes(selected.size)}</Badge>
              </PanelHead>
              {blob ? (
                <pre className={styles.code}>
                  {blob
                    .toString("utf8")
                    .split("\n")
                    .map((line, i) => (
                      <span key={i} className={styles.line}>
                        <span className={styles.no}>{i + 1}</span>
                        {line}
                        {"\n"}
                      </span>
                    ))}
                </pre>
              ) : (
                <Paragraph>{selected.isText ? "Fichier trop volumineux pour l’aperçu : téléchargez la copie de travail." : "Aperçu indisponible pour ce type de fichier."}</Paragraph>
              )}
            </>
          ) : (
            <Paragraph>Sélectionnez un fichier pour afficher son contenu.</Paragraph>
          )}
        </Panel>
      </Grid2>
    </>
  );
}
