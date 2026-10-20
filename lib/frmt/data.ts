// Lecture de l'édition FRMT publiée, AU BUILD uniquement (jamais depuis le
// navigateur : le trafic Supabase est le plafond du projet).
//
// Une édition ne change jamais une fois publiée : on la garde dans
// .next/cache/frmt/<id>.json, que Vercel conserve d'un build à l'autre. Les
// RETRAITS, eux, peuvent changer sans nouvelle édition : leur liste (courte)
// est relue à chaque build et appliquée par-dessus le cache.
//
// Les identités passent par la vue frmt_joueurs_publics, qui masque nom,
// année et slug d'un joueur retiré (la table n'est pas lisible en anon).
//
// FRMT_EDITION_FICHIER=<chemin.json> : lit une édition déjà assemblée (mise au
// point locale sans base).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { EditionComplete, FicheJoueur, Genre, JoueurClasse, JoueurMatch, MatchFiche, ResultatFiche } from './types';

type Ligne = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
interface Options { fetchImpl?: typeof fetch; cacheDir?: string; fichier?: string }

const GENRE: Record<string, Genre> = { Masculin: 'hommes', 'Féminin': 'femmes' };
const POINTS_COURBE = 26; // six mois d'éditions hebdomadaires
const MASQUE = 'Joueur masqué';

export function evolution(courant: { rang: number; points: number }, precedent?: { rang: number; points: number }) {
  if (!precedent) return { rang: null, points: null };
  return { rang: precedent.rang - courant.rang, points: Math.round((courant.points - precedent.points) * 10) / 10 };
}

/** JSON-LD sûr dans une balise <script> : aucune séquence « </ » possible. */
export function jsonLd(objet: unknown): string {
  return JSON.stringify(objet).replace(/</g, '\\u003c');
}

function client(fetchImpl: typeof fetch) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const entetes = { apikey: cle, Authorization: `Bearer ${cle}`, 'Range-Unit': 'items' };

  async function get(table: string, params: Record<string, string>, range?: string): Promise<Ligne[]> {
    const u = new URL(`${url}/rest/v1/${table}`);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    const r = await fetchImpl(u.toString(), { headers: range ? { ...entetes, Range: range } : entetes });
    if (!r.ok) throw new Error(`${table} : HTTP ${r.status}`);
    return r.json();
  }
  /** Tout lire par pages de 1 000 (plafond PostgREST) — toujours sur un tri unique. */
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

/**
 * Applique les retraits : pas de fiche, « Joueur masqué » à son rang, aucun
 * lien vers lui depuis les matchs des autres. Sert au chargement neuf comme au
 * cache (un retrait peut arriver entre deux éditions).
 */
function appliquerRetraits(e: EditionComplete, masques: Set<string>): EditionComplete {
  if (!masques.size) return e;
  const sansLien = (j: JoueurMatch): JoueurMatch => (j.joueur_id && masques.has(j.joueur_id) ? { ...j, slug: null } : j);
  return {
    ...e,
    classements: {
      hommes: e.classements.hommes.map((l) => (masques.has(l.id) ? { ...l, slug: null, nom: MASQUE, club: null, annee: null, masque: true } : l)),
      femmes: e.classements.femmes.map((l) => (masques.has(l.id) ? { ...l, slug: null, nom: MASQUE, club: null, annee: null, masque: true } : l)),
    },
    fiches: e.fiches.filter((f) => !masques.has(f.id)).map((f) => ({
      ...f, matchs: f.matchs.map((m) => ({ ...m, partenaire: m.partenaire && sansLien(m.partenaire), adversaires: m.adversaires.map(sansLien) })),
    })),
  };
}

