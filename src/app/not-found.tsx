import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div>
        <p className="eyebrow">ERREUR 404</p>
        <h1 style={{ fontSize: 40, letterSpacing: "-0.04em", margin: "16px 0" }}>Page introuvable</h1>
        <p className="muted">Revenez à l’accueil pour continuer.</p>
        <Link href="/" style={{ color: "var(--accent)", fontWeight: 700 }}>
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
