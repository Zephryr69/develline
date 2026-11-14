"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Tabs.module.css";

export type TabItem = { href: string; label: string; exact?: boolean; count?: number };

export default function Tabs({ items }: { items: TabItem[] }) {
  const pathname = usePathname();
  return (
    <nav className={styles.tabs} aria-label="Sections du projet">
      {items.map((t) => {
        const active = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link key={t.href} href={t.href} className={`${styles.tab} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined}>
            {t.label}
            {t.count ? <span className={styles.count}>{t.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