export async function chargerEdition(opts: Options = {}): Promise<EditionComplete | null> {
  const fichier = opts.fichier ?? process.env.FRMT_EDITION_FICHIER;
  if (fichier) return JSON.parse(readFileSync(fichier, 'utf8'));

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Le site doit continuer à se construire (pages « bientôt ») ; on le dit
    // fort dans le journal du build plutôt que de casser le déploiement.
    console.warn('⚠️  Classement FRMT : NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY absents — pages en attente.');
    return null;
  }
  const db = client(opts.fetchImpl ?? fetch);
  const [publiee] = await db.get('frmt_editions', { status: 'eq.publiee', select: 'id,started_at', limit: '1' });
  if (!publiee) return null;

  const cacheDir = opts.cacheDir ?? path.join(process.cwd(), '.next', 'cache', 'frmt');
  const cache = path.join(cacheDir, `${publiee.id}.json`);
  if (existsSync(cache)) {
    const masques = new Set((await db.tout('frmt_joueurs_publics', { masque: 'eq.true', select: 'id', order: 'id' })).map((x) => x.id as string));
    return appliquerRetraits(JSON.parse(readFileSync(cache, 'utf8')), masques);
  }

  const courants = await db.tout('frmt_classements', { edition_id: `eq.${publiee.id}`, select: '*', order: 'joueur_id' });
  // Ordre par date des DONNÉES : après un retour en arrière, l'évolution et la
  // courbe restent calculées dans le bon ordre.
  const editions = await db.get('frmt_editions', { status: 'in.(publiee,retiree)', select: 'id,started_at', order: 'started_at.desc', limit: String(POINTS_COURBE) });
  const anterieures = editions.filter((e) => e.started_at <= publiee.started_at);
  const precedente = anterieures.find((e) => e.id !== publiee.id);
  const historique = anterieures.length
    ? await db.tout('frmt_classements', { edition_id: liste(anterieures.map((e) => e.id)), select: 'edition_id,joueur_id,rang,points', order: 'edition_id,joueur_id' })
    : [];
  const joueurs = await db.tout('frmt_joueurs_publics', { select: 'id,nom_affiche,annee,categorie,slug,masque', order: 'id' });

  const editionsDetails = [...new Set(courants.map((c) => c.palmares_edition_id).filter(Boolean))] as string[];
  const resultats = editionsDetails.length
    ? await db.tout('frmt_resultats', { edition_id: liste(editionsDetails), select: 'edition_id,joueur_id,ordre,date,tournoi,points,categorie,compte', order: 'id' }) : [];
  const matchs = editionsDetails.length
    ? await db.tout('frmt_matchs', { edition_id: liste(editionsDetails), select: 'edition_id,joueur_id,ordre,date,tournoi,phase,tour,partenaire,adversaires,score,resultat', order: 'id' }) : [];

  const parJoueur = new Map(joueurs.map((j) => [j.id, j]));
  const masques = new Set(joueurs.filter((j) => j.masque).map((j) => j.id as string));
  const ambigus = new Set(courants.filter((c) => c.ambigu).map((c) => c.joueur_id as string));
  // Slug d'un joueur qui a une fiche (ni retiré, ni homonyme ambigu).
  const slugFiche = (id?: string) => (id && !masques.has(id) && !ambigus.has(id) ? (parJoueur.get(id)?.slug ?? null) : null);

  const dateEdition = new Map(editions.map((e) => [e.id, e.started_at as string]));
  const precedents = new Map(historique.filter((h) => h.edition_id === precedente?.id).map((h) => [h.joueur_id, h]));
  const courbes = new Map<string, { date: string; points: number }[]>();
  for (const h of historique) {
    const d = dateEdition.get(h.edition_id);
    if (d) courbes.set(h.joueur_id, [...(courbes.get(h.joueur_id) ?? []), { date: d, points: Number(h.points) }]);
  }
  const detail = <T>(rows: Ligne[], map: (r: Ligne) => T) => {
    const m = new Map<string, Ligne[]>();
    for (const r of rows) { const k = `${r.edition_id}|${r.joueur_id}`; m.set(k, [...(m.get(k) ?? []), r]); }
    return (ed: string | null, j: string) => (ed ? (m.get(`${ed}|${j}`) ?? []).sort((a, b) => a.ordre - b.ordre).map(map) : []);
  };
  const lien = (j: Ligne): JoueurMatch => ({ nom: j.nom, initiale: j.initiale, club: j.club ?? null, joueur_id: j.joueur_id, slug: slugFiche(j.joueur_id) });
  const resultatsDe = detail<ResultatFiche>(resultats, (r) => ({ date: r.date, tournoi: r.tournoi, points: Number(r.points), categorie: r.categorie, compte: r.compte }));
  const matchsDe = detail<MatchFiche>(matchs, (r) => ({
    date: r.date, tournoi: r.tournoi, phase: r.phase, tour: r.tour,
    partenaire: r.partenaire ? lien(r.partenaire) : null, adversaires: (r.adversaires ?? []).map(lien), score: r.score, resultat: r.resultat,
  }));

  const classements: Record<Genre, JoueurClasse[]> = { hommes: [], femmes: [] };
  const fiches: FicheJoueur[] = [];
  for (const c of courants) {
    const j = parJoueur.get(c.joueur_id);
    if (!j) continue;
    const genre = GENRE[j.categorie];
    const prec = precedents.get(c.joueur_id);
    const ev = evolution({ rang: c.rang, points: Number(c.points) }, prec ? { rang: prec.rang, points: Number(prec.points) } : undefined);
    classements[genre].push({
      id: c.joueur_id, slug: slugFiche(c.joueur_id), nom: j.nom_affiche ?? MASQUE, club: c.club, annee: j.annee,
      rang: c.rang, points: Number(c.points), evolutionRang: ev.rang, evolutionPoints: ev.points, masque: false,
    });
    if (!slugFiche(c.joueur_id)) continue;
    fiches.push({
      id: c.joueur_id, slug: j.slug, nom: j.nom_affiche, club: c.club, annee: j.annee, genre, rang: c.rang, points: Number(c.points),
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

  const edition: EditionComplete = { edition: { id: publiee.id, date: publiee.started_at }, classements, fiches };
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(cache, JSON.stringify(edition));
  return appliquerRetraits(edition, masques);
}

// Une seule lecture par processus de build : chaque page, chaque métadonnée et
// le sitemap partagent la même promesse (et donc la même édition).
let memo: Promise<EditionComplete | null> | null = null;
export function chargerEditionMemo(opts: Options = {}): Promise<EditionComplete | null> {
  return (memo ??= chargerEdition(opts));
}
