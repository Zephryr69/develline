"use client";

import { FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { LuBadgeCheck, LuCopy, LuExternalLink, LuStore } from "react-icons/lu";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { Avatar, FormActions, ListRow, MiniLabel, PageHead, Paragraph, RowMain, Tags } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { PATHS } from "@/lib/routes";
import { plural, safeUrl, splitTags } from "@/lib/utils";
import styles from "./page.module.css";

export default function ShipCardPage() {
  const { state, currentVersion, toast } = useWorkspace();

  const shareUrl = () => `${window.location.origin}${PATHS.card}`;

  const copyLink = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(shareUrl())
        .then(() => toast("Lien copié."))
        .catch(() => toast("Copiez l’adresse de cette page pour la partager."));
    } else {
      toast("Copiez l’adresse de cette page pour la partager.");
    }
  };

  const share = (kind: "whatsapp" | "linkedin") => {
    const url = encodeURIComponent(shareUrl());
    const target =
      kind === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent("Découvrez ce projet DEVEL line : ")}${url}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const status = state.delivered ? "Livré" : "En cours";

  return (
    <>
      <PageHead crumb="VITRINE / SHIP CARD" title="La preuve, en un lien" description="Aperçu public et partageable du projet." />
      <motion.div className={styles.card} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, ease: "easeOut" }}>
        <div className={styles.top}>
          <span className={styles.label}>DEVEL LINE / SHIP CARD</span>
          <span className={styles.verified}>
            <LuBadgeCheck /> {state.delivered ? "LIVRÉ" : "EN COURS"}
          </span>
        </div>
        <div className={styles.body}>
          <div className={styles.projectIcon}>
            <LuStore />
          </div>
          <h2>{state.name}</h2>
          <p>{state.description}</p>
          <Tags tags={splitTags(state.stack)} />

          <div className={styles.stats}>
            <div>
              <MiniLabel>STATUT</MiniLabel>
              <strong>{status}</strong>
            </div>
            <div>
              <MiniLabel>VERSION</MiniLabel>
              <strong>{currentVersion}</strong>
            </div>
            <div>
              <MiniLabel>HISTORIQUE</MiniLabel>
              <strong>
                {state.versions.length} {plural(state.versions.length, "version", "versions")}
              </strong>
            </div>
            <div>
              <MiniLabel>SPRINT</MiniLabel>
              <strong>{state.weeks} semaines</strong>
            </div>
          </div>

          <h3>Contributeurs</h3>
          <ListRow>
            <Avatar initials="AM" />
            <RowMain title="Aïcha Mensah" sub="Propriétaire · création du projet" />
          </ListRow>
          {state.accepted ? (
            <ListRow>
              <Avatar initials="KD" />
              <RowMain title="Kofi Diallo" sub={`${state.accepted} ${plural(state.accepted, "contribution acceptée", "contributions acceptées")} · ${state.title}`} />
            </ListRow>
          ) : (
            <Paragraph>Les contributions acceptées apparaîtront ici.</Paragraph>
          )}

          <FormActions>
            <Button variant="primary" href={safeUrl(state.demo)} external>
              Voir la démo <LuExternalLink />
            </Button>
            <Button variant="outline" onClick={copyLink}>
              Copier le lien <LuCopy />
            </Button>
          </FormActions>
          <div className={styles.share}>
            <Button variant="outline" size="sm" onClick={() => share("whatsapp")}>
              <FaWhatsapp /> Partager sur WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => share("linkedin")}>
              <FaLinkedinIn /> Partager sur LinkedIn
            </Button>
          </div>
          <Paragraph small>Prototype : le lien partagé renvoie à cette page de démonstration.</Paragraph>
        </div>
      </motion.div>
    </>
  );
}
