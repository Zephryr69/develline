/* Prépare une base de test (fichier) pour le test HTTP de bout en bout. */
process.env.PGLITE_DIR = process.env.PGLITE_DIR || "/tmp/e2e-db";
import { closeDb } from "@/db";
import { registerUser, createSession } from "@/server/auth-core";
import { createProject, updateProject, getProjectBySlug } from "@/server/projects";
import { inviteMember, respondToInvitation } from "@/server/members";
import { makeFile } from "@/server/zip";

(async () => {
  const A = await registerUser({ name: "Aïcha Mensah", email: "aicha@example.com", password: "motdepasse1" });
  const B = await registerUser({ name: "Kofi Diallo", email: "kofi@example.com", password: "motdepasse2" });
  const C = await registerUser({ name: "Intrus Externe", email: "intrus@example.com", password: "motdepasse3" });
  const files = [
    makeFile("README.md", Buffer.from("# Marché Local\n"), true),
    makeFile("src/App.jsx", Buffer.from("function App() { return <Home />; }\n"), true),
  ];
  const pub = await createProject(A.id, { name: "Marché Local", description: "Vitrine pour commerçants de quartier.", stack: "React, Mobile Money", visibility: "public", demo_url: "https://marche-local.vercel.app" }, files);
  const priv = await createProject(A.id, { name: "Projet Secret", description: "Un projet privé de test.", stack: "Node", visibility: "private" });
  const inv = await inviteMember(A, pub, "kofi@example.com", "contribute");
  await respondToInvitation(B, inv.id, true);
  const sa = await createSession(A.id), sb = await createSession(B.id), sc = await createSession(C.id);
  console.log(JSON.stringify({ A: sa.token, B: sb.token, C: sc.token, pub: pub.slug, priv: priv.slug, pubId: pub.id }));
  await closeDb();
})();
