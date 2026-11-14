"use client";

import { LuCopy } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";

export default function CopyLink({ url, label = "Copier le lien" }: { url: string; label?: string }) {
  const toast = useToast();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Lien copié.");
        } catch {
          toast.error("Impossible de copier automatiquement.");
        }
      }}
    >
      <LuCopy /> {label}
    </Button>
  );
}
