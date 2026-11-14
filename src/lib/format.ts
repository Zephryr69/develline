const TZ = "Africa/Porto-Novo";

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
}

export function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

export function timeAgo(d: Date | string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return "à l’instant";
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.round(h / 24);
  if (days < 30) return `il y a ${days} j`;
  return formatDate(d);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1048576) return `${(n / 1024).toFixed(1).replace(".", ",")} Ko`;
  return `${(n / 1048576).toFixed(1).replace(".", ",")} Mo`;
}

export const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export const splitTags = (stack: string) => stack.split(",").map((t) => t.trim()).filter(Boolean);
