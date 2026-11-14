export type UploadResult = { ok: boolean; error?: string; issues?: string[]; redirect?: string };

/** Envoie un FormData avec suivi de progression (fetch ne sait pas suivre l'envoi). */
export function uploadForm(url: string, body: FormData, onProgress: (pct: number) => void): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const data = xhr.response as UploadResult | null;
      if (data && typeof data === "object") resolve(data);
      else resolve({ ok: false, error: xhr.status === 413 ? "Archive trop volumineuse pour le serveur." : "Réponse inattendue du serveur." });
    };
    xhr.onerror = () => resolve({ ok: false, error: "Connexion interrompue. Vérifiez votre réseau et réessayez." });
    xhr.send(body);
  });
}
