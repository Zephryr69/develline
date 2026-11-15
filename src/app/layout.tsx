import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";
import ToastProvider from "@/components/ToastProvider";
import { themeScript } from "@/components/ThemeToggle";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "DEVEL line — Livrez un vrai projet en équipe et prouvez-le", template: "%s · DEVEL line" },
  description: "Terminez un vrai projet en 4 à 6 semaines, sans apprendre Git, et repartez avec un lien public à mettre sur votre CV. La plateforme de collaboration contrôlée pour les développeurs africains.",
  openGraph: { title: "DEVEL line", description: "Shippez ensemble, gardez le contrôle, sortez avec des preuves.", type: "website", locale: "fr_FR" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#080f24" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <MotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
