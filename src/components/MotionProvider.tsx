"use client";

import { MotionConfig } from "framer-motion";

/** Respecte la préférence « réduire les animations » du système. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
