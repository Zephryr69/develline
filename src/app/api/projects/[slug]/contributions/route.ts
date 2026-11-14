import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { getAccess, getProjectBySlug } from "@/server/projects";
import { submitContribution } from "@/server/contributions";
import { jsonError, readUpload, tooLarge, unauthorized } from "@/server/http";
import { AppError } from "@/server/errors";
import { projectPath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (tooLarge(req)) return NextResponse.json({ ok: false, error: "Archive trop volumineuse pour le serveur." }, { status: 413 });

    const project = await getProjectBySlug(slug);
    if (!project) throw new AppError("Projet introuvable.", "not_found");
    const access = await getAccess(project, user);
    if (!access.canSubmit) throw new AppError("Vous n’avez pas le droit de contribuer à ce projet.", "forbidden");

    const fd = await req.formData();
    const upload = await readUpload(fd);
    if (!upload) throw new AppError("Ajoutez l’archive ZIP contenant vos modifications.");

    const res = await submitContribution(
      user,
      project,
      access,
      { title: String(fd.get("title") ?? ""), summary: String(fd.get("summary") ?? ""), baseLabel: String(fd.get("base") ?? "") },
      upload
    );
    return NextResponse.json({ ok: true, redirect: projectPath(slug, `/contributions/${res.id}`) });
  } catch (e) {
    return jsonError(e);
  }
}
