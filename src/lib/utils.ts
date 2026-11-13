export function safeUrl(url: string): string {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol) ? u.href : "https://example.com";
  } catch {
    return "https://example.com";
  }
}

export function splitTags(stack: string): string[] {
  return stack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function endDateLabel(weeks: number): string {
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function plural(n: number, one: string, many: string): string {
  return n > 1 ? many : one;
}

export function downloadFile(name: string, content: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
