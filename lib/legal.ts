// Informations légales centralisées du site PagMatch (Padel Active Game).
// ⚠️ À COMPLÉTER avant mise en ligne — doit rester cohérent avec
//    react-matchup/lib/legal.ts (mêmes valeurs).
export const LEGAL = {
  brand: 'Padel Active Game',
  appName: 'PagMatch',
  responsable: 'QUARTZTEC, SARL à associé unique au capital de 100 000 MAD, immatriculée au registre du commerce de Casablanca sous le n° 521941',
  editor: 'QUARTZTEC, SARL à associé unique au capital de 100 000 MAD, immatriculée au registre du commerce de Casablanca sous le n° 521941',
  contactEmail: 'support@pagmatch.com',
  supabaseRegion: 'Union européenne (Irlande — eu-west-1)',
  minAge: 18,
  // Date des CGU. Leur texte n'a pas bouge depuis le 10 juin 2026 : ne pas la
  // rajeunir sans modifier les conditions, ce serait annoncer une revision qui
  // n'a pas eu lieu.
  lastUpdate: '10 juin 2026',
  // La politique de confidentialite evolue SEULE, plus souvent que les CGU
  // (OpenStreetMap le 26/09, suppression de compte sans l'app le 27/09).
  // Garder identique a react-matchup/lib/legal.ts.
  privacyLastUpdate: '27 septembre 2026',
  // URLs des stores (à remplir une fois les apps publiées).
  appStoreUrl: '',
  playStoreUrl: '',
  // Test fermé : APK Android servi via une GitHub Release (tag stable « apk »,
  // limite 2 Go vs 50 Mo sur Supabase free ; URL constante d'une version à
  // l'autre — réuploader l'asset sur la même release). Cible du bouton
  // « Télécharger » de la page passerelle /open quand l'app n'est pas installée.
  apkUrl: 'https://github.com/jeffalkhalid/activegame-landing/releases/download/apk/pagmatch.apk',
} as const;
