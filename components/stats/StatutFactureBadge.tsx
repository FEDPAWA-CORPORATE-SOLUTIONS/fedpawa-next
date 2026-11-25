export interface StatutFactureBadgeProps {
  statut: string | null | undefined;
}

export default function StatutFactureBadge({ statut }: StatutFactureBadgeProps) {
  const getVariant = () => {
    if (!statut) return "muted";
    const s = statut.toLowerCase();
    if (s === "payée" || s === "payee" || s === "soldee") return "success";
    if (s === "en_attente" || s === "en attente" || s === "pending" || s === "impayée" || s === "impayee") return "warning";
    if (s === "annulee" || s === "annulée" || s === "annulée" || s === "cancelled") return "danger";
    return "muted";
  };

  const getLabel = () => {
    if (!statut) return "—";
    const s = statut.toLowerCase();
    if (s === "payée" || s === "payee") return "Payée";
    if (s === "en_attente" || s === "en attente" || s === "pending") return "En attente";
    if (s === "impayée" || s === "impayee") return "Impayée";
    if (s === "annulee" || s === "annulée") return "Annulée";
    return statut;
  };

  return (
    <span className={`badge badge-${getVariant()}`}>{getLabel()}</span>
  );
}