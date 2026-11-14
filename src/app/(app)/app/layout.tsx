import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import { requireUser } from "@/server/auth";
import styles from "./layout.module.css";

export const metadata: Metadata = { title: { default: "Mon espace", template: "%s · DEVEL line" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/app");
  return (
    <div className={styles.shell}>
      <AppHeader userName={user.name} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
