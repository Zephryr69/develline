"use client";

import { useRef } from "react";
import { LuCloudUpload, LuFileArchive } from "react-icons/lu";
import { formatBytes } from "@/lib/format";
import styles from "./UploadField.module.css";

export default function UploadField({
  file,
  onChange,
  maxMb,
  name = "file",
  hint,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  maxMb: number;
  name?: string;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      className={styles.drop}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) onChange(f);
      }}
    >
      {file ? <LuFileArchive /> : <LuCloudUpload />}
      <strong>{file ? file.name : "Déposez votre archive ZIP ici"}</strong>
      <span>{file ? formatBytes(file.size) : `Maximum ${maxMb} Mo · ${hint ?? "aucun secret, aucun dossier node_modules"}`}</span>
      <button type="button" className={styles.pick} onClick={() => input.current?.click()}>
        {file ? "Changer de fichier" : "Choisir un fichier"}
      </button>
      <input ref={input} type="file" name={name} accept=".zip,application/zip,application/x-zip-compressed" hidden onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </div>
  );
}
