import { randomBytes, randomUUID } from "node:crypto";
import { query, tx } from "@/db";
import { AppError, forbidden } from "./errors";
import { logAction } from "./audit";
import { isEmail, normalizeEmail } from "./auth-core";
import type { Project } from "./projects";

export type Member = {
  id: string;
  project_id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: "contribute" | "view";
  status: "pending" | "accepted" | "declined";
  token: string;
  created_at: Date;
};

export type Invitation = Member & { project_name: string; project_slug: string; inviter_name: string };

export const listMembers = (projectId: string) =>
  query<Member>(
    `select m.id, m.project_id, m.user_id, m.email, u.name, m.role, m.status, m.token, m.created_at
       from project_members m left join users u on u.id = m.user_id
      where m.project_id = $1 order by m.created_at`,
    [projectId]
  );

export async function inviteMember(owner: { id: string; email: string }, project: Project, emailRaw: string, role: string): Promise<Member> {
  if (project.owner_id !== owner.id) throw forbidden("Seul le propriétaire peut inviter des membres.");
  if (project.status === "delivered") throw new AppError("Le projet est livré : les invitations sont closes.");
  const email = normalizeEmail(emailRaw);
  if (!isEmail(email)) throw new AppError("Adresse e-mail invalide.");
  if (!["contribute", "view"].includes(role)) throw new AppError("Droit d’accès invalide.");
  if (email === normalizeEmail(owner.email)) throw new AppError("Vous êtes déjà propriétaire de ce projet.");

  return tx(async (q) => {
    const user = (await q<{ id: string }>("select id from users where lower(email) = $1", [email]))[0];
    const existing = (await q<Member>("select * from project_members where project_id = $1 and lower(email) = $2", [project.id, email]))[0];
    if (existing?.status === "accepted") throw new AppError("Cette personne est déjà membre du projet.", "conflict");
    if (existing?.status === "pending") throw new AppError("Une invitation est déjà en attente pour cette adresse.", "conflict");

    const token = randomBytes(18).toString("hex");
    let row: Member;
    if (existing) {
      row = (
        await q<Member>(
          "update project_members set status='pending', role=$2, user_id=$3, token=$4, invited_by=$5, responded_at=null where id=$1 returning *",
          [existing.id, role, user?.id ?? null, token, owner.id]
        )
      )[0];
    } else {
      row = (
        await q<Member>(
          `insert into project_members (id, project_id, user_id, email, role, token, invited_by)
           values ($1,$2,$3,$4,$5,$6,$7) returning *`,
          [randomUUID(), project.id, user?.id ?? null, email, role, token, owner.id]
        )
      )[0];
    }
    await logAction(q, project.id, owner.id, "member.invited", `${email} · ${role === "contribute" ? "contribuer" : "consulter"}`);
    return row;
  });
}

const INVITE_SELECT = `
  select m.id, m.project_id, m.user_id, m.email, null::text as name, m.role, m.status, m.token, m.created_at,
         p.name as project_name, p.slug as project_slug, i.name as inviter_name
    from project_members m
    join projects p on p.id = m.project_id
    join users i on i.id = m.invited_by`;

export const listPendingInvitations = (user: { id: string; email: string }) =>
  query<Invitation>(
    `${INVITE_SELECT} where m.status = 'pending' and (m.user_id = $1 or lower(m.email) = $2) order by m.created_at desc`,
    [user.id, normalizeEmail(user.email)]
  );

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const rows = await query<Invitation>(`${INVITE_SELECT} where m.token = $1`, [token]);
  return rows[0] ?? null;
}

async function respond(user: { id: string; email: string }, invitation: Invitation, accept: boolean, viaToken: boolean) {
  if (invitation.status !== "pending") throw new AppError("Cette invitation n’est plus valide.", "conflict");
  const mine = invitation.user_id === user.id || normalizeEmail(invitation.email) === normalizeEmail(user.email);
  if (!mine && !viaToken) throw forbidden("Cette invitation ne vous est pas destinée.");

  await tx(async (q) => {
    const proj = (await q<{ owner_id: string }>("select owner_id from projects where id = $1", [invitation.project_id]))[0];
    if (proj?.owner_id === user.id) throw new AppError("Vous êtes déjà propriétaire de ce projet.");
    if (accept) {
      const dup = await q("select 1 from project_members where project_id=$1 and user_id=$2 and status='accepted' and id <> $3", [
        invitation.project_id, user.id, invitation.id,
      ]);
      if (dup.length) throw new AppError("Vous êtes déjà membre de ce projet.", "conflict");
    }
    await q("update project_members set status=$2, user_id=$3, responded_at=now() where id=$1", [
      invitation.id, accept ? "accepted" : "declined", user.id,
    ]);
    await logAction(q, invitation.project_id, user.id, accept ? "member.accepted" : "member.declined", "");
  });
}

export async function respondToInvitation(user: { id: string; email: string }, memberId: string, accept: boolean) {
  const rows = await query<Invitation>(`${INVITE_SELECT} where m.id = $1`, [memberId]);
  if (!rows[0]) throw new AppError("Invitation introuvable.", "not_found");
  await respond(user, rows[0], accept, false);
}

export async function respondByToken(user: { id: string; email: string }, token: string, accept: boolean) {
  const inv = await getInvitationByToken(token);
  if (!inv) throw new AppError("Invitation introuvable.", "not_found");
  await respond(user, inv, accept, true);
  return inv.project_slug;
}

export async function removeMember(owner: { id: string }, project: Project, memberId: string) {
  if (project.owner_id !== owner.id) throw forbidden("Seul le propriétaire peut retirer un membre.");
  await tx(async (q) => {
    const m = (await q<{ email: string }>("select email from project_members where id=$1 and project_id=$2", [memberId, project.id]))[0];
    if (!m) throw new AppError("Membre introuvable.", "not_found");
    await q("delete from project_members where id = $1", [memberId]);
    await logAction(q, project.id, owner.id, "member.removed", m.email);
  });
}

export async function setMemberRole(owner: { id: string }, project: Project, memberId: string, role: string) {
  if (project.owner_id !== owner.id) throw forbidden("Seul le propriétaire peut modifier les droits.");
  if (!["contribute", "view"].includes(role)) throw new AppError("Droit d’accès invalide.");
  await tx(async (q) => {
    const m = (await q<{ email: string }>("update project_members set role=$3 where id=$1 and project_id=$2 returning email", [memberId, project.id, role]))[0];
    if (!m) throw new AppError("Membre introuvable.", "not_found");
    await logAction(q, project.id, owner.id, "member.role", `${m.email} → ${role === "contribute" ? "contribuer" : "consulter"}`);
  });
}
