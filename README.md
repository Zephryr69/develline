# DEVEL line

Site vitrine + prototype de l'espace de travail, refondus en **Next.js (App Router, TypeScript)**.

## Stack
- Next.js 16, React 19
- CSS Modules (styles globaux dans `src/app/globals.css`)
- react-icons (jeu Lucide + Font Awesome pour les logos de réseaux)
- framer-motion (animations, respect de `prefers-reduced-motion`)
- Police Outfit (Space Mono pour le code), via @fontsource

## Démarrer
```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Structure
```
src/
  app/
    layout.tsx, page.tsx, globals.css   # racine + landing
    espace/                             # prototype de l'espace de travail
      layout.tsx, template.tsx
      creer/ projet/ membres/ copie/ soumettre/ revue/ versions/
      ship-card/ profil/ projets-publics/ connexion/ design-system/
      fichiers/ contributions/ acces-refuse/ archive-refusee/
      ressources/[slug]/
  components/
    landing/    # Navbar, Hero, Steps, ShipCardFeature, Compare, Footer...
    workspace/  # WorkspaceShell (header + sidebar)
    ui/         # Button, Primitives, Tabs
  context/WorkspaceContext.tsx          # état du prototype, modale, toasts
  lib/routes.ts, utils.ts
```

## À faire avant livraison
- Remplacer la palette par les codes hex de KT Services (variables en tête de `globals.css`).
- Le prototype garde son état en mémoire : un rechargement le réinitialise.
