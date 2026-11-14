import type { TextDiff } from "@/server/diff";
import styles from "./DiffViewer.module.css";

export default function DiffViewer({ diff }: { diff: TextDiff }) {
  if ("tooLarge" in diff) {
    return <p className={styles.empty}>Ce fichier est trop volumineux pour afficher les différences ligne par ligne.</p>;
  }
  if (diff.hunks.length === 0) return <p className={styles.empty}>Aucune différence de contenu.</p>;

  return (
    <div className={styles.diff} role="region" aria-label="Différences du fichier">
      <div className={styles.summary}>
        <span className={styles.plusText}>+{diff.added}</span> <span className={styles.minusText}>−{diff.removed}</span>
      </div>
      {diff.hunks.map((h, i) => (
        <div key={i} className={styles.hunk}>
          <div className={styles.header}>{h.header}</div>
          {h.lines.map((l, j) => (
            <div key={j} className={`${styles.line} ${l.type === "add" ? styles.add : l.type === "del" ? styles.del : ""}`}>
              <span className={styles.no}>{l.oldNo ?? ""}</span>
              <span className={styles.no}>{l.newNo ?? ""}</span>
              <span className={styles.sign} aria-label={l.type === "add" ? "ajout" : l.type === "del" ? "suppression" : "inchangé"}>
                {l.type === "add" ? "+" : l.type === "del" ? "−" : " "}
              </span>
              <span className={styles.text}>{l.text || " "}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
