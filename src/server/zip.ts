import { createHash } from "node:crypto";
import JSZip from "jszip";

export type FileRec = {
  path: string;
  data: Buffer;
  sha256: string;
  size: number;
  isText: boolean;
};

/** Erreur de validation d'archive, avec la liste des problèmes à corriger. */
export class ArchiveError extends Error {
  issues: string[];
  constructor(message: string, issues: string[] = []) {
    super(message);
    this.name = "ArchiveError";
    this.issues = issues;
  }
}

export const LIMITS = {
  get maxZipBytes() {
    const mb = Number(process.env.MAX_ZIP_MB);
    return (Number.isFinite(mb) && mb > 0 ? mb : 4) * 1024 * 1024;
  },
  maxFiles: 300,
  maxDepth: 8,
  maxPathLength: 200,
  maxFileBytes: 2 * 1024 * 1024,
  maxTotalBytes: 15 * 1024 * 1024,
};

const TEXT_EXT = new Set(
  "js jsx mjs cjs ts tsx json jsonc css scss sass less html htm md mdx txt py php java kt kts go rs rb c cc cpp h hpp cs swift sql yml yaml toml ini cfg conf xml svg csv tsv sh vue svelte astro graphql gql prisma lock".split(" ")
);
const BINARY_EXT = new Set("png jpg jpeg gif webp avif ico bmp woff woff2 ttf otf eot pdf".split(" "));
const EXECUTABLE_EXT = new Set(
  "exe dll so dylib bat cmd com msi scr jar war apk ipa dmg iso bin class pyc o a lib app vbs ps1 wasm".split(" ")
);
const SENSITIVE_EXT = new Set(
  "pem key p12 pfx crt cer der jks keystore dump bak sqlite sqlite3 db mdb tfstate tfvars".split(" ")
);
const ALLOWED_NAMES = new Set(
  [
    "readme", "license", "licence", "dockerfile", "makefile", "procfile", "codeowners", "changelog",
    ".gitignore", ".gitattributes", ".editorconfig", ".prettierrc", ".eslintrc", ".nvmrc", ".dockerignore",
    ".env.example", ".env.sample", ".env.template", ".env.dist",
  ]
);
const SENSITIVE_NAMES = /^(id_rsa|id_dsa|id_ecdsa|id_ed25519|\.htpasswd|\.npmrc|\.pypirc|\.netrc)$/;
const SENSITIVE_FILE = /^(secrets?|credentials?)\.(json|ya?ml|toml|ini|txt|env)$/;
const ENV_FILE = /^\.env(\..+)?$/;
const ENV_SAFE = new Set([".env.example", ".env.sample", ".env.template", ".env.dist"]);
const BLOCKED_DIRS = new Set([".git", "node_modules", ".svn", ".hg", ".next", "__pycache__"]);
const IGNORED_NAMES = new Set([".ds_store", "thumbs.db", "desktop.ini"]);

const SECRET_PATTERNS: [RegExp, string][] = [
  [/-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY/, "clé privée"],
  [/AKIA[0-9A-Z]{16}/, "clé d’accès AWS"],
  [/gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,}/, "jeton GitHub"],
  [/sk_live_[0-9a-zA-Z]{20,}/, "clé secrète Stripe"],
  [/xox[baprs]-[0-9A-Za-z-]{10,}/, "jeton Slack"],
  [/AIza[0-9A-Za-z_-]{35}/, "clé d’API Google"],
];

