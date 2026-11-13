import { notFound } from "next/navigation";
import Button from "@/components/ui/Button";
import { PageHead, Panel, Paragraph } from "@/components/ui/Primitives";
import { PATHS, RESOURCES } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(RESOURCES).map((slug) => ({ slug }));
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = RESOURCES[slug];
  if (!page) notFound();

  return (
    <>
      <PageHead crumb="RESSOURCES" title={page.title} description="Informations sur DEVEL line." />
      <Panel maxWidth={700}>
        <Paragraph>{page.body}</Paragraph>
        <Button variant="outline" href={PATHS.dashboard}>
          Retour au tableau de bord
        </Button>
      </Panel>
    </>
  );
}
