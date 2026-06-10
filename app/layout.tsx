import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PAG MATCH — Padel Active Game · Trouve ta partie, suis ton classement',
  description:
    'PAG MATCH organise tes parties de padel entre joueurs : matchmaking, classement ELO, défis et communauté.',
  metadataBase: new URL('https://padelactivegame.com'),
  icons: { icon: '/assets/favicon.png' },
  openGraph: {
    title: 'PAG MATCH — Padel Active Game',
    description: 'Trouve ta partie, suis ton classement. Rejoins la communauté padel.',
    type: 'website',
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
