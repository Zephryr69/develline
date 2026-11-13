"use client";

import { useEffect, useRef, useState } from "react";
import { LuArrowRight, LuCloudUpload } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { Field, FormActions, FormGrid, Notice, PageHead, Panel, ProgressLabel, Progress } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import styles from "./page.module.css";

const MAX_MB = 20;

export default function SubmitPage() {
  const { state, submitContribution } = useWorkspace();
  const [title, setTitle] = useState(state.title);
  const [summary, setSummary] = useState(state.summary);
  const [base, setBase] = useState(state.versions[state.versions.length - 1].id);
  const [file, setFile] = useState<File | null>(null);
  const [unsafe, setUnsafe] = useState(false);
  const [sending, setSending] = useState(false);
  const [pct, setPct] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const validate = (): string => {
    if (unsafe) return "Chemin interdit détecté : ../config/.env. Ce fichier pourrait exposer des informations sensibles.";
    if (file && !file.name.toLowerCase().endsWith(".zip")) return "Extension non autorisée. Choisissez une archive au format .zip.";
    if (file && file.size > MAX_MB * 1024 * 1024) return `Archive trop volumineuse. La taille maximale est de ${MAX_MB} Mo.`;
    if (file && /(^|[._-])(env|secret|password)([._-]|$)/i.test(file.name)) return "Nom de fichier sensible détecté. Retirez les secrets avant de réessayer.";
    return "";
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errorReason = validate();
    setSending(true);
    let p = 0;
    timer.current = setInterval(() => {
      p += 25;
      setPct(p);
      if (p >= 100) {
        if (timer.current) clearInterval(timer.current);
        submitContribution({ title, summary, base, errorReason });
      }
    }, 100);
  };

  return (
    <>
      <PageHead crumb="PROJET / CONTRIBUTION" title="Soumettre une contribution" description="Proposez vos changements au propriétaire du projet." />
      {state.submission === "rejected" && <Notice tone="warn">Votre précédente proposition a été refusée. Ajustez votre archive et soumettez-la à nouveau.</Notice>}
      {state.submission === "pending" && <Notice>Votre contribution est en validation. Le propriétaire peut maintenant examiner les changements.</Notice>}
      {state.submission === "accepted" && <Notice>Contribution acceptée et créditée à Kofi Diallo.</Notice>}

      <Panel as="form" onSubmit={onSubmit}>
        <FormGrid>
          <Field label="Titre de la contribution *" htmlFor="ctitle" full>
            <input id="ctitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label="Résumé *" htmlFor="csummary" full>
            <textarea id="csummary" value={summary} onChange={(e) => setSummary(e.target.value)} required />
          </Field>
          <Field label="Version de base *" htmlFor="baseVersion">
            <select id="baseVersion" value={base} onChange={(e) => setBase(e.target.value)}>
              {state.versions
                .slice()
                .reverse()
                .map((v) => (
                  <option key={v.id}>{v.id}</option>
                ))}
            </select>
          </Field>
          <Field label="Archive ZIP" htmlFor="zip" full>
            <div className={styles.upload}>
              <LuCloudUpload />
              <strong>Choisissez une archive ZIP</strong>
              <span>Maximum {MAX_MB} Mo · ne contient pas de secrets ni de chemins interdits</span>
              <input type="file" id="zip" accept=".zip,application/zip" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <span>Pour la démonstration, vous pouvez aussi continuer sans fichier.</span>
            </div>
          </Field>
          <div className={styles.unsafe}>
            <label>
              <input type="checkbox" checked={unsafe} onChange={(e) => setUnsafe(e.target.checked)} /> Simuler une archive dangereuse pour tester le refus
            </label>
          </div>
        </FormGrid>

        {sending && (
          <div className={styles.progress}>
            <ProgressLabel left="Envoi de l’archive" right={`${pct} %`} />
            <Progress value={pct} />
          </div>
        )}

        <FormActions>
          <Button variant="primary" type="submit" disabled={sending}>
            Envoyer la contribution <LuArrowRight />
          </Button>
        </FormActions>
      </Panel>
    </>
  );
}
