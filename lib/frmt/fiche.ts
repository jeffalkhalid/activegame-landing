// Présentation du classement FRMT : formats.
// (Les liens entre fiches sont résolus au scrape : JoueurMatch.slug.)

/** "2026-07-04" → "04/07/2026". */
export function dateFR(iso: string | null): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '—';
}

const FMT = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
export function nombre(n: number): string {
  return FMT.format(n);
}

export function evolutionTexte(n: number | null): string | null {
  if (!n) return null;
  return n > 0 ? `▲${n}` : `▼${-n}`;
}

export function libellesVides(f: { resultats: unknown[]; matchs: unknown[] }) {
  return {
    resultats: f.resultats.length ? null : 'Aucun résultat sur 12 mois',
    matchs: f.matchs.length ? null : 'Aucun match sur 12 mois',
  };
}
