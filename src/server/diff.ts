import { structuredPatch } from "diff";
import type { FileMeta } from "./versions";

export type Change = {
  path: string;
  status: "added" | "modified" | "deleted";
  size: number;
  oldSize: number;
  isText: boolean;
};

export function toMap(files: FileMeta[]): Map<string, FileMeta> {
  return new Map(files.map((f) => [f.path, f]));
}

/** Compare deux arbres de fichiers (par empreinte). */
export function computeChanges(base: Map<string, FileMeta>, next: Map<string, FileMeta>): Change[] {
  const out: Change[] = [];
  for (const [path, n] of next) {
    const b = base.get(path);
    if (!b) out.push({ path, status: "added", size: n.size, oldSize: 0, isText: n.isText });
    else if (b.sha256 !== n.sha256) out.push({ path, status: "modified", size: n.size, oldSize: b.size, isText: n.isText && b.isText });
  }
  for (const [path, b] of base) {
    if (!next.has(path)) out.push({ path, status: "deleted", size: 0, oldSize: b.size, isText: b.isText });
  }
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

export type DiffLine = { type: "add" | "del" | "ctx"; oldNo: number | null; newNo: number | null; text: string };
export type DiffHunk = { header: string; lines: DiffLine[] };
export type TextDiff = { hunks: DiffHunk[]; added: number; removed: number } | { tooLarge: true };

const MAX_BYTES = 300 * 1024;
const MAX_LINES = 8000;

export function textDiff(oldText: string, newText: string): TextDiff {
  if (oldText.length > MAX_BYTES || newText.length > MAX_BYTES) return { tooLarge: true };
  if (oldText.split("\n").length > MAX_LINES || newText.split("\n").length > MAX_LINES) return { tooLarge: true };

  const patch = structuredPatch("a", "b", oldText, newText, "", "", { context: 3 });
  let added = 0;
  let removed = 0;
  const hunks: DiffHunk[] = patch.hunks.map((h) => {
    let o = h.oldStart;
    let n = h.newStart;
    const lines: DiffLine[] = [];
    for (const raw of h.lines) {
      const mark = raw[0];
      const text = raw.slice(1);
      if (mark === "+") {
        lines.push({ type: "add", oldNo: null, newNo: n++, text });
        added++;
      } else if (mark === "-") {
        lines.push({ type: "del", oldNo: o++, newNo: null, text });
        removed++;
      } else if (mark === " ") {
        lines.push({ type: "ctx", oldNo: o++, newNo: n++, text });
      }
    }
    return { header: `@@ -${h.oldStart},${h.oldLines} +${h.newStart},${h.newLines} @@`, lines };
  });
  return { hunks, added, removed };
}
