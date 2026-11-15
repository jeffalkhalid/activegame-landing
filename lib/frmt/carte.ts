// Ligne de chiffres en bas de la carte à partager (image 1080 × 1350),
// dans l'esprit de la story « Carte Noire » de l'app (15/11/2026).
export const CARTE_L = 1080, CARTE_MARGE = 92;

export type Colonne = { valeur: string; libelle: string; x: number; align: 'left' | 'center' | 'right' };

/** Sans victoire ni défaite sur 12 mois, la ligne ne montre que les points. */
export function colonnesCarte(points: string, bilan: { gagnes: number; perdus: number } | null): Colonne[] {
  const pts: Colonne = { valeur: points, libelle: 'POINTS', x: CARTE_MARGE, align: 'left' };
  if (!bilan || bilan.gagnes + bilan.perdus === 0) return [pts];
  return [
    pts,
    { valeur: String(bilan.gagnes), libelle: 'VICTOIRES', x: CARTE_L / 2, align: 'center' },
    { valeur: String(bilan.perdus), libelle: 'DÉFAITES', x: CARTE_L - CARTE_MARGE, align: 'right' },
  ];
}