export function sha256(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

export function makeFile(path: string, data: Buffer, isText: boolean): FileRec {
  return { path, data, sha256: sha256(data), size: data.length, isText };
}

function extOf(base: string): string {
  const i = base.lastIndexOf(".");
  return i > 0 ? base.slice(i + 1).toLowerCase() : "";
}

/** Valide un chemin de fichier. Retourne un message d'erreur ou null. */
function checkPath(name: string): string | null {
  if (name.includes("\0") || /[\u0000-\u001f]/.test(name)) return "caractères de contrôle interdits";
  if (name.includes("\\")) return "séparateur « \\ » interdit (utilisez « / »)";
  if (name.startsWith("/") || /^[a-zA-Z]:/.test(name)) return "chemin absolu interdit";
  const segs = name.split("/").filter((s) => s !== "");
  if (segs.some((s) => s === "..")) return "chemin traversant (../) interdit";
  if (name.length > LIMITS.maxPathLength) return "chemin trop long";
  if (segs.length > LIMITS.maxDepth) return `profondeur maximale de ${LIMITS.maxDepth} dossiers dépassée`;
  return null;
}

/** Vérifie le nom/l'extension d'un fichier. Retourne { isText } ou un message d'erreur. */
function checkFileType(path: string): { isText: boolean } | string {
  const segs = path.split("/");
  if (segs.slice(0, -1).some((s) => BLOCKED_DIRS.has(s))) {
    return "dossier non autorisé (dépôt Git, dépendances ou cache)";
  }
  const base = segs[segs.length - 1];
  const lower = base.toLowerCase();
  if (ENV_FILE.test(lower) && !ENV_SAFE.has(lower)) return "fichier d’environnement sensible (.env)";
  if (SENSITIVE_NAMES.test(lower) || SENSITIVE_FILE.test(lower)) return "fichier sensible (identifiants ou clé)";
  const ext = extOf(lower);
  if (SENSITIVE_EXT.has(ext)) return `fichier sensible (.${ext} : clé, certificat ou export de base de données)`;
  if (ext === "sql" && /(dump|backup)/.test(lower)) return "export de base de données interdit";
  if (EXECUTABLE_EXT.has(ext)) return `binaire exécutable interdit (.${ext})`;
  if (ALLOWED_NAMES.has(lower)) return { isText: true };
  if (TEXT_EXT.has(ext)) return { isText: true };
  if (BINARY_EXT.has(ext)) return { isText: false };
  if (!ext && ALLOWED_NAMES.has(lower.replace(/\.[^.]*$/, ""))) return { isText: true };
  return ext ? `extension non autorisée (.${ext})` : "type de fichier non autorisé";
}

function hasNul(buf: Buffer): boolean {
  const n = Math.min(buf.length, 8000);
  for (let i = 0; i < n; i++) if (buf[i] === 0) return true;
  return false;
}


type RawEntry = { name: string; unixMode: number | null; size: number; isDir: boolean };

/** Lit le répertoire central du ZIP (noms bruts, attributs, tailles déclarées) sans rien décompresser. */
function scanCentralDirectory(buf: Buffer): RawEntry[] {
  const min = Math.max(0, buf.length - 65557);
  let eocd = -1;
  for (let i = buf.length - 22; i >= min; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new ArchiveError("Archive corrompue ou illisible.");
  const total = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  if (total === 0xffff || offset === 0xffffffff) throw new ArchiveError("Archives ZIP64 non prises en charge.");
  if (total > LIMITS.maxFiles * 3) throw new ArchiveError(`Trop de fichiers : maximum ${LIMITS.maxFiles}.`);

  const out: RawEntry[] = [];
  for (let n = 0; n < total; n++) {
    if (offset + 46 > buf.length || buf.readUInt32LE(offset) !== 0x02014b50) throw new ArchiveError("Archive corrompue ou illisible.");
    const madeBy = buf.readUInt16LE(offset + 4);
    const flags = buf.readUInt16LE(offset + 8);
    const size = buf.readUInt32LE(offset + 24);
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    const attrs = buf.readUInt32LE(offset + 38);
    const name = buf.subarray(offset + 46, offset + 46 + nameLen).toString(flags & 0x800 ? "utf8" : "latin1");
    const unixMode = madeBy >> 8 === 3 ? (attrs >>> 16) & 0xffff : null;
    out.push({ name, unixMode, size, isDir: name.endsWith("/") });
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}

/** Lit une entrée en arrêtant la décompression dès que la limite est dépassée (anti « zip bomb »). */
function readEntryLimited(entry: JSZip.JSZipObject, limit: number, path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    let n = 0;
    let done = false;
    const stream = (
      entry as unknown as {
        internalStream(type: string): {
          on(ev: string, cb: (...a: any[]) => void): void;
          pause(): void;
          resume(): void;
        };
      }
    ).internalStream("uint8array");
    stream.on("data", (d: Uint8Array) => {
      if (done) return;
      n += d.length;
      if (n > limit) {
        done = true;
        stream.pause();
        reject(new ArchiveError(`« ${path} » : fichier trop volumineux une fois décompressé.`));
        return;
      }
      chunks.push(d);
    });
    stream.on("error", () => {
      if (!done) {
        done = true;
        reject(new ArchiveError("Archive corrompue ou illisible."));
      }
    });
    stream.on("end", () => {
      if (!done) {
        done = true;
        resolve(Buffer.concat(chunks));
      }
    });
    stream.resume();
  });
}

export type ReadOptions = {
  /** Premiers segments de dossiers de la version de base (pour décider de retirer un dossier racine). */
  baseTopFolders?: Set<string>;
};

export type ReadResult = {
  files: FileRec[];
  manifest: { project?: string; version?: string } | null;
  ignored: number;
};

/**
 * Analyse une archive ZIP NON FIABLE. Rien n'est exécuté : les entrées sont seulement lues,
 * contrôlées (taille, chemins, types, secrets) puis retournées en mémoire.
 */
export async function readArchive(buf: Buffer, opts: ReadOptions = {}): Promise<ReadResult> {
  if (buf.length === 0) throw new ArchiveError("Le fichier est vide.");
  if (buf.length > LIMITS.maxZipBytes) {
    throw new ArchiveError(`Archive trop volumineuse : la taille maximale est de ${Math.round(LIMITS.maxZipBytes / 1048576)} Mo.`);
  }
  const magic = buf.subarray(0, 4).toString("hex");
  if (magic !== "504b0304" && magic !== "504b0506") {
    throw new ArchiveError("Ce fichier n’est pas une archive ZIP valide.");
  }

  // 1) Contrôle des noms BRUTS du répertoire central (JSZip normalise les chemins, ce qui masquerait « ../ »).
  const raw = scanCentralDirectory(buf);
  const rawFiles = raw.filter((e) => !e.isDir);
  if (rawFiles.length > LIMITS.maxFiles) throw new ArchiveError(`Trop de fichiers : maximum ${LIMITS.maxFiles}.`);

  const issues: string[] = [];
  const rawNames = new Set<string>();
  let declaredTotal = 0;
  for (const e of raw) {
    const bad = checkPath(e.name);
    if (bad) {
      issues.push(`« ${e.name.slice(0, 80)} » : ${bad}`);
      continue;
    }
    if (e.isDir) continue;
    if (e.unixMode !== null && (e.unixMode & 0o170000) === 0o120000) {
      issues.push(`« ${e.name} » : lien symbolique interdit`);
      continue;
    }
    if (rawNames.has(e.name)) issues.push(`« ${e.name} » : fichier en double dans l’archive`);
    rawNames.add(e.name);
    if (e.size > LIMITS.maxFileBytes) issues.push(`« ${e.name} » : fichier trop volumineux (maximum ${LIMITS.maxFileBytes / 1048576} Mo)`);
    declaredTotal += e.size;
  }
  if (declaredTotal > LIMITS.maxTotalBytes) {
    throw new ArchiveError(`Contenu décompressé trop volumineux : maximum ${LIMITS.maxTotalBytes / 1048576} Mo.`);
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buf, { checkCRC32: true });
  } catch {
    throw new ArchiveError("Archive corrompue ou illisible.");
  }

  // 2) Contrôle du type de chaque fichier.
  const accepted: { entry: JSZip.JSZipObject; path: string; isText: boolean }[] = [];
  let ignored = 0;
  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;
    const bad = checkPath(entry.name);
    if (bad) {
      issues.push(`« ${entry.name.slice(0, 80)} » : ${bad}`);
      continue;
    }
    const path = entry.name.split("/").filter((s) => s !== "" && s !== ".").join("/");
    const base = path.split("/").pop()!.toLowerCase();
    if (path.startsWith("__MACOSX/") || IGNORED_NAMES.has(base)) {
      ignored++;
      continue;
    }
    const type = checkFileType(path);
    if (typeof type === "string") {
      issues.push(`« ${path} » : ${type}`);
      continue;
    }
    accepted.push({ entry, path, isText: type.isText });
  }
  if (issues.length) {
    const unique = [...new Set(issues)];
    const shown = unique.slice(0, 8);
    if (unique.length > shown.length) shown.push(`… et ${unique.length - shown.length} autre(s) problème(s)`);
    throw new ArchiveError("L’archive a été refusée : elle contient des éléments non autorisés.", shown);
  }

  const seen = new Set<string>();
  let files: FileRec[] = [];
  let total = 0;
  for (const { entry, path, isText } of accepted) {
    if (seen.has(path)) {
      issues.push(`« ${path} » : fichier en double dans l’archive`);
      continue;
    }
    seen.add(path);
    const data = await readEntryLimited(entry, LIMITS.maxFileBytes, path);
    total += data.length;
    if (data.length > LIMITS.maxFileBytes) {
      issues.push(`« ${path} » : fichier trop volumineux`);
      continue;
    }
    if (total > LIMITS.maxTotalBytes) {
      throw new ArchiveError(`Contenu décompressé trop volumineux : maximum ${LIMITS.maxTotalBytes / 1048576} Mo.`);
    }
    let text = isText;
    if (text && hasNul(data)) text = false;
    if (text) {
      const content = data.toString("utf8");
      const hit = SECRET_PATTERNS.find(([re]) => re.test(content));
      if (hit) issues.push(`« ${path} » : secret probable détecté (${hit[1]}). Retirez-le avant d’envoyer.`);
    }
    files.push(makeFile(path, data, text));
  }
  if (issues.length) {
    throw new ArchiveError("L’archive a été refusée : elle contient des éléments non autorisés.", issues.slice(0, 8));
  }

  // Retire un dossier racine unique (ex. « mon-projet/ ») sauf s'il existe aussi dans la version de base.
  if (files.length && files.every((f) => f.path.includes("/"))) {
    const top = files[0].path.split("/")[0];
    if (files.every((f) => f.path.startsWith(top + "/")) && !opts.baseTopFolders?.has(top)) {
      files = files.map((f) => ({ ...f, path: f.path.slice(top.length + 1) }));
    }
  }

  let manifest: ReadResult["manifest"] = null;
  const mi = files.findIndex((f) => f.path === "DEVELLINE.json");
  if (mi >= 0) {
    try {
      const parsed = JSON.parse(files[mi].data.toString("utf8"));
      manifest = { project: String(parsed.project ?? ""), version: String(parsed.version ?? "") };
    } catch {
      manifest = null;
    }
    files.splice(mi, 1);
  }

  if (files.length === 0) throw new ArchiveError("L’archive ne contient aucun fichier utilisable.");
  return { files, manifest, ignored };
}

/** Construit une archive ZIP à partir de fichiers (copie de travail). */
export async function buildZip(files: { path: string; data: Buffer }[], manifest: object): Promise<Buffer> {
  const zip = new JSZip();
  for (const f of files) zip.file(f.path, f.data);
  zip.file("DEVELLINE.json", JSON.stringify(manifest, null, 2));
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
}
