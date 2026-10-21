import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tuilesCarte } from './carte';

test('carte : points + bilan côte à côte quand le joueur a joué sur 12 mois', () => {
  assert.deepEqual(tuilesCarte({ gagnes: 31, perdus: 5 }), [
    { type: 'points', x: 90, largeur: 430 },
    { type: 'bilan', x: 560, largeur: 430 },
  ]);
});

test('carte : ni victoire ni défaite → pas de tuile bilan, la tuile points est centrée', () => {
  assert.deepEqual(tuilesCarte(null), [{ type: 'points', x: 325, largeur: 430 }]);
  assert.deepEqual(tuilesCarte({ gagnes: 0, perdus: 0 }), [{ type: 'points', x: 325, largeur: 430 }]);
});

test('carte : une seule défaite (aucune victoire) → la tuile bilan reste', () => {
  assert.equal(tuilesCarte({ gagnes: 0, perdus: 1 }).length, 2);
});
