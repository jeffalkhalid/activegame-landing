import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colonnesCarte } from './carte';

test('carte : points, victoires et défaites sur une ligne quand le joueur a joué sur 12 mois', () => {
  assert.deepEqual(colonnesCarte('25 080', { gagnes: 34, perdus: 7 }), [
    { valeur: '25 080', libelle: 'POINTS', x: 92, align: 'left' },
    { valeur: '34', libelle: 'VICTOIRES', x: 540, align: 'center' },
    { valeur: '7', libelle: 'DÉFAITES', x: 988, align: 'right' },
  ]);
});

test('carte : ni victoire ni défaite → les points seuls', () => {
  assert.deepEqual(colonnesCarte('1 200', null), [{ valeur: '1 200', libelle: 'POINTS', x: 92, align: 'left' }]);
  assert.deepEqual(colonnesCarte('1 200', { gagnes: 0, perdus: 0 }).length, 1);
});

test('carte : une seule défaite (aucune victoire) → le bilan reste', () => {
  assert.equal(colonnesCarte('800', { gagnes: 0, perdus: 1 }).length, 3);
});
