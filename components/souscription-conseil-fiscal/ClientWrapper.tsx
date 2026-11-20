"use client";
import dynamic from "next/dynamic";

const SouscriptionConseilFiscal = dynamic(
  () => import("@/components/souscription-conseil-fiscal/SouscriptionConseilFiscal"),
  { ssr: false, loading: () => <div className="container py-20 text-center">Chargement du formulaire…</div> }
);

export default function SouscriptionConseilFiscalClientWrapper({ locale }: { locale?: string }) {
  return <SouscriptionConseilFiscal locale={locale || "fr"} />;
}
