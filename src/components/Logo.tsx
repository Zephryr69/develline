import Link from "next/link";
import styles from "./Logo.module.css";

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg className={styles.mark} width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="11" fill="#1f3a8f" />
      <path d="M14 12.5h9.2c7.4 0 12.3 5 12.3 11.5s-4.9 11.5-12.3 11.5H14z" stroke="#ffffff" strokeWidth="3.6" strokeLinejoin="round" />
      <path d="m22 19 5.5 5-5.5 5" stroke="#e3b02a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ size = "md", href = "/" }: { size?: "md" | "sm"; href?: string }) {
  return (
    <Link href={href} className={`${styles.logo} ${size === "sm" ? styles.sm : ""}`} aria-label="DEVEL line, accueil">
      <LogoMark size={size === "sm" ? 26 : 30} />
      <span>
        DEVEL<span className={styles.accent}> line</span>
      </span>
    </Link>
  );
}
