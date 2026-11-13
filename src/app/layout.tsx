import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";

export const metadata: Metadata = {
  title: "DEVEL line — Des projets terminés, des preuves partagées",
  description:
    "DEVEL line : shippez ensemble, gardez le contrôle et sortez avec des preuves.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0b1010",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
