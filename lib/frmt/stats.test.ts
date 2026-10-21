import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indicateurs, palmares, pointsParMois, parCategorie, topPourcent, moisClassement, bilan12Mois } from './stats';
import type { MatchFiche, ResultatFiche } from './types';

const R = (date: string, tournoi: string, points: number, categorie: string | null, compte = true): ResultatFiche => ({ date, tournoi, points, categorie, compte });
const resultats: ResultatFiche[] = [
  R('2026-10-02', 'BOUNUS FIP', 8500, null),
  R('2026-07-04', 'CHAMPIONNAT DU MAROC P2000 HOMMES', 2000, 'P2000'),
  R('2026-09-20', 'REDMED P1500 HOMMES', 1500, 'P1500'),
  R('2026-09-27', 'COUPE DU TRONE', 1680, 'P2000'),
  R('2025-12-07', 'ARENA P1000 HOMMES', 800, 'P1000', false),
];
const M = (tournoi: string, date: string, tour: string, resultat: 'V' | 'D', phase = 'Final P1500'): MatchFiche =>
  ({ date, tournoi, phase, tour, partenaire: null, adversaires: [], score: '64 63', resultat });

test('indicateurs : tournois (hors bonus), moyenne, meilleur résultat, % de victoires', () => {
  assert.deepEqual(indicateurs(resultats, { joues: 140, gagnes: 111, perdus: 29 }), {
    tournois: 4, moyenne: 1495, meilleur: 2000, victoires: 79,
  });
});

test('indicateurs : joueur sans résultat ni match', () => {
  assert.deepEqual(indicateurs([], null), { tournois: 0, moyenne: null, meilleur: null, victoires: null });
});

test('palmarès : un titre = tous les points de la catégorie (1 500 en P1500), sur les 12 mois', () => {
  const r = [
    R('2026-07-04', 'CHAMPIONNAT DU MAROC P2000', 2000, 'P2000'),
    R('2026-09-27', 'COUPE DU TRONE', 1680, 'P2000'),
    R('2026-05-03', 'ARENA P1500', 1500, 'P1500'),
    R('2026-04-26', 'REDMED P1500', 1500, 'P1500', false),
    R('2026-03-29', 'P2M P1500', 1200, 'P1500'),
    R('2026-10-02', 'BOUNUS FIP', 8500, null),
  ];
  assert.deepEqual(palmares(r), [{ categorie: 'P2000', titres: 1 }, { categorie: 'P1500', titres: 2 }]);
});

test('bilan sur 12 mois : la FRMT donne toute la carrière, on ne garde que les 12 derniers mois', () => {
  const matchs = [
    M('A', '2026-09-06', 'F [Final]', 'V'), M('A', '2026-09-06', '1/2 [Final]', 'D'),
    M('B', '2025-10-25', '1/4 [Final]', 'V'),
    M('C', '2025-10-15', 'F [Final]', 'V'), M('D', '2024-07-07', 'F [Final]', 'V'),
  ];
  assert.deepEqual(bilan12Mois(matchs, '2026-10-21'), { joues: 3, gagnes: 2, perdus: 1 });
  assert.equal(bilan12Mois([], '2026-10-21'), null);
});

test('points par mois : 12 mois glissants jusqu au mois du classement, comptés et non comptés séparés', () => {
  const mois = pointsParMois(resultats, '2026-10-21');
  assert.equal(mois.length, 12);
  assert.deepEqual(mois[0], { mois: '2026-10', comptes: 8500, nonComptes: 0 });
  assert.deepEqual(mois.find((m) => m.mois === '2026-09'), { mois: '2026-09', comptes: 3180, nonComptes: 0 });
  assert.deepEqual(mois.find((m) => m.mois === '2025-12'), { mois: '2025-12', comptes: 0, nonComptes: 800 });
  assert.equal(mois[11].mois, '2025-11');
});

test('répartition par catégorie : points comptés seulement, plus gros d abord, bonus nommé', () => {
  assert.deepEqual(parCategorie(resultats), [
    { categorie: 'Bonus FIP', points: 8500 },
    { categorie: 'P2000', points: 3680 },
    { categorie: 'P1500', points: 1500 },
  ]);
});

test('top % : arrondi au supérieur, jamais moins de 1 %', () => {
  assert.equal(topPourcent(1, 2540), 1);
  assert.equal(topPourcent(254, 2540), 10);
  assert.equal(topPourcent(255, 2540), 11);
  assert.equal(topPourcent(502, 502), 100);
});

test('mois du classement en toutes lettres', () => {
  assert.equal(moisClassement('2026-10-21T10:56:07Z'), 'octobre 2026');
});
