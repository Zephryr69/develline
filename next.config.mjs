/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // PostgreSQL embarqué (développement local) : chargé tel quel, avec ses fichiers WASM.
  serverExternalPackages: ["@electric-sql/pglite", "pg", "bcryptjs", "jszip"],
  experimental: {
    // Les envois d'archives passent par des routes API ; les actions serveur ne portent que de petits formulaires.
    serverActions: { bodySizeLimit: "1mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
