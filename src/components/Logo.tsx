import Link from "next/link";
import { LuTerminal } from "react-icons/lu";
import styles from "./Logo.module.css";

export default function Logo({ size = "md", href = "/" }: { size?: "md" | "sm"; href?: string }) {
  return (
    <Link href={href} className={`${styles.logo} ${size === "sm" ? styles.sm : ""}`} aria-label="DEVEL line, accueil">
      <span className={styles.mark}>
        <LuTerminal />
      </span>
      <span>
        DEVEL<span className={styles.accent}> line</span>
      </span>
    </Link>
  );
}
