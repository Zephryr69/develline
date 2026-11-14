import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { getAccess, getProjectBySlug } from "@/server/projects";
import { getVersionByLabel, loadVersionFilesWithData } from "@/server/versions";
import { buildZip } from "@/server/zip";

export const dynamic = "force-dynamic";

/** Copie de travail : ZIP des fichiers d'une version précise (réservé aux membres). */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const user = await getCurrentUser();
  const project = await getProjectBySlug(slug);
  if (!project) return NextResponse.json({ error: "Projet introuvable." }, { status: 404 });

  const access = await getAccess(project, user);
  if (!access.canSeeFiles) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });

  const label = new URL(req.url).searchParams.get("v") || project.current_label || "";
  const version = await getVersionByLabel(project.id, label);
  if (!version) return NextResponse.json({ error: "Version introuvable." }, { status: 404 });

  const files = await loadVersionFilesWithData(version.id);
  const zip = await buildZip(files, { project: project.id, slug: project.slug, version: version.label });
  return new NextResponse(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${project.slug}-${version.label}.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
