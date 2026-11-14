"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./ToastProvider.module.css";

type Toast = { id: number; message: string; tone: "ok" | "error" };
type Ctx = { success: (m: string) => void; error: (m: string) => void };

const ToastContext = createContext<Ctx>({ success: () => {}, error: () => {} });
export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const show = useCallback((message: string, tone: Toast["tone"]) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: ++seq.current, message, tone });
    timer.current = setTimeout(() => setToast(null), tone === "error" ? 6000 : 3500);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const value: Ctx = { success: (m) => show(m, "ok"), error: (m) => show(m, "error") };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={`${styles.toast} ${toast.tone === "error" ? styles.error : ""}`}
            role={toast.tone === "error" ? "alert" : "status"}
            aria-live="polite"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
