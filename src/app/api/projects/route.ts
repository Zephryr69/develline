import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { createProject } from "@/server/projects";
import { readArchive } from "@/server/zip";
import { jsonError, readUpload, tooLarge, unauthorized } from "@/server/http";
import { projectPath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (tooLarge(req)) return NextResponse.json({ ok: false, error: "Archive trop volumineuse pour le serveur." }, { status: 413 });

    const fd = await req.formData();
    const str = (k: string) => String(fd.get(k) ?? "");
    const upload = await readUpload(fd);
    const files = upload ? (await readArchive(upload.buffer)).files : undefined;

    const project = await createProject(
      user.id,
      {
        name: str("name"),
        description: str("description"),
        context: str("context"),
        docs: str("docs"),
        stack: str("stack"),
        visibility: str("visibility"),
        demo_url: str("demo_url"),
        weeks: Number(str("weeks") || 6),
      },
      files
    );
    return NextResponse.json({ ok: true, redirect: projectPath(project.slug) });
  } catch (e) {
    return jsonError(e);
  }
}
