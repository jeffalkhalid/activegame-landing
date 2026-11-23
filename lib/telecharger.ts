/**
 * /telecharger : l'adresse unique des publicités (Google Ads Demand Gen).
 *
 * Le site est un export statique : aucun code ne tourne à la requête. Le tri
 * iPhone / Android se fait donc dans vercel.json (redirections 302 conditionnées
 * par le user-agent), et tout le reste (ordinateur, robots) reçoit la page de
 * repli app/telecharger. Ces deux liens sont ceux des boutons de cette page ;
 * lib/telecharger.test.ts vérifie que vercel.json renvoie vers les mêmes.
 */
export const APP_STORE_PUB = 'https://apps.apple.com/app/id6817251293';
export const PLAY_PUB =
  'https://play.google.com/store/apps/details?id=com.pagmatch.app&referrer=utm_source%3Dgoogle%26utm_medium%3Ddemandgen';
export const ADRESSE_PUB = 'https://www.pagmatch.com/telecharger';
