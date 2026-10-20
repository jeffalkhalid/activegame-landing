import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chargerEdition, chargerEditionMemo, evolution, jsonLd } from './data';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://exemple.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'cle-anon-de-test';

type Ligne = Record<string, unknown>;

/** Fausse API PostgREST : sert des tables en mémoire, honore l'en-tête Range. */
function fausseBase(tables: Record<string, Ligne[]>) {
  const appels: Array<{ table: string; range: string | null; order: string | null }> = [];
  const fetchImpl = (async (url: string | URL, init?: RequestInit) => {
    const u = new URL(String(url));
    const table = u.pathname.split('/').pop() as string;
    const range = new Headers(init?.headers).get('Range');
    appels.push({ table, range, order: u.searchParams.get('order') });
    let lignes = tables[table] ?? [];
    for (const [k, v] of u.searchParams) {
      const m = v.match(/^(eq|in)\.(.*)$/);
      if (!m || ['select', 'order', 'limit'].includes(k)) continue;
      const valeurs = m[1] === 'in' ? m[2].replace(/^\(|\)$/g, '').split(',') : [m[2]];
      lignes = lignes.filter((l) => valeurs.includes(String(l[k])));
    }
    if (u.searchParams.get('order')?.startsWith('started_at.desc')) lignes = [...lignes].sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)));
    if (u.searchParams.get('limit')) lignes = lignes.slice(0, Number(u.searchParams.get('limit')));
    if (range) { const [a, b] = range.split('-').map(Number); lignes = lignes.slice(a, b + 1); }
    return new Response(JSON.stringify(lignes), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  return { fetchImpl, appels };
}

const ED = 'ed-2';
const base = (n: number, opts: { exclus?: string[]; ambigus?: string[] } = {}) => {
  const exclus = opts.exclus ?? [];
  // Vue publique : un retiré n'a ni nom, ni année, ni slug — seulement masque = true.
  const joueurs = Array.from({ length: n }, (_, i) => exclus.includes(`j${i}`)
    ? { id: `j${i}`, nom_affiche: null, annee: null, categorie: i % 5 === 0 ? 'Féminin' : 'Masculin', slug: null, masque: true }
    : { id: `j${i}`, nom_affiche: `JOUEUR ${i}`, annee: 1990, categorie: i % 5 === 0 ? 'Féminin' : 'Masculin', slug: `joueur-${i}-1990`, masque: false });
  const classements = joueurs.map((j, i) => ({
    edition_id: ED, joueur_id: j.id, rang: i + 1, points: 10000 - i, club: 'IND', ambigu: (opts.ambigus ?? []).includes(j.id),
    palmares_edition_id: i < 3 ? ED : null, classement_palmares: i + 1, matchs_joues: i < 3 ? 1 : null, matchs_gagnes: i < 3 ? 1 : null, matchs_perdus: i < 3 ? 0 : null,
  }));
  return {
    frmt_editions: [
      { id: ED, status: 'publiee', started_at: '2026-10-19T01:00:00Z', published_at: '2026-10-19T03:00:00Z' },
      { id: 'ed-1', status: 'retiree', started_at: '2026-10-12T01:00:00Z', published_at: '2026-10-12T03:00:00Z' },
    ],
    frmt_joueurs_publics: joueurs,
    frmt_classements: [...classements, { edition_id: 'ed-1', joueur_id: 'j1', rang: 3, points: 9100 }],
    frmt_resultats: [{ edition_id: ED, joueur_id: 'j0', ordre: 0, date: '2026-10-04', tournoi: 'OPEN', points: 1000, categorie: 'P1000', compte: true }],
    frmt_matchs: [{ edition_id: ED, joueur_id: 'j0', ordre: 0, date: '2026-10-04', tournoi: 'OPEN', phase: 'Final P1000', tour: 'Finale',
      partenaire: { nom: 'JOUEUR', initiale: '2', club: 'IND', joueur_id: 'j2' },
      adversaires: [{ nom: 'JOUEUR', initiale: '4', club: 'IND', joueur_id: 'j4' }, { nom: 'INCONNU', initiale: 'X', club: 'IND' }],
      score: '64 63', resultat: 'V' }],
  };
};

