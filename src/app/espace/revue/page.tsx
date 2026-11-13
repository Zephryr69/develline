"use client";

import { LuCheck, LuFileSearch, LuX } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { Badge, EmptyState, FormActions, Grid2, ListRow, MiniLabel, Notice, PageHead, Panel, PanelHead, Paragraph, RowSub } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";
import styles from "./page.module.css";

export default function ReviewPage() {
  const { state, currentVersion, requestAccept, requestReject } = useWorkspace();
  const pending = state.submission === "pending";
  const base = state.base || currentVersion;

  return (
    <>
      <PageHead crumb="PROJET / CONTRIBUTIONS / REVUE" title="Revoir une contribution" description="Comparez les fichiers avant de décider. La version principale ne change pas avant acceptation." />
      {pending ? (
        <Panel>
          <PanelHead>
            <div>
              <h2>{state.title}</h2>
              <RowSub>Kofi Diallo · Base : {base} · En validation</RowSub>
            </div>
            <Badge tone="warn">En validation</Badge>
          </PanelHead>
          <Paragraph>{state.summary}</Paragraph>
          <Grid2>
            <div>
              <MiniLabel>FICHIERS MODIFIÉS</MiniLabel>
              <ListRow>
                <span className={`${styles.status} ${styles.added}`}>+ Ajouté</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>src/components/ShopCard.jsx</span>
              </ListRow>
              <ListRow>
                <span className={`${styles.status} ${styles.modified}`}>~ Modifié</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>src/App.jsx</span>
              </ListRow>
              <ListRow>
                <span className={`${styles.status} ${styles.deleted}`}>− Supprimé</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>src/old-home.jsx</span>
              </ListRow>
            </div>
            <div>
              <Notice>Diff de démonstration : les changements affichés illustrent la revue et ne proviennent pas d’une analyse réelle du ZIP.</Notice>
              <RowSub>
                Fichier sélectionné : <span className="mono">src/App.jsx</span>
              </RowSub>
            </div>
          </Grid2>

          <div className={styles.diff}>
            <div className={styles.col}>
              <div className={styles.title}>Avant · {base}</div>
              <pre>
                {"1  function App() {\n"}
                <span className={styles.minus}>{"2    return <Home />;"}</span>
                {"3  }"}
              </pre>
            </div>
            <div className={styles.col}>
              <div className={styles.title}>Proposition</div>
              <pre>
                {"1  function App() {\n"}
                <span className={styles.plus}>{"2    return <ShopCard />;"}</span>
                {"3  }"}
              </pre>
            </div>
          </div>

          <FormActions>
            <Button variant="primary" onClick={requestAccept}>
              Accepter la contribution <LuCheck />
            </Button>
            <Button variant="danger" onClick={requestReject}>
              Rejeter <LuX />
            </Button>
          </FormActions>
        </Panel>
      ) : (
        <Panel>
          <EmptyState icon={LuFileSearch} title="Aucune contribution à revoir">
            <p>{state.submission === "rejected" ? "La dernière proposition a été refusée ; la version principale est inchangée." : "Une contribution en validation apparaîtra ici."}</p>
            <Button variant="primary" href={PATHS.submit}>
              Soumettre une contribution
            </Button>
          </EmptyState>
        </Panel>
      )}
    </>
  );
}
