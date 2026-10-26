// Layout section publique FR (racine) — Header + <main> + Footer.
// Le <main> ouvre/ferme comme dans les partials PHP source.

import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

export default function SiteLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <>
      <Header locale="fr" />
      <main>{children}</main>
      <Footer locale="fr" />
    </>
  );
}
