import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RESOURCES } from "@/lib/resources";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(RESOURCES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: RESOURCES[slug]?.title ?? "Ressources" };
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = RESOURCES[slug];
  if (!page) notFound();

  return (
    <div className={`container ${styles.wrap}`}>
      <span className="eyebrow">RESSOURCES</span>
      <h1>{page.title}</h1>
      <p className={styles.intro}>{page.intro}</p>
      {page.sections.map((s) => (
        <section key={s.heading} className={styles.section}>
          <h2>{s.heading}</h2>
          <p>{s.body}</p>
        </section>
      ))}
    </div>
  );
}
