// ============================================================
// FEDPAWA — Layout minimal pour la page de test des loaders
// Pas de GlobalLoaderProvider (évite les conflits avec les 8 loaders de démo)
// ============================================================

export const metadata = {
  title: "Test Loaders | FEDPAWA",
};

export default function TestLoadersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
