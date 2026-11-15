import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estTitre, frise, libelleTour, partenaires, titresTotal } from './unepage';
import type { JoueurMatch, MatchFiche, ResultatFiche } from './types';

const R = (date: string, tournoi: string, points: number, categorie: string | null, compte = true): ResultatFiche => ({ date, tournoi, points, categorie, compte });

test('titre : tous les points de la catégorie, jamais un bonus', () => {
  assert.equal(estTitre(R('2026-07-04', 'CHAMPIONNAT', 2000, 'P2000')), true);
  assert.equal(estTitre(R('2026-09-27', 'COUPE DU TRONE', 1680, 'P2000')), false);
  assert.equal(estTitre(R('2026-11-06', 'BOUNUS FIP', 8500, null)), false);
  assert.equal(titresTotal([R('2026-07-04', 'A', 2000, 'P2000'), R('2026-05-03', 'B', 1500, 'P1500'), R('2026-03-29', 'C', 1200, 'P1500')]), 2);
});

test('frise : 12 mois du classement au plus ancien, mois vides compris, tournois du plus récent au plus ancien', () => {
  const f = frise([
    R('2026-11-01', 'AFF', 1500, 'P1500'),
    R('2026-11-06', 'BOUNUS FIP', 8500, null),
    R('2026-07-04', 'CHAMPIONNAT', 2000, 'P2000'),
  ], '2026-11-10');
  assert.equal(f.length, 12);
  assert.equal(f[0].mois, '2026-11');
  assert.deepEqual(f[0].resultats.map((r) => r.tournoi), ['BOUNUS FIP', 'AFF']);
  assert.equal(f[0].resultats[1].titre, true);
  assert.equal(f[1].mois, '2026-10');
  assert.deepEqual(f[1].resultats, []);
  assert.equal(f[11].mois, '2025-12');
});

test('frise : un résultat plus ancien que les 12 mois garde sa place en bas', () => {
  const f = frise([R('2025-11-30', 'P2M', 1050, 'P1500', false)], '2026-11-10');
  assert.equal(f.length, 13);
  assert.equal(f[12].mois, '2025-11');
  assert.equal(f[12].resultats[0].tournoi, 'P2M');
});

const J = (nom: string, initiale: string, slug: string | null = null): JoueurMatch => ({ nom, initiale, club: null, slug });
const M = (partenaire: JoueurMatch | null, resultat: 'V' | 'D'): MatchFiche =>
  ({ date: '2026-10-01', tournoi: 'T', phase: null, tour: null, partenaire, adversaires: [], score: '', resultat });

test('partenaires : du plus fréquent au moins fréquent, avec le % de victoires', () => {
  const moumar = J('MOUMAR', 'A', 'moumar-adam-2006');
  const ziadi = J('ZIADI', 'M');
  const p = partenaires([M(moumar, 'V'), M(moumar, 'V'), M(moumar, 'D'), M(ziadi, 'V'), M(ziadi, 'V'), M(null, 'V'), M(J('SEUL', 'X'), 'D')]);
  assert.deepEqual(p.map((x) => [x.nom, x.joues, x.gagnes, x.pct]), [['MOUMAR', 3, 2, 67], ['ZIADI', 2, 2, 100]]);
  assert.equal(p[0].slug, 'moumar-adam-2006');
});

test('partenaires : 4 au plus', () => {
  const ms = ['A', 'B', 'C', 'D', 'E'].flatMap((n) => [M(J(n, 'X'), 'V'), M(J(n, 'X'), 'D')]);
  assert.equal(partenaires(ms).length, 4);
});

test('tours : noms lisibles', () => {
  assert.equal(libelleTour('F [Final]'), 'Finale');
  assert.equal(libelleTour('1/2 [Final]'), 'Demi-finale');
  assert.equal(libelleTour('1/4 [Final]'), 'Quart de finale');
  assert.equal(libelleTour('1/8 [Final]'), '8e de finale');
  assert.equal(libelleTour('1/16'), '16e de finale');
  assert.equal(libelleTour('Poule A [Qualif]'), 'Poule A');
  assert.equal(libelleTour(null), null);
});
