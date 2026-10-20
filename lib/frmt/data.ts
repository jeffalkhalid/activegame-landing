// Lecture de l'édition FRMT publiée, AU BUILD uniquement (jamais depuis le
// navigateur : le trafic Supabase est le plafond du projet).
//
// Une édition ne change jamais une fois publiée : on la garde dans
// .next/cache/frmt/<id>.json, que Vercel conserve d'un build à l'autre. Un
// build ordinaire (push sur main) ne coûte donc qu'une requête d'une ligne.
//
// FRMT_EDITION_FICHIER=<chemin.json> : lit une édition déjà assemblée (mise au
// point locale sans base).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { EditionComplete, FicheJoueur, Genre, JoueurClasse, MatchFiche, ResultatFiche } from './types';

type Ligne = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const GENRE: Record<string, Genre> = { Masculin: 'hommes', 'Féminin': 'femmes' };
const POINTS_COURBE = 26; // six mois d'éditions hebdomadaires

export function evolution(courant: { rang: number; points: number }, precedent?: { rang: number; points: number }) {
  if (!precedent) return { rang: null, points: null };
  return { rang: precedent.rang - courant.rang, points: Math.round((courant.points - precedent.points) * 10) / 10 };
}

function client(fetchImpl: typeof fetch) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !cle) throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants au build');
  const entetes = { apikey: cle, Authorization: `Bearer ${cle}`, 'Range-Unit': 'items' };

  async function get(table: string, params: Record<string, string>, range?: string): Promise<Ligne[]> {
    const u = new URL(`${url}/rest/v1/${table}`);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    const r = await fetchImpl(u.toString(), { headers: range ? { ...entetes, Range: range } : entetes });
    if (!r.ok) throw new Error(`${table} : HTTP ${r.status}`);
    return r.json();
  }
  /** Tout lire par pages de 1 000 (plafond PostgREST). */
  async function tout(table: string, params: Record<string, string>): Promise<Ligne[]> {
    const out: Ligne[] = [];
    for (let a = 0; ; a += 1000) {
      const page = await get(table, params, `${a}-${a + 999}`);
      out.push(...page);
      if (page.length < 1000) return out;
    }
  }
  return { get, tout };
}

const liste = (ids: string[]) => `in.(${ids.join(',')})`;

