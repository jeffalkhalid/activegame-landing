// Les rubriques du site, en un seul endroit : menu ordinateur, menu burger du
// téléphone et pied de page les lisent toutes ici.
export const RUBRIQUES = [
  { href: '#orga', label: 'Fonctionnement' },
  { href: '#defi', label: 'Le défi' },
  { href: '#live', label: 'Score en direct' },
  { href: '#profil', label: 'Ton profil' },
  { href: '#how', label: 'Comment ça marche' },
  { href: '/classement/hommes/', label: 'Classement FRMT', page: true },
] as const;

export const INSTAGRAM_URL = 'https://www.instagram.com/pagmatch/';
