"use client";

// ==========================================================
// FEDPAWA — Boîte de réception admin (adaptée au design system du site)
// Barre latérale, recherche centrale, onglets catégories dynamiques,
// liste de mails en 2 lignes avec sélection multiple, vue détail style site FEDPAWA,
// envoi / réponse / suppression / favori / création de catégories.
// Données : repli sur DEMO_MAILS si l'API répond 404.
// ==========================================================

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Locale, getPageDictionary } from "@/lib/i18n";
import { routesFor } from "@/lib/routes";
import { sanitizeMailHtml } from "@/lib/sanitize-mail-html";
import { apiAuthGetBlob, getToken } from "@/lib/auth";
import {
  FiMenu,
  FiInbox,
  FiStar,
  FiSend,
  FiMail,
  FiSwitch,
  FiTrash2,
  FiSearch,
  FiMoreVertical,
} from "react-icons/fi";
import {
  MAILS_PAR_PAGE,
  adminFetchMail,
  adminFetchMails,
  adminFetchMailsCount,
  adminFetchEnvoyes,
  adminFetchImapMails,
  adminMarquerMailLu,
  adminMarquerToutLu,
  adminSendMail,
  adminReplyMail,
  adminFetchUserCategories,
  adminCreateUserCategory,
  adminDeleteUserCategory,
  type MailDetail,
  type MailEnvoye,
  type MailsCount,
  type MailsPage,
  type MailsEnvoyesPage,
  type MailSummary,
  type AdminSendMailPayload,
  type UserCategory,
  type ImapMessage,
  DEMO_MAILS,
} from "@/lib/mails";

export interface AdminMailsProps {
  locale?: Locale;
}

type Folder = "inbox" | "favoris" | "envoyes" | "brouillons" | "corbeille";

function fmtDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function fmtTaille(octets: number | null | undefined): string {
  if (octets === null || octets === undefined) return "";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(2)} Mo`;
}

export default function AdminMails({ locale = "fr" }: AdminMailsProps) {
  const t = getPageDictionary(locale, "admin_mails");
  const routes = routesFor(locale);

  // ---------- États de navigation ----------
  const [view, setView] = useState<"liste" | "detail" | "nouveau" | "repondre">("liste");
  const [folder, setFolder] = useState<Folder>("inbox");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [activeCategorieId, setActiveCategorieId] = useState<number | null>(null);
  const [selectedMailId, setSelectedMailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MailDetail | null>(null);
  const [detailDemo, setDetailDemo] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // ---------- États de liste ----------
  const [filtre, setFiltre] = useState<"" | "non_lus">("");
  const [recherche, setRecherche] = useState("");
  const [rechercheAppliquee, setRechercheAppliquee] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------- États IMAP (vrais mails reçus) ----------
  const [imapMails, setImapMails] = useState<ImapMessage[]>([]);
  const [imapLoading, setImapLoading] = useState(false);
  const [imapError, setImapError] = useState("");

  // ---------- Sélection de compte IMAP ----------
  const [imapAccount, setImapAccount] = useState<1 | 2>(1);

  // ---------- Sélection multiple ----------
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<"date" | "sujet" | "expediteur">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [rangeStartId, setRangeStartId] = useState<number | null>(null);

  // ---------- États d'envoi / réponse ----------
  const [envoyes, setEnvoyes] = useState<MailsEnvoyesPage | null>(null);
  const [envoyesLoading, setEnvoyesLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState<{ sujet: string; corps: string }>({ sujet: "", corps: "" });
  const [transfertDest, setTransfertDest] = useState("");
  const [transfertSujet, setTransfertSujet] = useState("");
  const [transfertCorps, setTransfertCorps] = useState("");

  // Formulaire nouveau mail
  const [formDest, setFormDest] = useState("");
  const [formCopie, setFormCopie] = useState<string[]>([]);
  const [formSujet, setFormSujet] = useState("");
  const [formTexte, setFormTexte] = useState("");
  const [formPiecesJointes, setFormPiecesJointes] = useState<File[]>([]);

  // ---------- États création catégorie ----------
  const [nouvelleCategorie, setNouvelleCategorie] = useState<{ nom: string; couleur: string }>({ nom: "", couleur: "#1a73e8" });
  const [creerCategorieOuvert, setCreerCategorieOuvert] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<number | null>(null);
  const [draggingCategoryId, setDraggingCategoryId] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<UserCategory | null>(null);

  // ---------- Chargement des mails ----------
  const [resp, setResp] = useState<MailsPage<MailSummary> | null>(null);
  const [count, setCount] = useState<MailsCount | null>(null);

  const loadEnvoyes = useCallback(() => {
    setEnvoyesLoading(true);
    adminFetchEnvoyes({ page: 1, par_page: MAILS_PAR_PAGE })
      .then(setEnvoyes)
      .catch(() => setEnvoyes(null))
      .finally(() => setEnvoyesLoading(false));
  }, []);

  useEffect(() => {
    loadEnvoyes();
  }, [loadEnvoyes]);

  useEffect(() => {
    adminFetchUserCategories()
      .then((cats) => {
        setCategories(cats);
        // Restaurer la catégorie par défaut depuis localStorage
        try {
          const raw = localStorage.getItem("fedpawa_mail_default_category");
          if (raw) {
            const id = parseInt(raw, 10);
            if (!isNaN(id) && cats.some((c) => c.id === id)) {
              setDefaultCategoryId(id);
            }
          }
        } catch (e) {
          // ignore
        }
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const h = setTimeout(() => {
      setRechercheAppliquee(recherche.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(h);
  }, [recherche]);

  // Fermeture des vues avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (view === "detail") fermerDetail();
        else if (view === "nouveau") annulerNouveau();
        else if (view === "repondre") annulerReponse();
        else if (view === "transfert") annulerTransfert();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    adminFetchMails({
      lu: filtre,
      recherche: rechercheAppliquee,
      page,
      par_page: MAILS_PAR_PAGE,
    })
      .then((r) => setResp(r))
      .catch(() => setError(t.loadError))
      .finally(() => setLoading(false));
    adminFetchMailsCount()
      .then(setCount)
      .catch(() => setCount(null));
  }, [filtre, rechercheAppliquee, page, t.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  const loadImapMails = useCallback(async () => {
    setImapLoading(true);
    setImapError("");
    try {
      const messages = await adminFetchImapMails(imapAccount);
      setImapMails(messages);
    } catch (e) {
      setImapError(e instanceof Error ? e.message : "Échec du chargement des mails IMAP.");
      setImapMails([]);
    } finally {
      setImapLoading(false);
    }
  }, [imapAccount]);

  const rafraîchirImap = useCallback(() => {
    loadImapMails();
  }, [loadImapMails]);

  useEffect(() => {
    if (folder === "inbox") {
      loadImapMails();
    }
  }, [folder, imapAccount, loadImapMails]);

  // ---------- Brouillons auto-save (localStorage) ----------
  const DRAFT_KEY = "fedpawa_mail_draft";

  const saveDraft = useCallback(() => {
    const draft = {
      dest: formDest,
      copie: formCopie,
      sujet: formSujet,
      texte: formTexte,
      pieces: formPiecesJointes.map((f) => ({ name: f.name, size: f.size })),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      // localStorage indisponible en mode privé — ignorer silencieusement
    }
  }, [formDest, formCopie, formSujet, formTexte, formPiecesJointes]);

  useEffect(() => {
    saveDraft();
  }, [saveDraft]);

  useEffect(() => {
    if (view === "nouveau") {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          setFormDest(draft.dest || "");
          setFormCopie(draft.copie || []);
          setFormSujet(draft.sujet || "");
          setFormTexte(draft.texte || "");
        }
      } catch (e) {
        // ignore
      }
    }
  }, [view]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      // ignore
    }
    setFormDest("");
    setFormCopie([]);
    setFormSujet("");
    setFormTexte("");
    setFormPiecesJointes([]);
  };

  // ---------- Conversion IMAP → format d'affichage ----------
  const imapToMailSummary = useCallback((m: ImapMessage): MailSummary => ({
    id: m.uid,
    expediteur: m.expediteur,
    destinataires: [],
    sujet: m.sujet,
    recu_le: m.date_recue,
    lu: m.lu,
    nb_pieces_jointes: 0,
    corps_texte: "",
  }), []);

  // ---------- Données affichées ----------
  const mailsDisplay = useMemo(() => {
    const apiMails = resp?.data ?? [];
    if (apiMails.length > 0 && !(resp?.demo)) {
      return apiMails;
    }
    // Utiliser les vrais mails IMAP pour l'onglet inbox
    if (folder === "inbox" && imapMails.length > 0) {
      let list = imapMails.map(imapToMailSummary);
      const r = (rechercheAppliquee ?? "").trim().toLowerCase();
      if (r) {
        list = list.filter((m) => m.expediteur.toLowerCase().includes(r) || m.sujet.toLowerCase().includes(r));
      }
      list.sort((a, b) => {
        let va: any, vb: any;
        if (sortBy === "date") va = new Date(a.recu_le).getTime(), vb = new Date(b.recu_le).getTime();
        else if (sortBy === "sujet") va = (a.sujet || "").toLowerCase(), vb = (b.sujet || "").toLowerCase();
        else va = (a.expediteur || "").toLowerCase(), vb = (b.expediteur || "").toLowerCase();
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
      return list.map((m) => ({ ...m }));
    }
    let list = [...DEMO_MAILS];
    switch (folder) {
      case "inbox":
        break;
      case "favoris":
        list = list.filter((m) => !m.lu);
        break;
      case "envoyes":
        list = [];
        break;
      case "brouillons":
        list = [];
        break;
      case "corbeille":
        list = [];
        break;
    }
    if (filtre === "non_lus") list = list.filter((m) => !m.lu);
    const r = (rechercheAppliquee ?? "").trim().toLowerCase();
    if (r) {
      list = list.filter((m) => m.expediteur.toLowerCase().includes(r) || m.sujet.toLowerCase().includes(r));
    }
    // Tri
    list.sort((a, b) => {
      let va: any, vb: any;
      if (sortBy === "date") va = new Date(a.recu_le).getTime(), vb = new Date(b.recu_le).getTime();
      else if (sortBy === "sujet") va = (a.sujet || "").toLowerCase(), vb = (b.sujet || "").toLowerCase();
      else va = (a.expediteur || "").toLowerCase(), vb = (b.expediteur || "").toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list.map((m) => ({ ...m }));
  }, [resp, folder, filtre, rechercheAppliquee, sortBy, sortDir]);

  // ---------- Actions ----------
  const ouvrirNouveau = () => {
    setView("nouveau");
    setSendError("");
    setSendSuccess("");
    setFormDest("");
    setFormCopie([]);
    setFormSujet("");
    setFormTexte("");
    setFormPiecesJointes([]);
  };

  const annulerNouveau = () => {
    setView("liste");
  };

  const envoyerMail = async () => {
    const payload: AdminSendMailPayload = {
      destinataire: formDest,
      copie: formCopie.length > 0 ? formCopie : undefined,
      sujet: formSujet,
      corps_html: formTexte,
      corps_texte: formTexte,
    };
    setBusy(true);
    setSendError("");
    setSendSuccess("");
    try {
      const r = await adminSendMail(payload);
      setSendSuccess(r.message);
      clearDraft();
      setView("liste");
      loadEnvoyes();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Échec de l'envoi de l'e-mail.");
    } finally {
      setBusy(false);
    }
  };

  const ouvrirReponse = (id: number, sujetOriginal: string) => {
    setReplyingTo(id);
    setReplyDraft({ sujet: "Re: " + sujetOriginal, corps: "" });
    setView("repondre");
  };

  const annulerReponse = () => {
    setReplyingTo(null);
    setView("detail");
  };

  const repondre = async () => {
    if (!replyingTo) return;
    setBusy(true);
    setSendError("");
    setSendSuccess("");
    try {
      const r = await adminReplyMail(replyingTo, {
        sujet: replyDraft.sujet || undefined,
        corps_html: replyDraft.corps || undefined,
        corps_texte: replyDraft.corps || undefined,
      });
      setSendSuccess(r.message);
      setView("detail");
      if (detail) ouvrir(detail.id);
      loadEnvoyes();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Échec de l'envoi de la réponse.");
    } finally {
      setBusy(false);
    }
  };

  const ouvrirTransfert = (id: number, sujetOriginal: string, corpsOriginal: string) => {
    setTransfertDest("");
    setTransfertSujet("Fwd: " + sujetOriginal);
    setTransfertCorps("\n\n---------- Message transféré ----------\n" + corpsOriginal);
    setView("transfert");
  };

  const annulerTransfert = () => {
    setTransfertDest("");
    setTransfertSujet("");
    setTransfertCorps("");
    setView("detail");
  };

  const transférer = async () => {
    if (!transfertDest) return;
    setBusy(true);
    setSendError("");
    setSendSuccess("");
    try {
      const r = await adminSendMail({
        destinataire: transfertDest,
        sujet: transfertSujet,
        corps_html: transfertCorps,
        corps_texte: transfertCorps,
      });
      setSendSuccess(r.message);
      setView("detail");
      loadEnvoyes();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Échec du transfert.");
    } finally {
      setBusy(false);
    }
  };

  const ouvrir = (id: number, e?: React.MouseEvent) => {
    // Si Ctrl/Cmd+clic, ouvrir dans un nouvel onglet (géré par le navigateur)
    if (e && (e.ctrlKey || e.metaKey)) return;
    setSelectedMailId(id);
    setDetailLoading(true);
    setDetail(null);
    adminFetchMail(id)
      .then((d) => {
        setDetail(d);
        setDetailDemo(Boolean((d as { demo?: boolean }).demo));
      })
      .catch(() => setError(t.loadError))
      .finally(() => setDetailLoading(false));
  };

  const fermerDetail = () => {
    setDetail(null);
    setDetailDemo(false);
    setSelectedMailId(null);
  };

  const appliquerLuLocal = (id: number) => {
    setResp((r) =>
      r
        ? {
            ...r,
            data: r.data.map((m) => (m.id === id ? { ...m, lu: true } : m)),
          }
        : r,
    );
    setDetail((d) => (d && d.id === id ? { ...d, lu: true } : d));
    setCount((c) => (c ? { ...c, non_lus: Math.max(0, c.non_lus - 1) } : c));
  };

  const marquerLu = (id: number) => {
    setBusy(true);
    setMessage("");
    adminMarquerMailLu(id)
      .then(() => {
        appliquerLuLocal(id);
        setMessage(t.luOk);
      })
      .catch(() => setMessage(t.errorGeneric))
      .finally(() => setBusy(false));
  };

  const marquerToutLu = () => {
    setBusy(true);
    setMessage("");
    adminMarquerToutLu()
      .then(() => {
        setResp((r) => (r ? { ...r, data: r.data.map((m) => ({ ...m, lu: true })) } : r));
        setDetail((d) => (d ? { ...d, lu: true } : d));
        setCount((c) => (c ? { ...c, non_lus: 0 } : c));
        setMessage(t.toutLuOk);
      })
      .catch(() => setMessage(t.errorGeneric))
      .finally(() => setBusy(false));
  };

  const supprimerMail = (id: number) => {
    setResp((r) =>
      r ? { ...r, data: r.data.filter((m) => m.id !== id) } : r,
    );
    if (selectedMailId === id) {
      fermerDetail();
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const basculerFavori = (id: number) => {
    appliquerLuLocal(id);
  };

  // ---------- Actions sélection multiple ----------
  const toggleSelect = (id: number, e?: React.MouseEvent) => {
    // Shift+clic pour sélection par plage
    if (e && e.shiftKey && rangeStartId !== null) {
      const ids = mailsDisplay.map((m) => m.id);
      const startIdx = ids.indexOf(rangeStartId);
      const endIdx = ids.indexOf(id);
      if (startIdx !== -1 && endIdx !== -1) {
        const [min, max] = [startIdx, endIdx].sort((a, b) => a - b);
        const rangeIds = ids.slice(min, max + 1);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          rangeIds.forEach((id) => next.add(id));
          return next;
        });
        return;
      }
    }
    setRangeStartId(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(mailsDisplay.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const isSelected = (id: number) => selectedIds.has(id);

  const applyBulkAction = (action: string) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setResp((r) =>
      r
        ? {
            ...r,
            data: r.data.map((m) => {
              if (!selectedIds.has(m.id)) return m;
              switch (action) {
                case "marquerLu":
                  return { ...m, lu: true };
                case "marquerNonLu":
                  return { ...m, lu: false };
                case "supprimer":
                  return null;
                case "marquerFavori":
                  return { ...m, lu: true };
                default:
                  return m;
              }
            }).filter(Boolean),
          }
        : r,
    );
    setSelectedIds(new Set());
    if (action === "supprimer") setSelectedMailId(null);
  };

  const supprimerCategorie = async (id: number) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setCategoryToDelete(cat);
  };

  const confirmerSuppressionCategorie = async () => {
    if (!categoryToDelete) return;
    setBusy(true);
    try {
      await adminDeleteUserCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete!.id));
      if (activeCategorieId === categoryToDelete!.id) {
        setActiveCategorieId(null);
      }
      setCategoryToDelete(null);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Échec de la suppression.");
    } finally {
      setBusy(false);
    }
  };

  const annulerSuppressionCategorie = () => {
    setCategoryToDelete(null);
  };

  const definirParDefaut = (id: number) => {
    setDefaultCategoryId(id);
    try {
      localStorage.setItem("fedpawa_mail_default_category", String(id));
    } catch (e) {
      // ignore
    }
  };

  // ---------- Actions catégories ----------
  const ouvrirCreerCategorie = () => {
    setNouvelleCategorie({ nom: "", couleur: "#1a73e8" });
    setCreerCategorieOuvert(true);
  };

  const annulerCreerCategorie = () => {
    setCreerCategorieOuvert(false);
  };

  const creerCategorie = async () => {
    if (!nouvelleCategorie.nom.trim()) return;
    setBusy(true);
    try {
      const categorie = await adminCreateUserCategory({
        nom: nouvelleCategorie.nom.trim(),
        couleur: nouvelleCategorie.couleur,
      });
      setCategories((prev) => [...prev, categorie]);
      setActiveCategorieId(categorie.id);
      setCreerCategorieOuvert(false);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Échec de la création de la catégorie.");
    } finally {
      setBusy(false);
    }
  };

  // ---------- Corps HTML assaini ----------
  const corpsAssaini = useMemo(
    () => (detail ? sanitizeMailHtml(detail.corps_html) : ""),
    [detail],
  );

  const downloadMailAttachment = async (url: string, filename: string) => {
    try {
      const blob = await apiAuthGetBlob(url);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Téléchargement impossible:", err);
    }
  };

  // ---------- Rendu ----------
  return (
    <div className="mail-container">
      {/* ============== BARRE LATÉRALE GAUCHE ============== */}
      <aside className="mail-sidebar">
        <div className="mail-sidebar-top">
          <button
            type="button"
            className="mail-compose-btn"
            onClick={ouvrirNouveau}
            disabled={busy}
          >
            Nouveau message <FiSend size={18} />
          </button>
        </div>
        <nav className="mail-nav">
          <div
            className={`mail-nav-item ${folder === "inbox" ? "active" : ""}`}
            onClick={() => setFolder("inbox")}
          >
            <FiInbox size={18} /> Boîte de réception
            {count && count.non_lus > 0 && folder === "inbox" && (
              <span className="mail-badge">{count.non_lus}</span>
            )}
          </div>
          <div
            className={`mail-nav-item ${folder === "favoris" ? "active" : ""}`}
            onClick={() => setFolder("favoris")}
          >
            <FiStar size={18} /> Favoris
            {count && count.non_lus > 0 && folder === "favoris" && (
              <span className="mail-badge">{count.non_lus}</span>
            )}
          </div>
          <div
            className={`mail-nav-item ${folder === "envoyes" ? "active" : ""}`}
            onClick={() => setFolder("envoyes")}
          >
            <FiSend size={18} /> Envoyés
            {count && count.non_lus > 0 && folder === "envoyes" && (
              <span className="mail-badge">{count.non_lus}</span>
            )}
          </div>
          <div
            className={`mail-nav-item ${folder === "brouillons" ? "active" : ""}`}
            onClick={() => setFolder("brouillons")}
          >
            <FiMail size={18} /> Brouillons
            {count && count.non_lus > 0 && folder === "brouillons" && (
              <span className="mail-badge">{count.non_lus}</span>
            )}
          </div>
          <div
            className={`mail-nav-item ${folder === "corbeille" ? "active" : ""}`}
            onClick={() => setFolder("corbeille")}
          >
            <FiTrash2 size={18} /> Corbeille
            {count && count.non_lus > 0 && folder === "corbeille" && (
              <span className="mail-badge">{count.non_lus}</span>
            )}
          </div>
        </nav>
        <div className="mail-sidebar-bottom">
          <Link className="mail-back-link" href={routes.adminDashboard}>
            ← {t.backDashboard || "Retour dashboard"}
          </Link>
        </div>
      </aside>

      {/* ============== CONTENU PRINCIPAL ============== */}
      <main className="mail-main">
        {/* Barre de recherche centrale */}
        <div className="mail-search-bar">
          <div className="mail-search-wrapper">
            <span className="mail-search-icon"><FiSearch size={18} /></span>
            <input
              type="search"
              className={`mail-search-input ${searchFocused ? 'mail-search-focused' : ''}`}
              placeholder="Rechercher dans les courriels"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
          <button className="mail-search-filters" title="Filtres avancés" onClick={() => setFiltersOpen(!filtersOpen)}>
            <FiMoreVertical size={18} />
          </button>
        </div>

        {/* Onglets catégories (dynamiques depuis l'API) */}
        <div className="mail-tabs">
          {categories.map((categorie) => {
            const isDefault = defaultCategoryId === categorie.id;
            const isDragging = draggingCategoryId === categorie.id;
            return (
              <button
                key={categorie.id}
                className={`mail-tab ${activeCategorieId === categorie.id ? "active" : ""} ${draggingCategoryId === categorie.id ? "mail-tab-dragging" : ""}`}
                style={{
                  borderLeft: `3px solid ${categorie.couleur}`,
                  backgroundColor: isDefault ? "rgba(21, 41, 77, 0.1)" : "transparent",
                }}
                onClick={() => setActiveCategorieId(categorie.id)}
                onMouseDown={() => setDraggingCategoryId(categorie.id)}
                onMouseUp={() => setDraggingCategoryId(null)}
                onMouseLeave={() => setDraggingCategoryId(null)}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/category-id", categorie.id.toString());
                  setDraggingCategoryId(categorie.id);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const draggedId = parseInt(e.dataTransfer.getData("text/category-id"));
                  if (draggedId && draggedId !== categorie.id) {
                    const newOrder = [...categories].filter((c) => c.id !== draggedId);
                    const insertIndex = newOrder.findIndex((c) => c.id === categorie.id);
                    newOrder.splice(insertIndex, 0, categories.find((c) => c.id === draggedId)!);
                    setCategories(newOrder);
                    setDraggingCategoryId(null);
                  }
                }}
              >
                {categorie.nom}
                {categorie.non_lus_count > 0 && (
                  <span className="mail-badge">{categorie.non_lus_count}</span>
                )}
                {isDefault && <span className="mail-badge-default"><FiStar size={14} fill="#f59e0b" /></span>}
                {!categorie.est_systeme && (
                  <>
                    <button
                      type="button"
                      className="mail-tab-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryToDelete(categorie);
                      }}
                    >
                      ✕
                    </button>
                    {!isDefault && (
                      <button
                        type="button"
                        className="mail-tab-default"
                        onClick={(e) => {
                          e.stopPropagation();
                          definirParDefaut(categorie.id);
                        }}
                      >
                        ★ Par défaut
                      </button>
                    )}
                  </>
                )}
              </button>
            )
          })}
          <button
            className="mail-tab mail-tab-add"
            onClick={ouvrirCreerCategorie}
          >
            + Créer une catégorie
          </button>
        </div>

        {/* Modal création catégorie */}
        {creerCategorieOuvert && (
          <div className="mail-modal-overlay" onClick={annulerCreerCategorie}>
            <div className="mail-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Nouvelle catégorie</h3>
              <div className="mail-modal-field">
                <label>Nom de la catégorie</label>
                <input
                  type="text"
                  className="mail-compose-input"
                  value={nouvelleCategorie.nom}
                  onChange={(e) => setNouvelleCategorie({ ...nouvelleCategorie, nom: e.target.value })}
                  placeholder="ex: Utilisateurs premium"
                  autoFocus
                />
                {validationError && <span className="mail-validation-error">{validationError}</span>}
              </div>
              <div className="mail-modal-field">
                <label>Couleur</label>
                <input
                  type="color"
                  className="mail-compose-input mail-color-input"
                  value={nouvelleCategorie.couleur}
                  onChange={(e) => setNouvelleCategorie({ ...nouvelleCategorie, couleur: e.target.value })}
                />
              </div>
              <div className="mail-modal-actions">
                <button type="button" className="btn btn-outline" onClick={annulerCreerCategorie}>
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={creerCategorie}
                  disabled={busy || !nouvelleCategorie.nom.trim()}
                >
                  {busy ? "Création…" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal confirmation suppression catégorie */}
        {categoryToDelete && (
          <div className="mail-modal-overlay" onClick={annulerSuppressionCategorie}>
            <div className="mail-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Supprimer la catégorie</h3>
              <p className="mail-modal-field">
                Êtes-vous sûr de vouloir supprimer la catégorie
                <strong>{categoryToDelete.nom}</strong> ?
              </p>
              <div className="mail-modal-actions">
                <button type="button" className="btn btn-outline" onClick={annulerSuppressionCategorie}>
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-outline mail-btn-delete"
                  onClick={confirmerSuppressionCategorie}
                  disabled={busy}
                >
                  {busy ? "Suppression…" : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtres rapides */}
        {view === "liste" && (
          <div className="mail-filters">
            <label>
              <input
                type="checkbox"
                checked={filtre === "non_lus"}
                onChange={(e) => setFiltre(e.target.checked ? "non_lus" : "")}
              />
              Non lus uniquement
            </label>
            <select
              className="mail-filter-select"
              value={page}
              onChange={(e) => setPage(parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  Page {p}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ============== VUE : LISTE DE MAILS ============== */}
        {view === "liste" && !detail && (
          <section className="mail-list-section">
            <div className="mail-toolbar">
              <input
                type="checkbox"
                className="mail-select-all"
                checked={selectedIds.size > 0 && selectedIds.size === mailsDisplay.length}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
              <span className="mail-count">
                {selectedIds.size > 0
                  ? `${selectedIds.size} sélectionné${selectedIds.size > 1 ? "s" : ""}`
                  : `${mailsDisplay.length} mail${mailsDisplay.length > 1 ? "s" : ""}`}
              </span>
              {sendSuccess && <span className="mail-success">{sendSuccess}</span>}
              {sendError && <span className="mail-error">{sendError}</span>}
              <button
                type="button"
                className="btn btn-outline mail-btn-sm"
                onClick={rafraîchirImap}
                disabled={imapLoading}
                title="Recharger les mails depuis le serveur IMAP"
              >
                {imapLoading ? "Actualisation…" : "⟳ Actualiser"}
              </button>
              <button
                type="button"
                className="btn btn-outline mail-btn-sm"
                onClick={() => setImapAccount(imapAccount === 1 ? 2 : 1)}
                disabled={imapLoading}
                title={`Basculer vers le compte ${imapAccount === 1 ? 2 : 1}`}
              >
                <FiSwitch size={18} />
                Compte {imapAccount}
              </button>
            </div>

            {selectedIds.size > 0 && (
              <div className="mail-bulk-actions">
                <span className="mail-bulk-label">{selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}</span>
                <button type="button" className="btn btn-outline mail-btn-sm" onClick={() => applyBulkAction("marquerLu")}>
                  Marquer comme lu
                </button>
                <button type="button" className="btn btn-outline mail-btn-sm" onClick={() => applyBulkAction("marquerNonLu")}>
                  Marquer comme non lu
                </button>
                <button type="button" className="btn btn-outline mail-btn-sm mail-btn-delete" onClick={() => applyBulkAction("supprimer")}>
                  Supprimer
                </button>
                <button type="button" className="btn btn-outline mail-btn-sm" onClick={() => applyBulkAction("marquerFavori")}>
                  Marquer comme favori
                </button>
                <button type="button" className="btn btn-outline mail-btn-sm" onClick={() => setSelectedIds(new Set())}>
                  Annuler la sélection
                </button>
              </div>
            )}

            {(loading && !resp) || (error && <p className="mail-error">{error}</p>)}

            {!loading && resp && mailsDisplay.length === 0 && (
              <p className="mail-empty">Aucun courriel dans ce dossier.</p>
            )}

            {!loading && mailsDisplay.length > 0 && (
              <table className="mail-table">
                <thead>
                  <tr>
                    <th className="mail-th-checkbox">
                      <input type="checkbox" checked={selectedIds.size > 0 && selectedIds.size === mailsDisplay.length} onChange={(e) => toggleSelectAll(e.target.checked)} />
                    </th>
                    <th className="mail-th-star">★</th>
                    <th className="mail-th-from" onClick={() => { setSortBy("expediteur"); setSortDir(sortBy === "expediteur" && sortDir === "asc" ? "desc" : "asc"); }}>
                      De
                    </th>
                    <th className="mail-th-subject" onClick={() => { setSortBy("sujet"); setSortDir(sortBy === "sujet" && sortDir === "asc" ? "desc" : "asc"); }}>
                      Sujet
                    </th>
                    <th className="mail-th-preview">Contenu</th>
                    <th className="mail-th-date" onClick={() => { setSortBy("date"); setSortDir(sortBy === "date" && sortDir === "asc" ? "desc" : "asc"); }}>
                      Heure
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mailsDisplay.map((m) => (
                    <tr
                      key={m.id}
                      className={`mail-row ${!m.lu ? "mail-unread" : ""} ${selectedIds.has(m.id) ? "mail-selected" : ""} ${selectedMailId === m.id ? "mail-open" : ""}`}
                      onClick={(e) => ouvrir(m.id, e)}
                    >
                      <td className="mail-td-checkbox">
                        <input type="checkbox" checked={isSelected(m.id)} onChange={(e) => toggleSelect(m.id, e)} />
                      </td>
                      <td className="mail-td-star">☆</td>
                      <td className="mail-td-from">{m.expediteur}</td>
                      <td className="mail-td-subject">{m.sujet}</td>
                      <td className="mail-td-preview">
                        {m.corps_texte ? m.corps_texte.slice(0, 60) : "—"}
                      </td>
                      <td className="mail-td-date">{fmtDate(m.recu_le, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {resp && resp.meta && resp.meta.derniere_page > 1 && (
              <div className="mail-pagination">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ←
                </button>
                <span>{page} / {resp.meta.derniere_page}</span>
                <button
                  disabled={page >= resp.meta.derniere_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  →
                </button>
              </div>
            )}
          </section>
        )}

        {/* ============== VUE : DÉTAIL D'UN MAIL ============== */}
        {view === "detail" && detail && (
          <section className="mail-detail-section">
            <div className="mail-detail-header">
              <button
                type="button"
                className="btn btn-outline"
                onClick={fermerDetail}
              >
                ← Retour
              </button>
              {!detail.lu && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => marquerLu(detail.id)}
                >
                  Marquer comme lu
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => basculerFavori(detail.id)}
              >
                {detail.lu ? <FiStar size={18} fill="#f59e0b" /> : <FiStar size={18} />} Favoris
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => ouvrirReponse(detail.id, detail.sujet)}
                disabled={busy || replyingTo !== null}
              >
                ↩ Répondre
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => ouvrirTransfert(detail.id, detail.sujet, detail.corps_texte || "")}
                disabled={busy}
              >
                ↪ Transférer
              </button>
              <button
                type="button"
                className="btn btn-outline mail-btn-delete"
                onClick={() => supprimerMail(detail.id)}
              >
                <FiTrash2 size={18} /> Supprimer
              </button>
            </div>

            <h1 className="mail-detail-title">{detail.sujet}</h1>

            <div className="mail-detail-meta">
              <span className="mail-meta-item">
                <strong>De:</strong> {detail.expediteur}
              </span>
              <span className="mail-meta-item">
                <strong>À:</strong>
                {(detail.destinataires ?? []).join(", ") || "—"}
              </span>
              {detail.copie && detail.copie.length > 0 && (
                <span className="mail-meta-item">
                  <strong>CC:</strong> {detail.copie.join(", ")}
                </span>
              )}
              <span className="mail-meta-item">
                <strong>Reçu le:</strong> {fmtDate(detail.recu_le, locale)}
              </span>
            </div>

            <div className="mail-detail-body">
              {detail.pieces_jointes && detail.pieces_jointes.length > 0 && (
                <div className="mail-attachments">
                  <strong>Pièces jointes:</strong>
                  <ul>
                    {detail.pieces_jointes.map((pj, i) => (
                      <li key={`${pj.nom}-${i}`}>
                        {pj.nom} ({pj.type || "—"}, {fmtTaille(pj.taille)})
                        {pj.url && (
                          <button
                            type="button"
                            className="btn btn-outline mail-btn-sm"
                            onClick={() => downloadMailAttachment(pj.url, pj.nom)}
                          >
                            Télécharger
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {corpsAssaini ? (
                <div className="mail-detail-content" dangerouslySetInnerHTML={{ __html: corpsAssaini }} />
              ) : (
                <p>{detail.corps_texte || "—"}</p>
              )}
            </div>
          </section>
        )}

        {/* ============== VUE : RÉPONDRE ============== */}
        {view === "repondre" && replyingTo !== null && (
          <section className="mail-compose-section">
            <div className="mail-compose-header">
              <button type="button" className="btn btn-outline" onClick={annulerReponse}>
                ← Retour
              </button>
              <h1 className="mail-compose-title">Répondre</h1>
            </div>
            {sendError && <p className="mail-error">{sendError}</p>}
            {sendSuccess && <p className="mail-success">{sendSuccess}</p>}
            <form onSubmit={(e) => { e.preventDefault(); repondre(); }}>
              <div className="mail-compose-field">
                <label>Sujet</label>
                <input
                  type="text"
                  className="mail-compose-input"
                  value={replyDraft.sujet}
                  onChange={(e) => setReplyDraft({ ...replyDraft, sujet: e.target.value })}
                  required
                />
              </div>
              <div className="mail-compose-field">
                <label>Corps</label>
                <textarea
                  className="mail-compose-textarea"
                  value={replyDraft.corps}
                  onChange={(e) => setReplyDraft({ ...replyDraft, corps: e.target.value })}
                  rows={10}
                  required
                ></textarea>
              </div>
              <div className="mail-compose-actions">
                <button type="button" className="btn btn-outline" onClick={annulerReponse}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy || !replyDraft.sujet || !replyDraft.corps}
                >
                  {busy ? "Envoi en cours..." : "Envoyer la réponse"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ============== VUE : TRANSFÉRER ============== */}
        {view === "transfert" && detail && (
          <section className="mail-compose-section">
            <div className="mail-compose-header">
              <button type="button" className="btn btn-outline" onClick={annulerTransfert}>
                ← Retour
              </button>
              <h1 className="mail-compose-title">Transférer</h1>
            </div>
            {sendError && <p className="mail-error">{sendError}</p>}
            {sendSuccess && <p className="mail-success">{sendSuccess}</p>}
            <form onSubmit={(e) => { e.preventDefault(); transférer(); }}>
              <div className="mail-compose-field">
                <label>Destinataire</label>
                <input
                  type="email"
                  className="mail-compose-input"
                  value={transfertDest}
                  onChange={(e) => setTransfertDest(e.target.value)}
                  placeholder="exemple@domaine.com"
                  required
                />
              </div>
              <div className="mail-compose-field">
                <label>Sujet</label>
                <input
                  type="text"
                  className="mail-compose-input"
                  value={transfertSujet}
                  onChange={(e) => setTransfertSujet(e.target.value)}
                  required
                />
              </div>
              <div className="mail-compose-field mail-compose-body-field">
                <label>Message (optionnel)</label>
                <textarea
                  className="mail-compose-textarea"
                  value={transfertCorps}
                  onChange={(e) => setTransfertCorps(e.target.value)}
                  rows={10}
                ></textarea>
              </div>
              <div className="mail-compose-actions">
                <button type="button" className="btn btn-outline" onClick={annulerTransfert}>
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy || !transfertDest || !transfertSujet}
                >
                  {busy ? "Transfert en cours…" : "Transférer"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ============== VUE : NOUVEAU MAIL ============== */}
        {view === "nouveau" && (
          <section className="mail-compose-section">
            <div className="mail-compose-header">
              <button type="button" className="btn btn-outline" onClick={annulerNouveau}>
                ← Retour
              </button>
              <h1 className="mail-compose-title">Nouveau message</h1>
            </div>
            {sendError && <p className="mail-error">{sendError}</p>}
            {sendSuccess && <p className="mail-success">{sendSuccess}</p>}
            <form onSubmit={(e) => { e.preventDefault(); envoyerMail(); }}>
              <div className="mail-compose-field">
                <label>Destinataire</label>
                <input
                  type="email"
                  className="mail-compose-input"
                  value={formDest}
                  onChange={(e) => setFormDest(e.target.value)}
                  placeholder="exemple@domaine.com"
                  required
                />
              </div>
              <div className="mail-compose-field">
                <label>Copie (CC)</label>
                <input
                  type="text"
                  className="mail-compose-input"
                  value={formCopie.join(", ")}
                  onChange={(e) => {
                    const emails = e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                    setFormCopie(emails.filter((email) => emailRegex.test(email) || email === ""));
                  }}
                  placeholder="copie1@domaine.com, copie2@domaine.com"
                />
              </div>
              <div className="mail-compose-field">
                <label>Sujet</label>
                <input
                  type="text"
                  className="mail-compose-input"
                  value={formSujet}
                  onChange={(e) => setFormSujet(e.target.value)}
                  required
                />
              </div>
              <div className="mail-compose-field mail-compose-body-field">
                <label>Corps du message</label>
                <textarea
                  className="mail-compose-textarea"
                  value={formTexte}
                  onChange={(e) => setFormTexte(e.target.value)}
                  rows={10}
                  required
                ></textarea>
                <div className="mail-attach-area">
                  <button
                    type="button"
                    className="btn btn-outline mail-btn-sm"
                    onClick={() => document.getElementById("attach-files")?.click()}
                  >
                    📎 Joindre des fichiers
                  </button>
                  <input
                    id="attach-files"
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => {
                      if (e.target.files) {
                        setFormPiecesJointes(Array.from(e.target.files));
                      }
                    }}
                  />
                  {formPiecesJointes.length > 0 && (
                    <div className="mail-attached-list">
                      {formPiecesJointes.map((f, i) => (
                        <div key={i} className="mail-attached-item">
                          {f.name} ({fmtTaille(f.size)})
                          <button
                            type="button"
                            className="btn btn-outline mail-btn-sm"
                            onClick={() =>
                              setFormPiecesJointes(formPiecesJointes.filter((_, j) => j !== i))
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mail-compose-actions">
                <button type="button" className="btn btn-outline" onClick={annulerNouveau}>
                  Annuler
                </button>
                <button type="button" className="btn btn-outline mail-btn-delete" onClick={clearDraft}>
                  Supprimer le brouillon
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy || !formDest || !formSujet || !formTexte}
                >
                  {busy ? "Envoi en cours…" : "Envoyer"}
                </button>
              </div>
            </form>
          </section>
        )}

        {detailLoading && <p className="mail-loading">Chargement…</p>}
      </main>
    </div>
  );
}
