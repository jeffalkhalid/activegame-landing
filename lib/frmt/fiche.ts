// Présentation du classement FRMT : liens entre fiches et formats.
import type { JoueurMatch } from './types';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();

/**
 * Index « NOM DE FAMILLE|INITIALE|CLUB » → slug, pour relier partenaires et
 * adversaires (la FRMT les écrit « NOM.I (CLUB) ») à leur fiche. Le nom de
 * famille peut compter plusieurs mots : on indexe chaque découpe possible.
 * Une clé portée par deux joueurs vaut null : pas de lien plutôt qu'un faux.
 */
export function indexJoueurs(fiches: Array<{ slug: string; nom: string; club: string | null }>): Map<string, string | null> {
  const idx = new Map<string, string | null>();
  for (const f of fiches) {
    const mots = norm(f.nom).split(' ');
    for (let k = 1; k < mots.length; k++) {
      const cle = `${mots.slice(0, k).join(' ')}|${mots[k][0]}|${norm(f.club ?? '')}`;
      idx.set(cle, idx.has(cle) && idx.get(cle) !== f.slug ? null : f.slug);
    }
  }
  return idx;
}

export function lienJoueur(j: JoueurMatch, idx: Map<string, string | null>): string | null {
  return idx.get(`${norm(j.nom)}|${norm(j.initiale)}|${norm(j.club ?? '')}`) ?? null;
}

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