const cacheVide = () => mkdtempSync(path.join(tmpdir(), 'frmt-cache-'));

test('évolution : places gagnées et points gagnés ; sans précédent → null', () => {
  assert.deepEqual(evolution({ rang: 2, points: 19000 }, { rang: 3, points: 18200 }), { rang: 1, points: 800 });
  assert.deepEqual(evolution({ rang: 2, points: 19000 }), { rang: null, points: null });
});

test('pagination par 1 000 : 2 300 classements → plages 0-999, 1000-1999, 2000-2999', async () => {
  const { fetchImpl, appels } = fausseBase(base(2300));
  const e = await chargerEdition({ fetchImpl, cacheDir: cacheVide() });
  const plages = appels.filter((a) => a.table === 'frmt_classements' && a.range).map((a) => a.range);
  assert.deepEqual(plages.slice(0, 3), ['0-999', '1000-1999', '2000-2999']);
  assert.equal(e.classements.hommes.length + e.classements.femmes.length, 2300);
});

test('cache présent : seulement l édition publiée et la liste (courte) des retraits', async () => {
  const dir = cacheVide();
  const { fetchImpl } = fausseBase(base(20));
  await chargerEdition({ fetchImpl, cacheDir: dir });
  const deux = fausseBase(base(20));
  await chargerEdition({ fetchImpl: deux.fetchImpl, cacheDir: dir });
  assert.deepEqual(deux.appels.map((a) => a.table), ['frmt_editions', 'frmt_joueurs_publics']);
});

test('I4 : un retrait ajouté APRÈS la mise en cache s applique au build suivant', async () => {
  const dir = cacheVide();
  await chargerEdition({ fetchImpl: fausseBase(base(20)).fetchImpl, cacheDir: dir });
  const e = await chargerEdition({ fetchImpl: fausseBase(base(20, { exclus: ['j3'] })).fetchImpl, cacheDir: dir });
  assert.equal(e?.fiches.some((f) => f.slug === 'joueur-3-1990'), false);
  const ligne = e?.classements.hommes.find((l) => l.rang === 4);
  assert.deepEqual([ligne?.nom, ligne?.slug, ligne?.club, ligne?.masque], ['Joueur masqué', null, null, true]);
});

test('I1 : historique trié sur edition_id PUIS joueur_id (pagination stable)', async () => {
  const { fetchImpl, appels } = fausseBase(base(20));
  await chargerEdition({ fetchImpl, cacheDir: cacheVide() });
  const hist = appels.filter((a) => a.table === 'frmt_classements' && a.order !== 'joueur_id');
  assert.ok(hist.length > 0);
  assert.ok(hist.every((a) => a.order === 'edition_id,joueur_id'));
});

test('M2 : date affichée = date des données (started_at), pas de republication', async () => {
  const e = await chargerEdition({ fetchImpl: fausseBase(base(20)).fetchImpl, cacheDir: cacheVide() });
  assert.equal(e?.edition.date, '2026-10-19T01:00:00Z');
});

test('I9 : liens des matchs par identifiant ; vers un retiré ou un inconnu, pas de lien', async () => {
  const e = await chargerEdition({ fetchImpl: fausseBase(base(20, { exclus: ['j4'] })).fetchImpl, cacheDir: cacheVide() });
  const m = e?.fiches.find((f) => f.slug === 'joueur-0-1990')?.matchs[0];
  assert.equal(m?.partenaire?.slug, 'joueur-2-1990');
  assert.equal(m?.adversaires[0].slug ?? null, null);
  assert.equal(m?.adversaires[1].slug ?? null, null);
});

