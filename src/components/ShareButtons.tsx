"use client";

import { FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { LuCopy } from "react-icons/lu";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const toast = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié.");
    } catch {
      toast.error("Impossible de copier automatiquement : sélectionnez l’adresse dans la barre du navigateur.");
    }
  };
  const open = (target: string) => window.open(target, "_blank", "noopener,noreferrer");
  const u = encodeURIComponent(url);

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="outline" size="sm" onClick={copy}>
        <LuCopy /> Copier le lien
      </Button>
      <Button variant="outline" size="sm" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${title} : `)}${u}`)}>
        <FaWhatsapp /> WhatsApp
      </Button>
      <Button variant="outline" size="sm" onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`)}>
        <FaLinkedinIn /> LinkedIn
      </Button>
    </div>
  );
}
