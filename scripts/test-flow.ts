/* Test d'intégration du parcours complet (base PGlite en mémoire). Lancer : npm run test:flow */
process.env.PGLITE_DIR = "memory";
import JSZip from "jszip";
import { registerUser, verifyLogin, createSession, getUserByToken } from "@/server/auth-core";
import { createProject, getProjectBySlug, getAccess, deliverProject, listContributors, listPublicProjects } from "@/server/projects";
import { inviteMember, listPendingInvitations, respondToInvitation, respondByToken } from "@/server/members";
import { submitContribution, getChanges, getFileDiff, acceptContribution, rejectContribution, getContribution, listContributions } from "@/server/contributions";
import { listVersions, restoreVersion, loadVersionFilesWithData, getVersionByLabel } from "@/server/versions";
import { buildZip, readArchive, ArchiveError } from "@/server/zip";
import { AppError } from "@/server/errors";

let pass = 0, fail = 0;
const ok = (cond: unknown, label: string) => { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ ÉCHEC :", label); } };
async function rejects(fn: () => Promise<unknown>, label: string, match?: RegExp) {
  try { await fn(); ok(false, label + " (aucune erreur levée)"); }
  catch (e: any) { ok(!match || match.test(e.message + " " + (e.issues ?? []).join(" ")), `${label} → ${e.message}${e.issues?.length ? " [" + e.issues[0] + "]" : ""}`); }
}
const zipOf = async (files: Record<string, string | Buffer>, extra?: (z: JSZip) => void) => {
  const z = new JSZip(); for (const [k, v] of Object.entries(files)) z.file(k, v); extra?.(z);
  return Buffer.from(await z.generateAsync({ type: "nodebuffer", platform: "UNIX", compression: "DEFLATE" }));
};

(async () => {
  console.log("\n— Comptes");
  const A = await registerUser({ name: "Aïcha Mensah", email: "aicha@example.com", password: "motdepasse1" });
  const B = await registerUser({ name: "Kofi Diallo", email: "Kofi@Example.com", password: "motdepasse2" });
  const C = await registerUser({ name: "Intrus", email: "intrus@example.com", password: "motdepasse3" });
  await rejects(() => registerUser({ name: "Autre", email: "aicha@example.com", password: "motdepasse1" }), "e-mail déjà utilisé", /existe déjà/);
  await rejects(() => registerUser({ name: "Zoé", email: "zoe@example.com", password: "court" }), "mot de passe trop court", /8 caractères/);
  await rejects(() => verifyLogin("aicha@example.com", "mauvais"), "mauvais mot de passe", /incorrect/);
  const logged = await verifyLogin("AICHA@example.com", "motdepasse1");
  const s = await createSession(logged.id);
  ok((await getUserByToken(s.token))?.id === A.id, "session valide");
  ok((await getUserByToken("x".repeat(64))) === null, "session inconnue refusée");

  console.log("\n— 1. Création du projet");
  await rejects(() => createProject(A.id, { name: "ab", description: "Une description valable", stack: "React", visibility: "public" }), "nom trop court");
  const initial = await buildInitial();
  const project = await createProject(A.id, { name: "Marché Local", description: "Vitrine pour commerçants de quartier.", context: "Contexte", docs: "Docs", stack: "React, Mobile Money, react", visibility: "public", demo_url: "", weeks: 6 }, initial);
  ok(project.slug === "marche-local", "slug généré : " + project.slug);
  ok(project.stack === "React, Mobile Money", "tags dédoublonnés : " + project.stack);
  ok(project.current_label === "v1.0", "version initiale v1.0");
  const p2 = await createProject(A.id, { name: "Marché Local", description: "Un autre projet au même nom.", stack: "Vue", visibility: "private" });
  ok(p2.slug === "marche-local-2", "slug unique : " + p2.slug);
  const readme = (await loadVersionFilesWithData(p2.current_version_id!)).find((f) => f.path === "README.md");
  ok(readme && readme.data.toString().includes("# Marché Local"), "README généré quand aucune archive");

  console.log("\n— 2. Invitation de B");
  await rejects(() => inviteMember(B, project, "x@example.com", "contribute"), "un non-propriétaire ne peut pas inviter", /propriétaire/);
  const inv = await inviteMember(A, project, "kofi@example.com", "contribute");
  await rejects(() => inviteMember(A, project, "KOFI@example.com", "contribute"), "invitation en double refusée", /déjà/);
  const pend = await listPendingInvitations(B);
  ok(pend.length === 1 && pend[0].project_slug === project.slug, "B voit l’invitation (casse de l’e-mail ignorée)");
  ok((await getAccess(project, B)).canSubmit === false, "avant acceptation, B ne peut pas contribuer");
  await respondToInvitation(B, inv.id, true);
  const accB = await getAccess(project, B);
  ok(accB.role === "contribute" && accB.canSubmit && !accB.canDecide, "B est contributeur sans droit de décision");
  await rejects(() => respondToInvitation(C, inv.id, true), "invitation déjà traitée", /plus valide/);

  console.log("\n— 3. Copie de travail");
  const files = await loadVersionFilesWithData(project.current_version_id!);
  const work = await buildZip(files, { project: project.id, version: "v1.0" });
  const reread = await readArchive(work);
  ok(reread.manifest?.version === "v1.0" && reread.files.length === files.length, `copie de travail relisible (${reread.files.length} fichiers + manifeste)`);

  console.log("\n— 4/5. Archives dangereuses refusées");
  const cases: [string, Buffer, RegExp][] = [
    ["chemin traversant", await zipOf({ "../evil.js": "x" }), /traversant/],
    ["chemin absolu", await zipOf({ "/etc/passwd": "x" }), /absolu/],
    ["fichier .env", await zipOf({ "src/App.jsx": "ok", ".env": "KEY=1" }), /\.env/],
    ["clé .pem", await zipOf({ "cert/server.pem": "x" }), /sensible/],
    ["binaire exécutable", await zipOf({ "run.exe": "MZ" }), /exécutable/],
    ["dossier node_modules", await zipOf({ "node_modules/a/index.js": "x" }), /dossier non autorisé/],
    ["secret dans le code", await zipOf({ "src/a.js": "const k='AKIAABCDEFGHIJKLMNOP'" }), /secret/],
    ["clé privée", await zipOf({ "src/k.txt": "-----BEGIN RSA PRIVATE KEY-----\nabc" }), /secret/],
    ["extension inconnue", await zipOf({ "a.xyz": "x" }), /extension/],
    ["lien symbolique", await zipOf({ "link": "target" }, (z) => z.file("link", "target", { unixPermissions: 0o120777 })), /symbolique/],
    ["pas un zip", Buffer.from("ceci n'est pas un zip"), /pas une archive/],
    ["vide", Buffer.alloc(0), /vide/],
  ];
  for (const [label, buf, re] of cases) await rejects(() => readArchive(buf), label, re);
  await rejects(async () => readArchive(await zipOf({ "big.txt": Buffer.alloc(5 * 1024 * 1024) })), "« zip bomb » (5 Mo de zéros compressés)", /volumineux/);
  const many: Record<string, string> = {}; for (let i = 0; i < 301; i++) many[`f${i}.txt`] = "x";
  await rejects(async () => readArchive(await zipOf(many)), "trop de fichiers", /Trop de fichiers/);
  const deep = "a/b/c/d/e/f/g/h/i/x.js";
  await rejects(async () => readArchive(await zipOf({ [deep]: "x" })), "profondeur excessive", /profondeur/);
  const ok1 = await readArchive(await zipOf({ "__MACOSX/._a": "x", ".DS_Store": "x", "src/App.jsx": "ok", ".env.example": "KEY=" }));
  ok(ok1.files.length === 2 && ok1.ignored === 2, "fichiers parasites ignorés, .env.example accepté");
  const wrapped = await readArchive(await zipOf({ "mon-projet/src/App.jsx": "a", "mon-projet/README.md": "b" }));
  ok(wrapped.files.every((f) => !f.path.startsWith("mon-projet/")), "dossier racine unique retiré");

  console.log("\n— 4. Contribution de B");
  const base = Object.fromEntries(files.map((f) => [f.path, f.data.toString()]));
  const mod1 = await zipOf({ ...base, "src/App.jsx": "function App() { return <ShopCard />; }\n", "src/ShopCard.jsx": "export default function ShopCard(){}\n" });
  await rejects(async () => submitContribution(C, project, await getAccess(project, C), { title: "Intrus", summary: "Je veux contribuer ici" }, { name: "x.zip", buffer: mod1 }), "un inconnu ne peut pas soumettre", /pas le droit/);
  await rejects(async () => submitContribution(B, project, accB, { title: "Archive piégée", summary: "Contient un fichier sensible" }, { name: "x.zip", buffer: await zipOf({ ...base, ".env": "K=1" }) }), "archive dangereuse refusée à la soumission", /refusée/);
  await rejects(() => submitContribution(B, project, accB, { title: "Rien", summary: "Aucun changement du tout" }, { name: "x.zip", buffer: work }), "archive identique : aucun changement", /Aucun changement/);
  const c1 = await submitContribution(B, project, accB, { title: "Améliorer la page d’accueil", summary: "Ajout de la présentation des commerçants." }, { name: "v1.zip", buffer: mod1 });
  ok(c1.changes === 2, "2 changements détectés");

  console.log("\n— 6. Revue");
  const c1row = (await getContribution(project.id, c1.id))!;
  const changes = await getChanges(c1row);
  ok(changes.some((c) => c.path === "src/ShopCard.jsx" && c.status === "added") && changes.some((c) => c.path === "src/App.jsx" && c.status === "modified"), "ajouté + modifié listés");
  const d = await getFileDiff(c1row, "src/App.jsx");
  ok(d?.kind === "text" && "hunks" in d.diff && d.diff.added === 1 && d.diff.removed === 1, "diff ligne à ligne (+1 / −1)");

  console.log("\n— 7. Rejet : la version principale reste inchangée");
  await rejects(() => rejectContribution(B, project, c1.id, ""), "B ne peut pas rejeter", /propriétaire/);
  await rejects(() => acceptContribution(B, project, c1.id), "B ne peut pas accepter", /propriétaire/);
  await rejectContribution(A, project, c1.id, "Ajoutez des tests.");
  ok((await getProjectBySlug(project.slug))!.current_label === "v1.0", "version courante toujours v1.0");
  await rejects(() => acceptContribution(A, project, c1.id), "contribution déjà traitée", /déjà été traitée/);

  console.log("\n— 8. Seconde proposition acceptée → nouvelle version");
  const mod2 = await zipOf({ ...base, "src/App.jsx": "function App() { return <ShopCard shops={[]} />; }\n", "src/ShopCard.jsx": "export default function ShopCard(){}\n" });
  const c2 = await submitContribution(B, project, accB, { title: "Page d’accueil v2", summary: "Seconde proposition corrigée." }, { name: "v2.zip", buffer: mod2 });
  const acc = await acceptContribution(A, project, c2.id);
  ok(acc.label === "v1.1", "nouvelle version " + acc.label);
  const fresh = (await getProjectBySlug(project.slug))!;
  ok(fresh.current_label === "v1.1" && fresh.accepted_count === 1, "version courante v1.1, 1 contribution acceptée");
  const contributors = await listContributors(project.id);
  ok(contributors[0]?.name === "Kofi Diallo" && contributors[0].count === 1, "Kofi crédité (1 contribution acceptée)");

  console.log("\n— Conflit : base ancienne");
  const c3 = await submitContribution(B, fresh, accB, { title: "Modif sur ancienne base", summary: "Basée sur v1.0 volontairement.", baseLabel: "v1.0" }, { name: "v3.zip", buffer: await zipOf({ ...base, "src/App.jsx": "function App() { return <Autre />; }\n" }) });
  await rejects(() => acceptContribution(A, fresh, c3.id), "conflit détecté sur src/App.jsx", /Conflit/);
  await rejectContribution(A, fresh, c3.id, "");

  console.log("\n— 9. Historique et restauration non destructive");
  const before = await listVersions(project.id);
  await rejects(() => restoreVersion(B, fresh, before[1].id), "B ne peut pas restaurer", /propriétaire/);
  const v10 = await getVersionByLabel(project.id, "v1.0");
  const rest = await restoreVersion(A, fresh, v10!.id);
  const after = await listVersions(project.id);
  ok(rest.label === "v1.2" && after.length === before.length + 1, "restauration crée v1.2 (aucune version supprimée)");
  const cur = (await getProjectBySlug(project.slug))!;
  const restored = (await loadVersionFilesWithData(cur.current_version_id!)).map((f) => f.path).sort();
  ok(!restored.includes("src/ShopCard.jsx"), "contenu de v1.0 retrouvé");
  ok((await loadVersionFilesWithData((await getVersionByLabel(project.id, "v1.1"))!.id)).some((f) => f.path === "src/ShopCard.jsx"), "v1.1 intacte dans l’historique");

  console.log("\n— 10. Permissions");
  ok((await getAccess(project, C)).canSeeFiles === false && (await getAccess(project, null)).role === "public", "visiteur : pas d’accès aux fichiers (projet public)");
  ok((await getAccess(p2, C)).role === "none" && !(await getAccess(p2, C)).canView, "projet privé : aucun accès pour un tiers");
  await rejects(() => deliverProject(B, cur), "B ne peut pas livrer", /propriétaire/);

  console.log("\n— Livraison / Ship Card");
  await rejects(() => deliverProject(A, cur), "livraison sans lien de démo refusée", /lien de démo/);
  const { updateProject } = await import("@/server/projects");
  await updateProject(A, cur, { name: cur.name, description: cur.description, stack: cur.stack, visibility: "public", demo_url: "https://marche-local.vercel.app" });
  await deliverProject(A, (await getProjectBySlug(project.slug))!);
  const delivered = (await getProjectBySlug(project.slug))!;
  ok(delivered.status === "delivered" && delivered.delivered_at, "projet livré");
  await rejects(async () => submitContribution(B, delivered, accB, { title: "Trop tard", summary: "Après la livraison du projet." }, { name: "x.zip", buffer: mod1 }), "plus de contribution après livraison", /livré/);
  ok((await listPublicProjects("marche")).some((p) => p.id === project.id), "projet visible dans la liste publique / recherche");
  ok(!(await listPublicProjects("")).some((p) => p.id === p2.id), "projet privé absent de la liste publique");
  ok((await listContributions(project.id)).length === 3, "3 contributions dans l’historique");

  console.log("\n— Invitation par lien");
  const p3 = await createProject(B.id, { name: "Projet de Kofi", description: "Test d’invitation par lien.", stack: "Node", visibility: "public" });
  const inv3 = await inviteMember(B, p3, "nouveau@example.com", "view");
  const slug = await respondByToken(C, inv3.token, true);
  ok(slug === p3.slug && (await getAccess(p3, C)).role === "view", "accepter via le lien rend membre (consulter)");

  console.log(`\n${pass} vérifications réussies, ${fail} échec(s)`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("ERREUR FATALE", e); process.exit(1); });

async function buildInitial() {
  const { makeFile } = await import("@/server/zip");
  return [
    makeFile("README.md", Buffer.from("# Marché Local\n"), true),
    makeFile("src/App.jsx", Buffer.from("function App() { return <Home />; }\n"), true),
    makeFile("src/old-home.jsx", Buffer.from("export default function Home(){}\n"), true),
    makeFile("package.json", Buffer.from('{"name":"marche-local"}\n'), true),
  ];
}
