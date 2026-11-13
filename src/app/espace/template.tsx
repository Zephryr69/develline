"use client";

import { motion } from "framer-motion";

/** Transition douce à chaque changement de page de l'espace de travail. */
export default function EspaceTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
