"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Button from "@/components/ui/Button";
import { Notice } from "@/components/ui/Primitives";
import { useToast } from "@/components/ToastProvider";
import type { ActionState } from "@/lib/action-state";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function SubmitButton({
  children,
  pendingLabel = "Patientez…",
  variant = "primary",
  size,
  full,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "default" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  full?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} full={full} disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

export default function ActionForm({
  action,
  children,
  resetOnOk,
  className,
}: {
  action: Action;
  children: React.ReactNode;
  resetOnOk?: boolean;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {} as ActionState);
  const toast = useToast();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success(state.ok);
      if (resetOnOk) ref.current?.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {state.error && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="error" items={state.issues}>
            {state.error}
          </Notice>
        </div>
      )}
      {children}
    </form>
  );
}
