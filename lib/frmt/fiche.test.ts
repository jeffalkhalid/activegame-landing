import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateFR, nombre, libellesVides, evolutionTexte } from './fiche';

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
