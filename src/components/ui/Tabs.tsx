"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PATHS } from "@/lib/routes";
import styles from "./Tabs.module.css";

const TABS = [
  { href: PATHS.project, label: "Aperçu" },
  { href: PATHS.files, label: "Fichiers" },
  { href: PATHS.contributions, label: "Contributions" },
  { href: PATHS.versions, label: "Versions" },
  { href: PATHS.members, label: "Membres" },
];

export default function Tabs() {
  const pathname = usePathname();
  return (
    <nav className={styles.tabs} aria-label="Sections du projet">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={`${styles.tab} ${pathname === t.href ? styles.active : ""}`} aria-current={pathname === t.href ? "page" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
