# DEVEL line

Plateforme de **shipping collaboratif contrôlé** pour les développeurs africains : le propriétaire garde le contrôle, les collaborateurs proposent leurs changements par **archive ZIP** (sans Git), chaque acceptation crée une **version restaurable**, et le projet livré produit une **Ship Card** publique.

## Fonctionnalités
- Comptes (inscription, connexion, profil), sessions par cookie httpOnly, thème **clair / sombre**
- Projets : contexte, stack, documentation, lien de démo, visibilité, **sprint** (4 à 6 semaines) avec compte à rebours et progression
- Membres : invitation par e-mail **ou par lien** (à partager sur WhatsApp), droits *Consulter* / *Contribuer*
- Copie de travail : ZIP d'une version précise (avec `DEVELLINE.json` pour retrouver la version de base)
- Contributions : envoi d'un ZIP **vérifié côté serveur** (chemins, liens symboliques, fichiers sensibles, extensions, secrets, taille, « zip bombs »), jamais exécuté
- Revue : fichiers ajoutés / modifiés / supprimés, **diff ligne par ligne**, accepter / rejeter, détection des conflits
- Versions : une version par acceptation, **restauration non destructive**
- Livraison → **Ship Card** publique et partageable (WhatsApp, LinkedIn), projets publics, recherche
- Permissions vérifiées côté serveur sur chaque page, action et route API ; journal d'activité

## Design
- **Fond** : graphite moucheté (textures PNG dans `public/textures/`), **ondes d'eau** animées derrière le héros (`components/landing/Ripples.tsx`, désactivées si l'utilisateur demande « réduire les animations »)
- **Verre** (glassmorphism) : navigation, cartes flottantes, cartes « pour qui » · **Neumorphisme** : panneaux, champs, boutons secondaires · **Argile** (claymorphism) : bouton principal, pastilles d'icônes
- **Grille 12 colonnes** (conteneur 1 200 px, gouttière 24 px, points de rupture 576 / 768 / 992 / 1 200 px) : classes `.row`, `.col-N`, `.col-sm|md|lg|xl-N`, `.offset-*` dans `globals.css`
- **Typographie** : Outfit en graisse 450 (corps) à 800 (titres), corps 17 px, aucun texte courant sous 13 px
- Tous les jetons de couleur, d'ombre et de verre sont dans `src/app/globals.css` (thèmes sombre et clair)

## Stack
Next.js 16 (App Router, TypeScript) · CSS Modules · react-icons · framer-motion · PostgreSQL (`pg`) · JSZip · jsdiff · bcryptjs · police Outfit.

## Démarrer en local (zéro configuration)
```bash
npm install
npm run dev        # http://localhost:3000
```
Sans `DATABASE_URL`, une base PostgreSQL embarquée (PGlite) est créée dans `.data/`. Supprimez ce dossier pour repartir de zéro.

## Variables d'environnement
Voir `.env.example`.

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | URL PostgreSQL (production). Le schéma est créé automatiquement au premier accès. |
| `NEXT_PUBLIC_SITE_URL` | URL publique (liens de partage et d'invitation, sitemap). |
| `MAX_ZIP_MB` | Taille maximale d'une archive (4 par défaut ; Vercel limite le corps des requêtes à 4,5 Mo). |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_HOST_NAME` | Pages « Mentions légales » et « Confidentialité ». |

## Déployer (Vercel + base Neon / Supabase)
1. Créez une base PostgreSQL gratuite (Neon ou Supabase) et copiez son URL de connexion.
2. Importez le dépôt sur Vercel, puis ajoutez `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` (l'URL Vercel ou votre domaine) et, si besoin, `MAX_ZIP_MB`.
3. Déployez. Les tables sont créées au premier appel. Inscrivez-vous, créez un projet : c'est en ligne.

## Si vous remplacez un ancien dépôt (prototype)
Ne copiez pas les fichiers un par un : supprimez `src/`, `public/`, `package.json`, `package-lock.json`, `next.config.mjs` et `tsconfig.json` du dépôt, puis copiez le contenu du zip à la place (sans oublier `.gitignore` et `.env.example`). L'ancien prototype (`src/app/espace`, `src/components/workspace`, `src/context`) ne doit plus exister.

## Tests
```bash
npm run test:flow      # parcours complet sur une base en mémoire : 63 vérifications
```
Tests HTTP de bout en bout (serveur de production + base de fichier) : voir `scripts/e2e/`.

## Structure
```
src/
  app/
    (site)/    landing, projets publics, Ship Card, ressources
    (auth)/    connexion, inscription, invitation
    (app)/app/ tableau de bord, projet (aperçu, fichiers, contributions, versions, membres, paramètres), profil
    api/       création de projet, dépôt de contribution, copie de travail
  actions/     actions serveur (formulaires)
  server/      logique métier : auth, projets, membres, contributions, versions, ZIP, diff, audit
  db/          connexion PostgreSQL (pg / PGlite) et schéma
  components/  UI, formulaires, landing
  lib/         routes, formats, sprint, ressources
```

## Limites connues / pistes
- Pas d'envoi d'e-mails : l'invitation se partage par lien (déjà prévu dans l'interface).
- Le traitement des archives s'exécute dans la requête, avec des limites strictes ; une file de tâches dédiée serait l'étape suivante pour de gros volumes.
- La détection de secrets se fait par motifs : elle aide, elle ne remplace pas une relecture.
- Pas de mot de passe oublié ni de modification d'e-mail pour l'instant.
