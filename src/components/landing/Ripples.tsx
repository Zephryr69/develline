"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./Ripples.module.css";

/** Ondes d'eau concentriques. Sans animation si l'utilisateur demande « réduire les animations ». */
export default function Ripples({ rings = 5, gold = true }: { rings?: number; gold?: boolean }) {
  const reduce = useReducedMotion();
  const list = Array.from({ length: rings }, (_, i) => i);

  return (
    <div className={styles.ripples} aria-hidden="true">
      {list.map((i) =>
        reduce ? (
          <span
            key={i}
            className={`${styles.ring} ${gold && i === 0 ? styles.gold : ""}`}
            style={{ transform: `scale(${0.4 + i * 0.2})`, opacity: 0.85 - i * 0.14 }}
          />
        ) : (
          <motion.span
            key={i}
            className={`${styles.ring} ${gold && i === 0 ? styles.gold : ""}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.25], opacity: [0, 0.9, 0] }}
            transition={{ duration: 10, delay: i * (10 / rings), repeat: Infinity, ease: "easeOut" }}
          />
        )
      )}
      <span className={styles.core} />
    </div>
  );
}
