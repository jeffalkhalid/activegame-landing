// Informations légales centralisées du site PAG MATCH (Padel Active Game).
// ⚠️ À COMPLÉTER avant mise en ligne — doit rester cohérent avec
//    react-matchup/lib/legal.ts (mêmes valeurs).
export const LEGAL = {
  brand: 'Padel Active Game',
  appName: 'PAG MATCH',
  responsable: 'QUARTZTEC, SARL à associé unique au capital de 100 000 MAD, immatriculée au registre du commerce de Casablanca sous le n° 521941',
  editor: 'QUARTZTEC, SARL à associé unique au capital de 100 000 MAD, immatriculée au registre du commerce de Casablanca sous le n° 521941',
  contactEmail: 'support@pagmatch.com',
  supabaseRegion: 'Union européenne (Irlande — eu-west-1)',
  minAge: 18,
  lastUpdate: '10 juin 2026',
  // URLs des stores (à remplir une fois les apps publiées).
  appStoreUrl: '',
  playStoreUrl: '',
  // Test fermé : APK Android servi depuis Supabase Storage (bucket public
  // « downloads ») — trop gros pour GitHub (>100 Mo). Cible du bouton
  // « Télécharger » de la page passerelle /open quand l'app n'est pas installée.
  apkUrl: 'https://icshhobxeppttgayxmba.supabase.co/storage/v1/object/public/downloads/pagmatch.apk',
} as const;
