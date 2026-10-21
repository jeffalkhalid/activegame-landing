// Disposition des tuiles du bas de la carte à partager (image 1080 × 1350).
const L = 1080, LARGEUR = 430, MARGE = 90;

export type Tuile = { type: 'points' | 'bilan'; x: number; largeur: number };

/** Sans victoire ni défaite sur 12 mois, pas de tuile bilan : les points se centrent. */
export function tuilesCarte(bilan: { gagnes: number; perdus: number } | null): Tuile[] {
  if (!bilan || bilan.gagnes + bilan.perdus === 0) return [{ type: 'points', x: (L - LARGEUR) / 2, largeur: LARGEUR }];
  return [
    { type: 'points', x: MARGE, largeur: LARGEUR },
    { type: 'bilan', x: L - MARGE - LARGEUR, largeur: LARGEUR },
  ];
}
