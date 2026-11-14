"use client";

import Button from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div>
        <p className="eyebrow">ERREUR</p>
        <h1 style={{ fontSize: 36, letterSpacing: "-0.04em", margin: "16px 0" }}>Un incident est survenu</h1>
        <p className="muted" style={{ marginBottom: 22 }}>
          L’opération n’a pas pu aboutir. Vos données n’ont pas été modifiées. Réessayez dans un instant.
        </p>
        <Button variant="primary" onClick={reset}>
          Réessayer
        </Button>
      </div>
    </main>
  );
}
