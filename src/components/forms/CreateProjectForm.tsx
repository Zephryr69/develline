"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowRight } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { Field, FormActions, FormGrid, Notice, Progress, ProgressLabel } from "@/components/ui/Primitives";
import UploadField from "./UploadField";
import { uploadForm } from "@/lib/upload";
import { PATHS } from "@/lib/routes";

export default function CreateProjectForm({ maxMb }: { maxMb: number }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<{ message: string; issues?: string[] } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (file && !file.name.toLowerCase().endsWith(".zip")) return setError({ message: "Choisissez une archive au format .zip." });
    if (file && file.size > maxMb * 1048576) return setError({ message: `Archive trop volumineuse : maximum ${maxMb} Mo.` });
    const fd = new FormData(e.currentTarget);
    fd.delete("file");
    if (file) fd.set("file", file);
    setBusy(true);
    setPct(0);
    const res = await uploadForm("/api/projects", fd, setPct);
    if (res.ok && res.redirect) {
      router.push(res.redirect);
      router.refresh();
      return;
    }
    setBusy(false);
    setError({ message: res.error ?? "Impossible de créer le projet.", issues: res.issues });
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
        <Field label="Nom du projet *" htmlFor="name">
          <input id="name" name="name" required minLength={3} maxLength={70} placeholder="Ex. Marché Local" />
        </Field>
        <Field label="Stack et tags *" htmlFor="stack" hint="Séparez par des virgules : React, Mobile Money, WhatsApp API, USSD…">
          <input id="stack" name="stack" required placeholder="React, Node.js, Mobile Money" />
        </Field>
        <Field label="Description courte *" htmlFor="description" full hint="10 à 300 caractères. C’est la phrase qui s’affiche sur la Ship Card.">
          <textarea id="description" name="description" required minLength={10} maxLength={300} />
        </Field>
        <Field label="Contexte du projet" htmlFor="context" full>
          <textarea id="context" name="context" maxLength={2000} placeholder="Quel problème résolvez-vous ? Pour qui ?" />
        </Field>
        <Field label="Documentation" htmlFor="docs" full>
          <textarea id="docs" name="docs" maxLength={5000} placeholder="Comment lancer le projet, conventions, ressources utiles…" />
        </Field>
        <Field label="Lien de démo externe" htmlFor="demo_url" hint="Vous pourrez l’ajouter plus tard, mais il est requis pour livrer.">
          <input id="demo_url" name="demo_url" type="url" placeholder="https://mon-projet.vercel.app" />
        </Field>
        <Field label="Visibilité" htmlFor="visibility" hint="Public : visible dans la liste, Ship Card partageable. Privé : réservé aux membres.">
          <select id="visibility" name="visibility" defaultValue="public">
            <option value="public">Public</option>
            <option value="private">Privé</option>
          </select>
        </Field>
        <Field label="Durée du sprint *" htmlFor="weeks" hint="La date de fin est calculée à partir d’aujourd’hui.">
          <select id="weeks" name="weeks" defaultValue="6">
            <option value="4">4 semaines</option>
            <option value="5">5 semaines</option>
            <option value="6">6 semaines</option>
          </select>
        </Field>
        <Field label="Fichiers de départ (optionnel)" full hint="Sans archive, un fichier README.md est généré à partir de vos informations.">
          <UploadField file={file} onChange={setFile} maxMb={maxMb} />
        </Field>
      </FormGrid>

      {busy && (
        <div style={{ marginTop: 18 }}>
          <ProgressLabel left={pct < 100 ? "Envoi en cours" : "Analyse de l’archive"} right={`${pct} %`} />
          <Progress value={pct} />
        </div>
      )}

      <FormActions>
        <Button variant="primary" type="submit" disabled={busy}>
          {busy ? "Création…" : "Créer le projet"} <LuArrowRight />
        </Button>
        <Button variant="outline" href={PATHS.dashboard}>
          Annuler
        </Button>
      </FormActions>
    </form>
  );
}
