"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { PATHS } from "@/lib/routes";
import styles from "./WorkspaceContext.module.css";

export type Submission = "none" | "pending" | "rejected" | "accepted";
export type Version = { id: string; text: string; author: string };

export type ProjectState = {
  name: string;
  description: string;
  stack: string;
  demo: string;
  weeks: number;
  created: boolean;
  invited: boolean;
  inviteRole: string;
  inviteAccepted: boolean;
  submission: Submission;
  title: string;
  summary: string;
  base: string;
  versions: Version[];
  accepted: number;
  delivered: boolean;
  history: string[];
  errorReason: string;
};

const INITIAL: ProjectState = {
  name: "Marché Local",
  description: "Une vitrine simple pour connecter les commerçants de quartier à leurs clients.",
  stack: "React, Mobile Money, Node.js",
  demo: "https://example.com",
  weeks: 6,
  created: false,
  invited: false,
  inviteRole: "Contribuer",
  inviteAccepted: false,
  submission: "none",
  title: "Améliorer la page d’accueil",
  summary: "Ajout de la présentation des commerçants.",
  base: "",
  versions: [{ id: "v1.0", text: "Version initiale", author: "Aïcha Mensah" }],
  accepted: 0,
  delivered: false,
  history: [],
  errorReason: "",
};

type ConfirmOptions = { title: string; body: string; confirmText: string; onConfirm: () => void };

type Ctx = {
  state: ProjectState;
  currentVersion: string;
  progress: number;
  wireframe: boolean;
  toggleWireframe: () => void;
  toast: (msg: string) => void;
  createProject: (d: { name: string; description: string; stack: string; demo: string; weeks: number }) => void;
  invite: (email: string, role: string) => void;
  acceptInvite: () => void;
  declineInvite: () => void;
  submitContribution: (d: { title: string; summary: string; base: string; errorReason: string }) => void;
  requestAccept: () => void;
  requestReject: () => void;
  requestRestore: (id: string) => void;
  requestDeliver: () => void;
};

const WorkspaceContext = createContext<Ctx | null>(null);

export function useWorkspace(): Ctx {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace doit être utilisé dans <WorkspaceProvider>.");
  return ctx;
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<ProjectState>(INITIAL);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [wireframe, setWireframe] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3300);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDialog(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  const patch = useCallback((fn: (s: ProjectState) => Partial<ProjectState>) => {
    setState((s) => ({ ...s, ...fn(s) }));
  }, []);

  const currentVersion = state.versions[state.versions.length - 1].id;
  const progress = Math.min(100, Math.round((state.accepted / 4) * 100));

  const createProject: Ctx["createProject"] = (d) => {
    patch((s) => ({ ...d, created: true, history: [...s.history, "Projet créé"] }));
    router.push(PATHS.members);
    toast("Projet créé. Invitez votre équipe.");
  };

  const invite: Ctx["invite"] = (email, role) => {
    patch((s) => ({
      invited: true,
      inviteRole: role,
      history: [...s.history, `Invitation envoyée à ${email} · ${role}`],
    }));
    toast("Invitation simulée envoyée.");
  };

  const acceptInvite = () => {
    patch((s) => ({ inviteAccepted: true, history: [...s.history, "Invitation de Kofi acceptée"] }));
    toast("Invitation acceptée.");
  };

  const declineInvite = () => {
    patch((s) => ({ invited: false, inviteAccepted: false, history: [...s.history, "Invitation de Kofi refusée"] }));
    toast("Invitation refusée.");
  };

  const submitContribution: Ctx["submitContribution"] = ({ title, summary, base, errorReason }) => {
    if (errorReason) {
      patch(() => ({ title, summary, base, errorReason }));
      router.push(PATHS.archiveError);
      return;
    }
    patch((s) => ({
      title,
      summary,
      base,
      errorReason: "",
      submission: "pending",
      history: [...s.history, `Contribution soumise : ${title}`],
    }));
    router.push(PATHS.review);
    toast("Contribution envoyée pour revue.");
  };

  const requestReject = () =>
    setDialog({
      title: "Rejeter cette contribution ?",
      body: "La version principale restera inchangée. Le collaborateur pourra corriger et soumettre à nouveau.",
      confirmText: "Confirmer le rejet",
      onConfirm: () => {
        patch((s) => ({ submission: "rejected", history: [...s.history, `Contribution rejetée : ${s.title}`] }));
        router.push(PATHS.contributions);
        toast("Contribution rejetée. La version principale est inchangée.");
      },
    });

  const requestAccept = () =>
    setDialog({
      title: "Accepter cette contribution ?",
      body: "Une nouvelle version sera créée et la contribution sera créditée à Kofi Diallo.",
      confirmText: "Accepter et créer la version",
      onConfirm: () => {
        const s = stateRef.current;
        const id = `v1.${s.versions.length}`;
        patch((cur) => ({
          submission: "accepted",
          accepted: cur.accepted + 1,
          versions: [...cur.versions, { id, text: cur.title, author: "Kofi Diallo" }],
          history: [...cur.history, `Contribution acceptée : ${cur.title} · ${id}`],
        }));
        router.push(PATHS.versions);
        toast(`Contribution acceptée. Nouvelle version ${id}.`);
      },
    });

  const requestRestore = (id: string) =>
    setDialog({
      title: `Restaurer ${id} ?`,
      body: `La restauration est non destructive : une nouvelle version sera créée à partir de ${id}. Les versions actuelles restent dans l’historique.`,
      confirmText: "Créer une version restaurée",
      onConfirm: () => {
        const next = `v1.${stateRef.current.versions.length}`;
        patch((cur) => ({
          versions: [...cur.versions, { id: next, text: `Restauration de ${id}`, author: "Aïcha Mensah" }],
          history: [...cur.history, `Restauration de ${id} en ${next}`],
        }));
        toast(`Restauration créée : ${next}.`);
      },
    });

  const requestDeliver = () =>
    setDialog({
      title: "Marquer le projet comme livré ?",
      body: "La Ship Card publique sera disponible et le sprint sera marqué comme terminé.",
      confirmText: "Confirmer la livraison",
      onConfirm: () => {
        patch((s) => ({ delivered: true, history: [...s.history, "Projet marqué comme livré"] }));
        router.push(PATHS.card);
        toast("Projet livré. Votre Ship Card est prête.");
      },
    });

  const value: Ctx = {
    state,
    currentVersion,
    progress,
    wireframe,
    toggleWireframe: () => {
      const next = !wireframe;
      setWireframe(next);
      toast(next ? "Vue basse fidélité activée." : "Vue haute fidélité activée.");
    },
    toast,
    createProject,
    invite,
    acceptInvite,
    declineInvite,
    submitContribution,
    requestAccept,
    requestReject,
    requestRestore,
    requestDeliver,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {dialog && (
          <motion.div
            className={styles.backdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setDialog(null);
            }}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <h2 id="modalTitle">{dialog.title}</h2>
              <p>{dialog.body}</p>
              <div className={styles.actions}>
                <Button
                  variant="primary"
                  autoFocus
                  onClick={() => {
                    const fn = dialog.onConfirm;
                    setDialog(null);
                    fn();
                  }}
                >
                  {dialog.confirmText}
                </Button>
                <Button variant="outline" onClick={() => setDialog(null)}>
                  Annuler
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            key={toastMsg}
            className={styles.toast}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </WorkspaceContext.Provider>
  );
}
