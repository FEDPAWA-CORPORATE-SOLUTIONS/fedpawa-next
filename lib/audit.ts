// ============================================================================
// FEDPAWA — Journal d'audit append-only avec chaînage cryptographique
// Conforme au cahier des charges : intégrité et traçabilité via SHA-256
// ============================================================================

import { createHash } from "crypto";

export interface AuditEntry {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  sessionId: string;
  dossierId: string;
  action: string;
  details: Record<string, unknown>;
  previousHash: string;
  hash: string;
}

// État du dernier hash (en mémoire, à persister en base de données ultérieurement)
let lastHash = "";

/**
 * Crée une entrée de journal d'audit avec hash chaîné.
 * Chaque entrée contient le hash de la précédente, rendant toute
 * altération détectable.
 */
export function createAuditEntry(
  dossierId: string,
  action: string,
  details: Record<string, unknown>,
  meta: { ip: string; userAgent: string; sessionId: string }
): AuditEntry {
  const timestamp = new Date().toISOString();
  const id = createHash("sha256")
    .update(`${timestamp}${dossierId}${action}`)
    .digest("hex")
    .slice(0, 16);
  const payload = `${id}${timestamp}${dossierId}${action}${JSON.stringify(details)}${lastHash}`;
  const hash = createHash("sha256").update(payload).digest("hex");
  const entry: AuditEntry = {
    id,
    timestamp,
    ip: meta.ip,
    userAgent: meta.userAgent,
    sessionId: meta.sessionId,
    dossierId,
    action,
    details,
    previousHash: lastHash,
    hash,
  };
  lastHash = hash;
  return entry;
}

/**
 * Retourne le dernier hash de la chaîne (pour vérification externe).
 */
export function getLastHash(): string {
  return lastHash;
}

/**
 * Réinitialise la chaîne de hash (tests ou nouveau cycle).
 */
export function resetHash(): void {
  lastHash = "";
}

/**
 * Vérifie l'intégrité d'une chaîne d'entrées d'audit.
 * Retourne true si tous les hashes sont cohérents.
 */
export function verifyAuditChain(entries: AuditEntry[]): boolean {
  let expectedPrevious = "";
  for (const entry of entries) {
    if (entry.previousHash !== expectedPrevious) return false;
    const payload = `${entry.id}${entry.timestamp}${entry.dossierId}${entry.action}${JSON.stringify(entry.details)}${entry.previousHash}`;
    const computedHash = createHash("sha256").update(payload).digest("hex");
    if (computedHash !== entry.hash) return false;
    expectedPrevious = entry.hash;
  }
  return true;
}
