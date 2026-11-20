"use client";
import dynamic from "next/dynamic";

const SouscriptionCreation = dynamic(
  () => import("@/components/souscription-creation-entreprise/SouscriptionCreation"),
  { ssr: false, loading: () => <div className="container py-20 text-center">Chargement du formulaire…</div> }
);

export default function SouscriptionCreationClientWrapper({ locale }: { locale?: string }) {
  return <SouscriptionCreation locale={locale || "fr"} />;
}
