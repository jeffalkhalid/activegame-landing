# PAG MATCH — Landing

Site vitrine **PAG MATCH** (Padel Active Game). Domaine cible : **padelactivegame.com**.
Next.js (App Router, TypeScript), zéro dépendance de style (CSS pur).

## Pages
- `/` — landing (hero, sports, fonctionnalités, téléchargement, footer)
- `/confidentialite` — Politique de confidentialité (URL exigée par App Store + Google Play)
- `/cgu` — Conditions d'utilisation

## Avant mise en ligne
Compléter `lib/legal.ts` (doit rester **cohérent** avec `react-matchup/lib/legal.ts`) :
- `responsable`, `editor`, `supabaseRegion` (Supabase → Project Settings → General)
- `appStoreUrl`, `playStoreUrl` une fois les apps publiées (sinon les boutons affichent « Bientôt disponible »)
- `contactEmail` est déjà `support@pagmatch.com`

## Lancer en local
```bash
npm install
npm run dev      # http://localhost:3000
```

## Déployer
**Vercel** (recommandé) : importer le dossier → build auto (`next build`). Puis brancher le domaine **padelactivegame.com** dans Vercel → Settings → Domains.
**Cloudflare Pages** : framework preset « Next.js ».

## URLs à reporter dans les stores et l'app
Une fois en ligne :
- Politique : `https://padelactivegame.com/confidentialite`
- CGU : `https://padelactivegame.com/cgu`
À renseigner dans App Store Connect, Google Play Console, et (optionnel) dans `react-matchup` si tu veux pointer vers ces URLs web.
