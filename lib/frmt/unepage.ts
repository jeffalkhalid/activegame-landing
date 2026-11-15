// Fiche joueur sur une seule page (15/11/2026) : la frise « mois par mois »
// remplace les barres de points, le palmarès en coupes et la liste des
// tournois ; « Ses partenaires » est calculé à partir des matchs FRMT.
import type { JoueurMatch, MatchFiche, ResultatFiche } from './types';

const numeroCategorie = (c: string) => Number((c.match(/P(\d+)/) || [])[1] ?? 0);

/** Un titre = tous les points de sa catégorie (1 500 en P1500…), comme le palmarès. */
export function estTitre(r: ResultatFiche): boolean {
  return !!r.categorie && r.points === numeroCategorie(r.categorie);
}

export const titresTotal = (resultats: ResultatFiche[]) => resultats.filter(estTitre).length;

export interface MoisFrise { mois: string /* AAAA-MM */; resultats: Array<ResultatFiche & { titre: boolean }> }

/**
 * Les 12 mois du classement (mois vides compris), du plus récent au plus
 * ancien. Un résultat plus ancien (la FRMT compte en jours glissants) garde
 * son mois, ajouté en bas : rien ne disparaît de la fiche.
 */
export function frise(resultats: ResultatFiche[], dateClassement: string): MoisFrise[] {
  const ref = new Date(dateClassement);
  const parMois = new Map<string, MoisFrise>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - i, 1));
    const mois = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    parMois.set(mois, { mois, resultats: [] });
  }
  for (const r of resultats) {
    const mois = (r.date ?? '').slice(0, 7);
    if (!mois) continue;
    if (!parMois.has(mois)) parMois.set(mois, { mois, resultats: [] });
    parMois.get(mois)!.resultats.push({ ...r, titre: estTitre(r) });
  }
  const tous = [...parMois.values()].sort((a, b) => b.mois.localeCompare(a.mois));
  for (const m of tous) m.resultats.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  return tous;
}

export interface Partenaire { nom: string; initiale: string; slug: string | null; joues: number; gagnes: number; pct: number }

/** Partenaires d'au moins 2 matchs, du plus fréquent au moins fréquent (4 au plus). */
export function partenaires(matchs: MatchFiche[], max = 4): Partenaire[] {
  const parCle = new Map<string, { j: JoueurMatch; joues: number; gagnes: number }>();
  for (const m of matchs) {
    if (!m.partenaire) continue;
    const cle = `${m.partenaire.nom}|${m.partenaire.initiale}`;
    const p = parCle.get(cle) ?? { j: m.partenaire, joues: 0, gagnes: 0 };
    p.joues += 1;
    if (m.resultat === 'V') p.gagnes += 1;
    if (!p.j.slug && m.partenaire.slug) p.j = m.partenaire;
    parCle.set(cle, p);
  }
  return [...parCle.values()]
    .filter((p) => p.joues >= 2)
    .sort((a, b) => b.joues - a.joues || b.gagnes - a.gagnes)
    .slice(0, max)
    .map((p) => ({ nom: p.j.nom, initiale: p.j.initiale, slug: p.j.slug ?? null, joues: p.joues, gagnes: p.gagnes, pct: Math.round((p.gagnes / p.joues) * 100) }));
}

/** « F [Final] » → « Finale », « 1/4 [Final] » → « Quart de finale »… */
export function libelleTour(tour: string | null): string | null {
  if (!tour) return null;
  const t = tour.replace(/\s*\[.*?\]\s*/g, '').trim();
  if (/^F$/i.test(t)) return 'Finale';
  if (t === '1/2') return 'Demi-finale';
  if (t === '1/4') return 'Quart de finale';
  const n = t.match(/^1\/(\d+)$/);
  if (n) return `${n[1]}e de finale`;
  return t || null;
}
