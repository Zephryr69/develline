"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LuX } from "react-icons/lu";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { DISCOVER_ITEMS, WORKSPACE_ITEMS, type SidebarItem } from "@/lib/routes";
import styles from "./WorkspaceShell.module.css";

function SideGroup({ label, items, pathname }: { label: string; items: SidebarItem[]; pathname: string }) {
  return (
    <>
      <div className={styles.sideLabel}>{label}</div>
      {items.map(({ href, label: text, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`${styles.sideBtn} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined}>
            {active && <motion.span layoutId="sideActive" className={styles.activePill} transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
            <span className={styles.sideContent}>
              <Icon /> {text}
            </span>
          </Link>
        );
      })}
    </>
  );
}

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { wireframe, toggleWireframe } = useWorkspace();
  const all = [...WORKSPACE_ITEMS, ...DISCOVER_ITEMS];

  return (
    <div className={styles.shell} data-wireframe={wireframe}>
      <header className={styles.header}>
        <Logo size="sm" />
        <span className={styles.headerLabel}>
          Espace de travail <Badge tone="neutral">PROTOTYPE</Badge>
        </span>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={toggleWireframe}>
            Wireframe
          </Button>
          <Button variant="outline" size="sm" href="/">
            Retour au site <LuX />
          </Button>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <SideGroup label="ESPACE DE TRAVAIL" items={WORKSPACE_ITEMS} pathname={pathname} />
          <SideGroup label="DÉCOUVRIR" items={DISCOVER_ITEMS} pathname={pathname} />
        </aside>

        <main className={styles.main}>
          <div className={styles.mobileNav}>
            <label className={styles.mobileLabel} htmlFor="mobileRoute">
              NAVIGATION DU PROTOTYPE
            </label>
            <select id="mobileRoute" value={all.some((i) => i.href === pathname) ? pathname : ""} onChange={(e) => router.push(e.target.value)}>
              {!all.some((i) => i.href === pathname) && <option value="">Autre page</option>}
              {all.map((i) => (
                <option key={i.href} value={i.href}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
