"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuMoon, LuSun } from "react-icons/lu";
import styles from "./ThemeToggle.module.css";

export const THEME_KEY = "dl-theme";

/** Script exécuté avant le premier rendu : évite tout flash de thème. */
export const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})();`;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* stockage indisponible : le thème reste valable pour la session */
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      className={styles.btn}
      onClick={toggle}
      aria-label={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}
      title={theme === "light" ? "Mode sombre" : "Mode clair"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme && (
          <motion.span
            key={theme}
            className={styles.icon}
            initial={{ rotate: -80, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 80, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            {theme === "light" ? <LuMoon /> : <LuSun />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
