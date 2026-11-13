import type { Metadata } from "next";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export const metadata: Metadata = {
  title: "Espace de travail — DEVEL line",
  description: "Prototype de l’espace de travail DEVEL line.",
};

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
