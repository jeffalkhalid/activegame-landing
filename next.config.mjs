import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Export 100 % statique → un dossier `out/` (HTML/CSS/JS) hébergeable sur
  // n'importe quel hébergeur (myhebergfacile, Vercel, Cloudflare Pages…),
  // sans serveur Node. Le site n'utilise aucune fonctionnalité serveur.
  output: 'export',
  // URLs propres en hébergement statique : génère /confidentialite/index.html
  // (servi sur /confidentialite/) plutôt qu'un fichier .html à la racine.
  trailingSlash: true,
  // Fige la racine du projet (plusieurs package-lock.json en amont).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
