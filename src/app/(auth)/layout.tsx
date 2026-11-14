import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./layout.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Logo />
        <ThemeToggle />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
