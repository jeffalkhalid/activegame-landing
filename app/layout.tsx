import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PAG MATCH — Padel Active Game · Trouve ta partie, suis ton niveau',
  description:
    'Trouve des joueurs vraiment à ton niveau — calculé sur tes matchs, pas déclaré. Crée ta partie, saisis ton score, regarde ton niveau bouger. L’app des joueurs de padel au Maroc.',
  metadataBase: new URL('https://pagmatch.com'),
  icons: { icon: '/assets/favicon.png' },
  openGraph: {
    title: 'PAG MATCH — Padel Active Game',
    description: 'Trouve ta partie, suis ton niveau. L’app des joueurs de padel au Maroc.',
    type: 'website',
    siteName: 'PAG MATCH',
    locale: 'fr_MA',
    /**
     * LA VIGNETTE DES LIENS PARTAGÉS.
     *
     * Sans elle, WhatsApp se rabattait sur la favicon : un timbre-poste de
     * 256 px à côté du texte. 1200 × 630 est le format que WhatsApp, Facebook
     * et LinkedIn affichent en GRANDE carte — un carré, même en 1024, reste
     * une vignette.
     *
     * ⚠️ Adresse absolue en `www`, et pas relative : `metadataBase` pointe sur
     * l'apex, or les liens de partage passent tous par `www` (l'apex est
     * bloqué chez certains fournisseurs marocains — cf. SHARE_BASE côté app).
     * Deux domaines pour la même image, c'est une vignette qui marche ici et
     * pas là.
     */
    images: [{
      url: 'https://www.pagmatch.com/assets/og-pagmatch.png',
      width: 1200,
      height: 630,
      alt: 'PAG MATCH — l’app des joueurs de padel au Maroc',
    }],
  },
  // X/Twitter n'utilise pas Open Graph : sans ce bloc, le lien y reste nu.
  twitter: {
    card: 'summary_large_image',
    title: 'PAG MATCH — Padel Active Game',
    description: 'Trouve ta partie, suis ton niveau. L’app des joueurs de padel au Maroc.',
    images: ['https://www.pagmatch.com/assets/og-pagmatch.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Avant tout React : active les animations (.js), nettoie un éventuel
            service worker parasite (ce site statique n'en utilise aucun — il peut
            rester un SW d'une autre app sur le même localhost), et pilote nav +
            reveals sans dépendre de l'hydratation React. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;d.classList.add('js');
try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});}).catch(function(){});}
if(window.caches&&caches.keys){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k);});}).catch(function(){});}}catch(e){}
function start(){var nav=document.getElementById('nav');if(nav){var f=function(){nav.classList.toggle('scrolled',window.scrollY>30);};window.addEventListener('scroll',f,{passive:true});f();}
var els=document.querySelectorAll('.reveal');if('IntersectionObserver' in window){var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.12});els.forEach(function(el){io.observe(el);});}else{els.forEach(function(el){el.classList.add('in');});}
setTimeout(function(){document.querySelectorAll('.reveal:not(.in)').forEach(function(el){if(el.getBoundingClientRect().top<window.innerHeight){el.classList.add('in');}});},3000);}
if(document.readyState!=='loading'){start();}else{document.addEventListener('DOMContentLoaded',start);}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:ital,wght@1,800;1,900&family=Inter:wght@400;500;600;700;800;900&family=Manrope:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
