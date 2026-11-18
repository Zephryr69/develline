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

  // Menu ouvert : on bloque le défilement de la page et Échap le referme.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 992 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
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

          <div className={styles.right}>
            {/* Le thème reste toujours visible dans la barre, jamais caché dans le menu. */}
            <ThemeToggle />
            <div className={styles.desktopActions}>
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
              aria-controls="menu-mobile"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <LuX size={22} /> : <LuMenu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile : opaque, avec un fond assombri derrière (placé hors du <header> pour ne pas hériter de son flou). */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className={styles.overlay} onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} aria-hidden="true" />
            <motion.nav
              id="menu-mobile"
              className={styles.mobile}
              aria-label="Navigation mobile"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {LINKS.map((l) => (
                <a key={l.label} href={l.href} onClick={close} className={styles.mobileLink}>
                  {l.label}
                </a>
              ))}
              <div className={styles.mobileActions}>
                {userName ? (
                  <Button variant="primary" size="lg" full href={PATHS.dashboard}>
                    <LuLayoutDashboard /> Mon espace
                  </Button>
                ) : (
                  <>
                    <Button variant="primary" size="lg" full href={PATHS.newProject}>
                      Lancer mon projet <LuArrowUpRight />
                    </Button>
                    <Button variant="outline" size="lg" full href={PATHS.login}>
                      Connexion
                    </Button>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
