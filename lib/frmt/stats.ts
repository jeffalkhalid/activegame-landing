// Statistiques lisibles de la fiche joueur (onglet Stats et carte à partager).
// Tout est dérivé des données FRMT déjà relevées : aucun calcul maison de niveau.
import type { MatchFiche, ResultatFiche } from './types';

/** Les lignes sans catégorie sont des bonus (ex. « BOUNUS FIP »), pas des tournois. */
const estTournoi = (r: ResultatFiche) => !!r.categorie;

export function indicateurs(resultats: ResultatFiche[], bilan: { joues: number; gagnes: number } | null) {
  const t = resultats.filter(estTournoi);
  return {
    tournois: t.length,
    moyenne: t.length ? Math.round(t.reduce((s, r) => s + r.points, 0) / t.length) : null,
    meilleur: t.length ? Math.max(...t.map((r) => r.points)) : null,
    victoires: bilan && bilan.joues ? Math.round((bilan.gagnes / bilan.joues) * 100) : null,
  };
}

const numeroCategorie = (c: string) => Number((c.match(/P(\d+)/) || [])[1] ?? 0);

/**
 * Titres des 12 derniers mois : un tournoi où le joueur a pris tous les points
 * de sa catégorie (1 500 en P1500, 2 000 en P2000…), comme le barème FRMT.
 * (La liste des matchs FRMT couvre toute la carrière : on ne s'en sert pas ici.)
 */
export function palmares(resultats: ResultatFiche[]): Array<{ categorie: string; titres: number }> {
  const titres = new Map<string, number>();
  for (const r of resultats) {
    if (!r.categorie || r.points !== numeroCategorie(r.categorie)) continue;
    titres.set(r.categorie, (titres.get(r.categorie) ?? 0) + 1);
  }
  return [...titres].map(([categorie, n]) => ({ categorie, titres: n }))
    .sort((a, b) => numeroCategorie(b.categorie) - numeroCategorie(a.categorie));
}

/** Bilan des 12 mois précédant le classement (la FRMT liste toute la carrière). */
export function bilan12Mois(matchs: MatchFiche[], dateClassement: string) {
  const ref = new Date(dateClassement);
  const debut = new Date(Date.UTC(ref.getUTCFullYear() - 1, ref.getUTCMonth(), ref.getUTCDate())).toISOString().slice(0, 10);
  const recents = matchs.filter((m) => (m.date ?? '') > debut);
  if (!recents.length) return null;
  const gagnes = recents.filter((m) => m.resultat === 'V').length;
  return { joues: recents.length, gagnes, perdus: recents.length - gagnes };
}

/** 12 mois glissants, du mois du classement (en premier) au plus ancien. */
export function pointsParMois(resultats: ResultatFiche[], dateClassement: string) {
  const ref = new Date(dateClassement);
  const mois = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - i, 1));
    return { mois: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`, comptes: 0, nonComptes: 0 };
  });
  const parMois = new Map(mois.map((m) => [m.mois, m]));
  for (const r of resultats) {
    const m = parMois.get((r.date ?? '').slice(0, 7));
    if (!m) continue;
    if (r.compte) m.comptes += r.points; else m.nonComptes += r.points;
  }
  return mois;
}

/** Points qui comptent au classement, par catégorie (bonus nommés), du plus gros au plus petit. */
export function parCategorie(resultats: ResultatFiche[]): Array<{ categorie: string; points: number }> {
  const sommes = new Map<string, number>();
  for (const r of resultats) {
    if (!r.compte) continue;
    const c = r.categorie ?? (/FIP/i.test(r.tournoi) ? 'Bonus FIP' : 'Bonus');
    sommes.set(c, (sommes.get(c) ?? 0) + r.points);
  }
  return [...sommes].map(([categorie, points]) => ({ categorie, points })).sort((a, b) => b.points - a.points);
}

export function topPourcent(rang: number, effectif: number): number {
  return Math.max(1, Math.ceil((rang / effectif) * 100 - 1e-9));
}

export function moisClassement(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'Africa/Casablanca' });
}
