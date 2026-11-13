"use client";

import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import { Badge, ListRow, PageHead, Panel, RowMain } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import styles from "./page.module.css";

export default function VersionsPage() {
  const { state, requestRestore } = useWorkspace();
  const list = state.versions.slice().reverse();

  return (
    <>
      <PageHead crumb="PROJET / HISTORIQUE" title="Historique des versions" description="Chaque acceptation crée une version. Une restauration ne supprime rien." />
      <Tabs />
      <Panel>
        <div className={styles.timeline}>
          {list.map((v, i) => (
            <div key={v.id} className={styles.item}>
              <ListRow>
                <RowMain
                  title={
                    <>
                      {v.id} {i === 0 && <Badge>Courante</Badge>}
                    </>
                  }
                  sub={`${v.text} · ${v.author} · Aujourd’hui`}
                />
                {i !== 0 && (
                  <Button variant="outline" size="sm" onClick={() => requestRestore(v.id)}>
                    Restaurer
                  </Button>
                )}
              </ListRow>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