export async function chargerEdition(opts: { fetchImpl?: typeof fetch; cacheDir?: string; fichier?: string } = {}): Promise<EditionComplete | null> {
  const fichier = opts.fichier ?? process.env.FRMT_EDITION_FICHIER;
  if (fichier) return JSON.parse(readFileSync(fichier, 'utf8'));

  const db = client(opts.fetchImpl ?? fetch);
  const [publiee] = await db.get('frmt_editions', { status: 'eq.publiee', select: 'id,published_at', limit: '1' });
  if (!publiee) return null;

  const cacheDir = opts.cacheDir ?? path.join(process.cwd(), '.next', 'cache', 'frmt');
  const cache = path.join(cacheDir, `${publiee.id}.json`);
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, 'utf8'));

  const courants = await db.tout('frmt_classements', { edition_id: `eq.${publiee.id}`, select: '*', order: 'joueur_id' });
  const editions = await db.get('frmt_editions', { status: 'in.(publiee,retiree)', select: 'id,published_at', order: 'published_at.desc', limit: String(POINTS_COURBE) });
  const precedente = editions.find((e) => e.id !== publiee.id);
  const historique = editions.length
    ? await db.tout('frmt_classements', { edition_id: liste(editions.map((e) => e.id)), select: 'edition_id,joueur_id,rang,points', order: 'edition_id' })
    : [];
  const joueurs = await db.tout('frmt_joueurs', { select: 'id,nom_affiche,annee,categorie,slug', order: 'id' });
  const exclus = new Set((await db.tout('frmt_exclusions', { select: 'joueur_id' })).map((x) => x.joueur_id));

  const editionsDetails = [...new Set(courants.map((c) => c.palmares_edition_id).filter(Boolean))] as string[];
  const resultats = editionsDetails.length
    ? await db.tout('frmt_resultats', { edition_id: liste(editionsDetails), select: 'edition_id,joueur_id,ordre,date,tournoi,points,categorie,compte', order: 'id' }) : [];
  const matchs = editionsDetails.length
    ? await db.tout('frmt_matchs', { edition_id: liste(editionsDetails), select: 'edition_id,joueur_id,ordre,date,tournoi,phase,tour,partenaire,adversaires,score,resultat', order: 'id' }) : [];

  const parJoueur = new Map(joueurs.map((j) => [j.id, j]));
  const dateEdition = new Map(editions.map((e) => [e.id, e.published_at as string]));
  const precedents = new Map(historique.filter((h) => h.edition_id === precedente?.id).map((h) => [h.joueur_id, h]));
  const courbes = new Map<string, { date: string; points: number }[]>();
  for (const h of historique) {
    const d = dateEdition.get(h.edition_id);
    if (!d) continue;
    courbes.set(h.joueur_id, [...(courbes.get(h.joueur_id) ?? []), { date: d, points: Number(h.points) }]);
  }
  const detail = <T>(rows: Ligne[], map: (r: Ligne) => T) => {
    const m = new Map<string, Ligne[]>();
    for (const r of rows) { const k = `${r.edition_id}|${r.joueur_id}`; m.set(k, [...(m.get(k) ?? []), r]); }
    return (ed: string | null, j: string) => (ed ? (m.get(`${ed}|${j}`) ?? []).sort((a, b) => a.ordre - b.ordre).map(map) : []);
  };
  const resultatsDe = detail<ResultatFiche>(resultats, (r) => ({ date: r.date, tournoi: r.tournoi, points: Number(r.points), categorie: r.categorie, compte: r.compte }));
  const matchsDe = detail<MatchFiche>(matchs, (r) => ({ date: r.date, tournoi: r.tournoi, phase: r.phase, tour: r.tour, partenaire: r.partenaire, adversaires: r.adversaires ?? [], score: r.score, resultat: r.resultat }));

  const classements: Record<Genre, JoueurClasse[]> = { hommes: [], femmes: [] };
  const fiches: FicheJoueur[] = [];
  for (const c of courants) {
    const j = parJoueur.get(c.joueur_id);
    if (!j) continue;
    const genre = GENRE[j.categorie];
    const ev = evolution({ rang: c.rang, points: Number(c.points) }, precedents.get(c.joueur_id) && { rang: precedents.get(c.joueur_id).rang, points: Number(precedents.get(c.joueur_id).points) });
    const masque = exclus.has(c.joueur_id);
    const aFiche = !masque && !c.ambigu;
    classements[genre].push({
      slug: aFiche ? j.slug : null, nom: masque ? 'Joueur masqué' : j.nom_affiche, club: masque ? null : c.club,
      annee: masque ? null : j.annee, rang: c.rang, points: Number(c.points),
      evolutionRang: ev.rang, evolutionPoints: ev.points, masque,
    });
    if (!aFiche) continue;
    fiches.push({
      slug: j.slug, nom: j.nom_affiche, club: c.club, annee: j.annee, genre, rang: c.rang, points: Number(c.points),
      evolutionRang: ev.rang, evolutionPoints: ev.points,
      palmares: c.palmares_edition_id ? {
        meilleur: c.meilleur_rang != null ? { rang: c.meilleur_rang, points: Number(c.meilleur_points), date: c.meilleur_date } : null,
        bonus: { total: Number(c.bonus_total ?? 0), depart: Number(c.bonus_depart ?? 0), afrique: Number(c.bonus_afrique ?? 0), fip: Number(c.bonus_fip ?? 0), arabe: Number(c.bonus_arabe ?? 0) },
        assimilation: { oui: !!c.assimilation, points: Number(c.assimilation_points ?? 0), classement: c.assimilation_classement ?? null },
        totaux: { total12Mois: Number(c.total_12_mois ?? 0), douzeMeilleurs: Number(c.douze_meilleurs ?? 0), bonusPlusDouze: Number(c.bonus_plus_douze ?? 0), pointsClassement: Number(c.points_classement ?? 0), classement: c.classement_palmares ?? null },
      } : null,
      resultats: resultatsDe(c.palmares_edition_id, c.joueur_id),
      matchs: matchsDe(c.palmares_edition_id, c.joueur_id),
      bilan: c.matchs_joues != null ? { joues: c.matchs_joues, gagnes: c.matchs_gagnes ?? 0, perdus: c.matchs_perdus ?? 0 } : null,
      courbe: (courbes.get(c.joueur_id) ?? []).sort((a, b) => a.date.localeCompare(b.date)),
    });
  }
  classements.hommes.sort((a, b) => a.rang - b.rang);
  classements.femmes.sort((a, b) => a.rang - b.rang);

  const edition: EditionComplete = { edition: { id: publiee.id, date: publiee.published_at }, classements, fiches };
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(cache, JSON.stringify(edition));
  return edition;
}
