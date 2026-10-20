import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indexJoueurs, lienJoueur, dateFR, nombre, libellesVides, evolutionTexte } from './fiche';

const fiches = [
  { slug: 'belhoussine-drissi-ghizlaine-1978', nom: 'BELHOUSSINE DRISSI GHIZLAINE', club: 'PFA' },
  { slug: 'zandar-nouhaila-2001', nom: 'ZANDAR NOUHAILA', club: 'PFA' },
  { slug: 'alami-mohamed-2002', nom: 'ALAMI MOHAMED', club: 'IND' },
  { slug: 'alami-mehdi-1999', nom: 'ALAMI MEHDI', club: 'IND' },
];

test('lien vers un partenaire classé : nom de famille + initiale + club', () => {
  const idx = indexJoueurs(fiches);
  assert.equal(lienJoueur({ nom: 'ZANDAR', initiale: 'N', club: 'PFA' }, idx), 'zandar-nouhaila-2001');
  assert.equal(lienJoueur({ nom: 'BELHOUSSINE DRISSI', initiale: 'G', club: 'PFA' }, idx), 'belhoussine-drissi-ghizlaine-1978');
});

test('nom inconnu ou non classé → pas de lien', () => {
  assert.equal(lienJoueur({ nom: 'INCONNU', initiale: 'X', club: 'IND' }, indexJoueurs(fiches)), null);
});

test('deux classés derrière la même abréviation → pas de lien (ambigu)', () => {
  assert.equal(lienJoueur({ nom: 'ALAMI', initiale: 'M', club: 'IND' }, indexJoueurs(fiches)), null);
});

test('même abréviation mais club différent → pas de lien', () => {
  assert.equal(lienJoueur({ nom: 'ZANDAR', initiale: 'N', club: 'RTCA' }, indexJoueurs(fiches)), null);
});

test('formats : date jj/mm/aaaa, nombres à la française', () => {
  assert.equal(dateFR('2026-07-04'), '04/07/2026');
  assert.equal(dateFR(null), '—');
  assert.equal(nombre(24680), '24 680');
  assert.equal(nombre(283.5), '283,5');
});

test('évolution : flèche et signe', () => {
  assert.equal(evolutionTexte(3), '▲3');
  assert.equal(evolutionTexte(-2), '▼2');
  assert.equal(evolutionTexte(0), null);
  assert.equal(evolutionTexte(null), null);
});

test('fiche sans résultat ni match : libellés explicites', () => {
  assert.deepEqual(libellesVides({ resultats: [], matchs: [] }), { resultats: 'Aucun résultat sur 12 mois', matchs: 'Aucun match sur 12 mois' });
  assert.deepEqual(libellesVides({ resultats: [{}], matchs: [{}] }), { resultats: null, matchs: null });
});
