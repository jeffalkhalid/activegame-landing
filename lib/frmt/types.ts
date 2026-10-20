// Données du classement FRMT telles que le site les consomme au build.
// Source : l'édition publiée (tables frmt_* de Supabase), cf.
// docs/superpowers/specs/2026-10-20-classement-frmt-design.md.

export type Genre = 'hommes' | 'femmes';

export interface Edition { id: string; date: string /* ISO, publication */ }

export interface JoueurClasse {
  id: string;               // frmt_joueurs.id (interne : retraits appliqués au cache)
  slug: string | null;      // null : pas de fiche (masqué ou homonyme ambigu)
  nom: string;              // « Joueur masqué » si exclu
  club: string | null;
  annee: number | null;
  rang: number;
  points: number;
  evolutionRang: number | null;   // + = a gagné des places
  evolutionPoints: number | null;
  masque: boolean;
}

export interface JoueurMatch {
  nom: string; initiale: string; club: string | null;
  joueur_id?: string;       // résolu au scrape si un seul classé correspond
  slug?: string | null;     // fiche à lier (absente si retiré, ambigu ou inconnu)
}

export interface MatchFiche {
  date: string | null; tournoi: string; phase: string | null; tour: string | null;
  partenaire: JoueurMatch | null; adversaires: JoueurMatch[]; score: string; resultat: 'V' | 'D';
}

export interface ResultatFiche { date: string | null; tournoi: string; points: number; categorie: string | null; compte: boolean }

export interface PalmaresFiche {
  meilleur: { rang: number; points: number; date: string | null } | null;
  bonus: { total: number; depart: number; afrique: number; fip: number; arabe: number };
  assimilation: { oui: boolean; points: number; classement: number | null };
  totaux: { total12Mois: number; douzeMeilleurs: number; bonusPlusDouze: number; pointsClassement: number; classement: number | null };
}

export interface FicheJoueur {
  id: string;
  slug: string; nom: string; club: string | null; annee: number; genre: Genre;
  rang: number; points: number; evolutionRang: number | null; evolutionPoints: number | null;
  palmares: PalmaresFiche | null;
  resultats: ResultatFiche[];
  matchs: MatchFiche[];
  bilan: { joues: number; gagnes: number; perdus: number } | null;
  courbe: { date: string; points: number }[];
}

export interface EditionComplete {
  edition: Edition;
  classements: Record<Genre, JoueurClasse[]>;
  fiches: FicheJoueur[];
}
