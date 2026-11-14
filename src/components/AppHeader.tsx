"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuCompass, LuLayoutDashboard, LuLogOut, LuMenu, LuUserRound, LuX } from "react-icons/lu";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/ui/Button";
import { logoutAction } from "@/actions/auth";
import { PATHS } from "@/lib/routes";
import { initials } from "@/lib/format";
import styles from "./AppHeader.module.css";

const NAV = [
  { href: PATHS.dashboard, label: "Tableau de bord", icon: LuLayoutDashboard, exact: false },
  { href: PATHS.publicProjects, label: "Projets publics", icon: LuCompass, exact: true },
  { href: PATHS.profile, label: "Profil", icon: LuUserRound, exact: true },
];

export default function AppHeader({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string, exact: boolean) =>
    href === PATHS.dashboard ? pathname === href || pathname.startsWith("/app/projets") : exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className={styles.header}>
      <div className={styles.wrap}>
        <Logo size="sm" href={PATHS.dashboard} />
        <nav className={styles.nav} aria-label="Navigation de l’espace">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link key={href} href={href} className={`${styles.link} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined}>
                {active && <motion.span layoutId="appNavPill" className={styles.pill} transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                <span className={styles.linkContent}>
                  <Icon /> {label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className={styles.right}>
          <ThemeToggle />
          <span className={styles.avatar} title={userName}>
            {initials(userName)}
          </span>
          <form action={logoutAction} className={styles.logout}>
            <Button type="submit" variant="outline" size="sm">
              <LuLogOut /> Déconnexion
            </Button>
          </form>
          <button className={styles.menuBtn} aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <LuX size={18} /> : <LuMenu size={18} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav className={styles.mobile} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                <Icon /> {label}
              </Link>
            ))}
            <form action={logoutAction}>
              <Button type="submit" variant="outline" full>
                <LuLogOut /> Déconnexion
              </Button>
            </form>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
