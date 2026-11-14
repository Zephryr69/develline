export type SprintInfo = {
  state: "delivered" | "expired" | "last-week" | "active";
  daysLeft: number;
  progress: number;
  label: string;
};

export function sprintInfo(p: {
  status: string;
  sprint_ends_at: Date | string;
  target_versions: number;
  accepted_count: number;
}): SprintInfo {
  const progress = Math.min(100, Math.round((p.accepted_count / Math.max(1, p.target_versions)) * 100));
  if (p.status === "delivered") return { state: "delivered", daysLeft: 0, progress: 100, label: "Livré" };
  const ms = new Date(p.sprint_ends_at).getTime() - Date.now();
  const daysLeft = Math.ceil(ms / 86400_000);
  if (daysLeft < 0) return { state: "expired", daysLeft: 0, progress, label: "Sprint expiré" };
  if (daysLeft <= 7) return { state: "last-week", daysLeft, progress, label: "Dernière semaine" };
  return { state: "active", daysLeft, progress, label: "En cours" };
}