test('I7 : mémoïsation — un seul chargement par processus de build', async () => {
  const { fetchImpl, appels } = fausseBase(base(20));
  const opts = { fetchImpl, cacheDir: cacheVide() };
  await Promise.all([chargerEditionMemo(opts), chargerEditionMemo(opts), chargerEditionMemo(opts)]);
  assert.equal(appels.filter((a) => a.table === 'frmt_editions' && !a.order).length, 1);
});

test('M6 : JSON-LD sans fermeture de balise possible', () => {
  assert.equal(jsonLd({ name: 'X</script><script>alert(1)</script>' }).includes('</script'), false);
});

test('joueur exclu : pas de fiche, « Joueur masqué » à son rang, sans slug', async () => {
  const { fetchImpl } = fausseBase(base(20, { exclus: ['j4'] }));
  const e = await chargerEdition({ fetchImpl, cacheDir: cacheVide() });
  assert.equal(e.fiches.some((f) => f.slug === 'joueur-4-1990'), false);
  const ligne = e.classements.hommes.find((l) => l.rang === 5);
  assert.deepEqual([ligne?.nom, ligne?.slug, ligne?.masque, ligne?.annee], ['Joueur masqué', null, true, null]);
});

test('homonyme ambigu : présent dans le classement sous son nom, sans fiche ni lien', async () => {
  const { fetchImpl } = fausseBase(base(20, { ambigus: ['j6'] }));
  const e = await chargerEdition({ fetchImpl, cacheDir: cacheVide() });
  const ligne = e.classements.hommes.find((l) => l.rang === 7);
  assert.deepEqual([ligne?.nom, ligne?.slug], ['JOUEUR 6', null]);
  assert.equal(e.fiches.some((f) => f.slug === 'joueur-6-1990'), false);
});

test('fiche : genre, évolution depuis l édition précédente, détails depuis palmares_edition_id', async () => {
  const { fetchImpl } = fausseBase(base(20));
  const e = await chargerEdition({ fetchImpl, cacheDir: cacheVide() });
  const j1 = e.fiches.find((f) => f.slug === 'joueur-1-1990');
  assert.equal(j1?.genre, 'hommes');
  assert.deepEqual([j1?.evolutionRang, j1?.evolutionPoints], [1, 899]);
  const j0 = e.fiches.find((f) => f.slug === 'joueur-0-1990');
  assert.equal(j0?.genre, 'femmes');
  assert.equal(j0?.resultats.length, 1);
  assert.equal(j0?.matchs[0].resultat, 'V');
  assert.deepEqual(j0?.bilan, { joues: 1, gagnes: 1, perdus: 0 });
  const j10 = e.fiches.find((f) => f.slug === 'joueur-10-1990');
  assert.deepEqual([j10?.resultats.length, j10?.matchs.length, j10?.bilan], [0, 0, null]);
});

test('édition lue depuis un fichier (FRMT_EDITION_FICHIER) : aucun appel réseau', async () => {
  const dir = cacheVide();
  mkdirSync(dir, { recursive: true });
  const f = path.join(dir, 'edition.json');
  writeFileSync(f, JSON.stringify({ edition: { id: 'x', date: '2026-10-19' }, classements: { hommes: [], femmes: [] }, fiches: [] }));
  const { fetchImpl, appels } = fausseBase({});
  const e = await chargerEdition({ fetchImpl, cacheDir: dir, fichier: f });
  assert.equal(e.edition.id, 'x');
  assert.equal(appels.length, 0);
});

test('réglages Supabase absents au build : pas de plantage, édition nulle', async () => {
  const sauve = process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    const { fetchImpl, appels } = fausseBase(base(5));
    assert.equal(await chargerEdition({ fetchImpl, cacheDir: cacheVide() }), null);
    assert.equal(appels.length, 0);
  } finally { process.env.NEXT_PUBLIC_SUPABASE_URL = sauve; }
});
