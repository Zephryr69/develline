"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./Button.module.css";

type Variant = "default" | "primary" | "outline" | "danger";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  size?: "md" | "sm" | "lg";
  href?: string;
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  full?: boolean;
  autoFocus?: boolean;
};

const MotionLink = motion.create(Link);

export default function Button({
  children,
  variant = "default",
  size = "md",
  href,
  external,
  onClick,
  type = "button",
  disabled,
  className = "",
  full,
  autoFocus,
}: Props) {
  const cls = [
    styles.btn,
    styles[variant],
    size === "sm" ? styles.sm : size === "lg" ? styles.lg : "",
    full ? styles.full : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const tap = { scale: 0.97 };

  if (href && external) {
    return (
      <motion.a className={cls} href={href} target="_blank" rel="noopener noreferrer" whileTap={tap}>
        {children}
      </motion.a>
    );
  }
  if (href) {
    return (
      <MotionLink className={cls} href={href} whileTap={tap}>
        {children}
      </MotionLink>
    );
  }
  return (
    <motion.button className={cls} type={type} onClick={onClick} disabled={disabled} autoFocus={autoFocus} whileTap={disabled ? undefined : tap}>
      {children}
    </motion.button>
  );
}
