import { randomUUID } from "node:crypto";
import { query, type Query } from "@/db";

export type AuditEntry = { id: string; action: string; detail: string; created_at: Date; user_name: string | null };

export async function logAction(q: Query, projectId: string | null, userId: string | null, action: string, detail = "") {
  await q("insert into audit_logs (id, project_id, user_id, action, detail) values ($1,$2,$3,$4,$5)", [
    randomUUID(),
    projectId,
    userId,
    action,
    detail.slice(0, 300),
  ]);
}

export async function listActivity(projectId: string, limit = 20): Promise<AuditEntry[]> {
  return query<AuditEntry>(
    `select a.id, a.action, a.detail, a.created_at, u.name as user_name
       from audit_logs a left join users u on u.id = a.user_id
      where a.project_id = $1 order by a.created_at desc, a.id limit $2`,
    [projectId, limit]
  );
}

export const ACTION_LABELS: Record<string, string> = {
  "project.created": "a créé le projet",
  "project.updated": "a modifié les informations du projet",
  "project.delivered": "a marqué le projet comme livré",
  "member.invited": "a invité",
  "member.accepted": "a rejoint le projet",
  "member.declined": "a refusé l’invitation",
  "member.removed": "a retiré",
  "member.role": "a modifié le droit de",
  "contribution.submitted": "a soumis une contribution",
  "contribution.accepted": "a accepté la contribution",
  "contribution.rejected": "a rejeté la contribution",
  "version.restored": "a restauré",
};
