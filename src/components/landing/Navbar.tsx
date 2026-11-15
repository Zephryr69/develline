"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuArrowUpRight, LuLayoutDashboard, LuMenu, LuX } from "react-icons/lu";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/ui/Button";
import { PATHS } from "@/lib/routes";
import styles from "./Navbar.module.css";

const LINKS = [
  { href: "/#comment", label: "COMMENT ÇA MARCHE", id: "comment" },
  { href: "/#pour-qui", label: "POUR QUI", id: "pour-qui" },
  { href: "/#ship-card", label: "SHIP CARD", id: "ship-card" },
  { href: "/#faq", label: "FAQ", id: "faq" },
  { href: PATHS.publicProjects, label: "PROJETS PUBLICS", id: "" },
];

export default function Navbar({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const ids = LINKS.map((l) => l.id).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.wrap}`}>
        <Logo />
        <nav className={styles.links} aria-label="Navigation principale">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className={l.id && active === l.id ? styles.active : ""}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className={styles.actions}>
          <ThemeToggle />
          {userName ? (
            <Button variant="primary" size="sm" href={PATHS.dashboard}>
              <LuLayoutDashboard /> Mon espace
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" href={PATHS.login}>
                Connexion
              </Button>
              <Button variant="primary" size="sm" href={PATHS.newProject}>
                Lancer mon projet <LuArrowUpRight />
              </Button>
            </>
          )}
        </div>
        <button
          className={styles.menuBtn}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <LuX size={18} /> : <LuMenu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className={styles.mobile}
            aria-label="Navigation mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            {userName ? (
              <Button variant="primary" href={PATHS.dashboard}>
                Mon espace
              </Button>
            ) : (
              <>
                <Button variant="outline" href={PATHS.login}>
                  Connexion
                </Button>
                <Button variant="primary" href={PATHS.newProject}>
                  Lancer mon projet
                </Button>
              </>
            )}
            <div className={styles.mobileTheme}>
              <span>Thème</span>
              <ThemeToggle />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
