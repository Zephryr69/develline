import type { MetadataRoute } from "next";
import { listPublicProjects } from "@/server/projects";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const fixed = ["", "/projets", "/ressources/documentation", "/ressources/securite", "/ressources/faq"].map((p) => ({ url: `${base}${p}` }));
  try {
    const projects = await listPublicProjects();
    return [
      ...fixed,
      ...projects.flatMap((p) => [
        { url: `${base}/projets/${p.slug}`, lastModified: p.created_at },
        ...(p.status === "delivered" ? [{ url: `${base}/ship/${p.slug}`, lastModified: p.delivered_at ?? p.created_at }] : []),
      ]),
    ];
  } catch {
    return fixed;
  }
}
