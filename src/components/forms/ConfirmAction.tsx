"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";
import type { ActionState } from "@/lib/action-state";
import styles from "./ConfirmAction.module.css";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/** Bouton déclenchant une action serveur après confirmation dans une boîte de dialogue. */
export default function ConfirmAction({
  action,
  fields,
  title,
  body,
  confirmText,
  children,
  variant = "outline",
  confirmVariant = "primary",
  size = "sm",
  noteField,
}: {
  action: Action;
  fields: Record<string, string>;
  title: string;
  body: string;
  confirmText: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "danger" | "default";
  confirmVariant?: "primary" | "danger";
  size?: "sm" | "md" | "lg";
  noteField?: { name: string; label: string; placeholder?: string };
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, {} as ActionState);
  const toast = useToast();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.error) toast.error([state.error, ...(state.issues ?? [])].join(" · "));
    if (state.ok) toast.success(state.ok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <form action={formAction} className={styles.inline} onSubmit={() => setTimeout(() => setOpen(false), 0)}>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.backdrop}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <h2>{title}</h2>
              <p>{body}</p>
              {noteField && (
                <label className={styles.note}>
                  <span>{noteField.label}</span>
                  <textarea name={noteField.name} placeholder={noteField.placeholder} maxLength={500} rows={3} />
                </label>
              )}
              <div className={styles.actions}>
                <Button type="submit" variant={confirmVariant}>
                  {confirmText}
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
