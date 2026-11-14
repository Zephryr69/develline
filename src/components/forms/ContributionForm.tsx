"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuSend } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { Field, FormActions, FormGrid, Notice, Progress, ProgressLabel } from "@/components/ui/Primitives";
import UploadField from "./UploadField";
import { uploadForm } from "@/lib/upload";
import { projectPath } from "@/lib/routes";

export default function ContributionForm({
  slug,
  versions,
  currentLabel,
  maxMb,
}: {
  slug: string;
  versions: string[];
  currentLabel: string;
  maxMb: number;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<{ message: string; issues?: string[] } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!file) return setError({ message: "Ajoutez l’archive ZIP contenant vos modifications." });
    if (!file.name.toLowerCase().endsWith(".zip")) return setError({ message: "Extension non autorisée. Choisissez une archive au format .zip." });
    if (file.size > maxMb * 1048576) return setError({ message: `Archive trop volumineuse : maximum ${maxMb} Mo.` });
    const fd = new FormData(e.currentTarget);
    fd.set("file", file);
    setBusy(true);
    setPct(0);
    const res = await uploadForm(`/api/projects/${slug}/contributions`, fd, setPct);
    if (res.ok && res.redirect) {
      router.push(res.redirect);
      router.refresh();
      return;
    }
    setBusy(false);
    setError({ message: res.error ?? "Envoi impossible.", issues: res.issues });
  }

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="error" items={error.issues}>
            {error.message}
          </Notice>
        </div>
      )}
      <FormGrid>
        <Field label="Titre de la contribution *" htmlFor="title" full>
          <input id="title" name="title" required minLength={3} maxLength={100} placeholder="Ex. Ajout de la page des commerçants" />
        </Field>
        <Field label="Résumé *" htmlFor="summary" full hint="Expliquez ce que vous avez changé et pourquoi.">
          <textarea id="summary" name="summary" required minLength={10} maxLength={1000} />
        </Field>
        <Field label="Version de base" htmlFor="base" hint="Si votre archive vient d’une copie de travail, la version est détectée automatiquement.">
          <select id="base" name="base" defaultValue={currentLabel}>
            {versions.map((v) => (
              <option key={v} value={v}>
                {v}
                {v === currentLabel ? " (courante)" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Archive ZIP *" full>
          <UploadField file={file} onChange={setFile} maxMb={maxMb} />
        </Field>
      </FormGrid>

      {busy && (
        <div style={{ marginTop: 18 }}>
          <ProgressLabel left={pct < 100 ? "Envoi de l’archive" : "Analyse de sécurité en cours"} right={`${pct} %`} />
          <Progress value={pct} />
        </div>
      )}

      <FormActions>
        <Button variant="primary" type="submit" disabled={busy}>
          {busy ? "Envoi…" : "Envoyer la contribution"} <LuSend />
        </Button>
        <Button variant="outline" href={projectPath(slug, "/contributions")}>
          Annuler
        </Button>
      </FormActions>
    </form>
  );
}
