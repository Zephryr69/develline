"use client";

import Button from "@/components/ui/Button";
import { Badge, Grid2, ListRow, Panel, PageHead, Paragraph, Stack } from "@/components/ui/Primitives";
import { useWorkspace } from "@/context/WorkspaceContext";
import { downloadFile } from "@/lib/utils";
import styles from "./page.module.css";

const COLORS: [string, string][] = [
  ["Fond", "#0B1010"],
  ["Surface", "#121A19"],
  ["Accent", "#C9F36B"],
  ["Texte", "#F2F5EE"],
  ["Succès", "#83D9AE"],
  ["Erreur", "#FF9C96"],
];

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="48" viewBox="0 0 240 48"><rect x="1" y="4" width="40" height="40" rx="6" fill="#c9f36b"/><path d="m11 16 7 7-7 7m11 1h9" fill="none" stroke="#14200f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="52" y="32" font-family="Outfit, sans-serif" font-weight="800" font-size="25" fill="#f2f5ee">DEVEL <tspan fill="#c9f36b">line</tspan></text></svg>`;

export default function DesignSystemPage() {
  const { toast } = useWorkspace();
  return (
    <>
      <PageHead crumb="RESSOURCES / DESIGN" title="Mini design system" description="Spécifications légères pour construire le MVP." />
      <Grid2>
        <Panel>
          <h2>Couleurs</h2>
          <Paragraph>Palette provisoire : les codes KT Services n’ont pas été fournis et doivent être confirmés avant livraison.</Paragraph>
          {COLORS.map(([name, hex]) => (
            <ListRow key={name}>
              <span className={styles.swatch} style={{ background: hex }} />
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{name}</div>
              <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{hex}</span>
            </ListRow>
          ))}
        </Panel>
        <Stack>
          <Panel>
            <h2>Typographie & icônes</h2>
            <Paragraph>Outfit pour toute l’interface. Space Mono uniquement pour les chemins et le code. Icônes react-icons (jeu Lucide), trait cohérent.</Paragraph>
            <Paragraph>Grille : 8 px · cartes : rayon 10–14 px · largeur maximale : 1 280 px.</Paragraph>
          </Panel>
          <Panel>
            <h2>Composants & états</h2>
            <div className={styles.badges}>
              <Badge>Succès</Badge>
              <Badge tone="warn">En attente</Badge>
              <Badge tone="error">Erreur</Badge>
              <Badge tone="neutral">Neutre</Badge>
            </div>
            <Paragraph>Boutons, cartes, formulaires, progression, listes et modales sont réutilisables. Chaque statut combine texte et couleur.</Paragraph>
            <Button
              variant="outline"
              onClick={() => {
                downloadFile("devel-line-logo.svg", LOGO_SVG, "image/svg+xml");
                toast("Logo SVG téléchargé.");
              }}
            >
              Exporter le logo SVG
            </Button>
          </Panel>
        </Stack>
      </Grid2>
    </>
  );
}
