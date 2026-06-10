// Informations légales centralisées du site PAG MATCH (Padel Active Game).
// ⚠️ À COMPLÉTER avant mise en ligne — doit rester cohérent avec
//    react-matchup/lib/legal.ts (mêmes valeurs).
export const LEGAL = {
  brand: 'Padel Active Game',
  appName: 'PAG MATCH',
  responsable: 'QUARTZTEC, SARL à associé unique au capital de 100 000 MAD, immatriculée au registre du commerce de Casablanca sous le n° 521941',
  editor: 'QUARTZTEC, SARL à associé unique au capital de 100 000 MAD, immatriculée au registre du commerce de Casablanca sous le n° 521941',
  contactEmail: 'support@padelactivegame.com',
  supabaseRegion: 'Union européenne (Irlande — eu-west-1)',
  minAge: 18,
  lastUpdate: '10 juin 2026',
  // URLs des stores (à remplir une fois les apps publiées).
  appStoreUrl: '',
  playStoreUrl: '',
  // Test fermé : APK Android téléchargé directement (déposer le fichier dans
  // public/ puis le servir à cette URL). Cible du bouton « Télécharger » de la
  // page passerelle /open quand l'app n'est pas installée.
  apkUrl: '/pagmatch.apk',
} as const;
