'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

// ─────────────────────────────────────────────────────────────────────────
// Page passerelle (« deep link gate »).
//
// Tous les liens partagés de l'app (parties, profils, parrainage) pointent ici
// via lib/community.ts → SHARE_BASE/open/?p=...  Le but :
//   • App installée  → on ouvre l'app sur le bon écran (scheme pagmatch://).
//   • Pas installée   → on retombe sur cette page = landing + bouton APK.
//
// Mécanisme Android : on redirige vers une URL `intent://…` qui embarque une
// `browser_fallback_url`. Si l'app gère le scheme `pagmatch`, Android l'ouvre ;
// sinon Chrome suit le fallback (cette même page avec ?noredirect=1, qui ne
// retente pas → pas de boucle, et affiche le bouton de téléchargement).
// ─────────────────────────────────────────────────────────────────────────

type Ctx = { title: string; sub: string };

function contextLabel(p: string | null): Ctx {
  switch (p) {
    case 'game':
      return {
        title: 'Tu es invité à une partie 🎾',
        sub: 'Ouvre PAG MATCH pour voir la partie et rejoindre les joueurs.',
      };
    case 'player':
      return {
        title: 'Découvre ce profil joueur',
        sub: 'Ouvre PAG MATCH pour voir la fiche, le niveau et les statistiques.',
      };
    case 'invite':
      return {
        title: 'Rejoins la communauté PAG MATCH',
        sub: 'Un ami t’invite à jouer au padel et à grimper au classement.',
      };
    default:
      return { title: 'Ouvrir PAG MATCH', sub: 'Le padel, niveau supérieur.' };
  }
}

// Chemin du deep link in-app reconstruit depuis les query params.
// Vide ⇒ on ouvre simplement l'app à l'accueil (parrainage, lien générique).
function deepPath(q: URLSearchParams): string {
  switch (q.get('p')) {
    case 'game': {
      // L'écran lobby auto-ouvre la partie via le param `gameId` (cf. lobby.tsx).
      const g = q.get('game');
      return g ? `lobby?gameId=${encodeURIComponent(g)}` : '';
    }
    case 'player': {
      const id = q.get('id');
      return id ? `player/${encodeURIComponent(id)}` : '';
    }
    default:
      return '';
  }
}

export default function OpenGate() {
  const [ctx, setCtx] = useState<Ctx>(contextLabel(null));
  // true dès qu'on a tenté d'ouvrir l'app (affiche un message « rien ne s'est
  // passé ? Installe l'app »). Sur ?noredirect=1 on n'a pas tenté.
  const [triedApp, setTriedApp] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setCtx(contextLabel(q.get('p')));

    const noRedirect = q.get('noredirect') === '1';
    const isAndroid = /android/i.test(navigator.userAgent);
    if (noRedirect || !isAndroid) return; // iOS/desktop ou retour de fallback : on montre juste la landing

    // Fallback = cette même page, sans nouvelle tentative (anti-boucle).
    const fallback = new URL(window.location.href);
    fallback.searchParams.set('noredirect', '1');

    const path = deepPath(q);
    const intentUrl =
      `intent://${path}#Intent;scheme=pagmatch;` +
      `S.browser_fallback_url=${encodeURIComponent(fallback.toString())};end`;

    setTriedApp(true);
    // App installée → bascule vers l'app. Sinon → browser_fallback_url.
    window.location.href = intentUrl;
  }, []);

  const hasApk = Boolean(LEGAL.apkUrl);

  return (
    <main
      className="container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 18,
        paddingTop: 64,
        paddingBottom: 64,
      }}
    >
      <span className="kicker" style={{ color: 'var(--brand)' }}>
        PAG MATCH
      </span>

      <h1 style={{ fontSize: 'clamp(28px, 6vw, 40px)', lineHeight: 1.1, margin: 0 }}>
        {ctx.title}
      </h1>

      <p style={{ color: 'var(--muted)', maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
        {ctx.sub}
      </p>

      <a
        className="btn btn-brand"
        href={hasApk ? LEGAL.apkUrl : undefined}
        aria-disabled={!hasApk}
        style={{
          marginTop: 8,
          opacity: hasApk ? 1 : 0.5,
          pointerEvents: hasApk ? 'auto' : 'none',
        }}
      >
        {hasApk ? 'Télécharger l’app (Android)' : 'Bientôt disponible'}
      </a>

      <p style={{ color: 'var(--muted-2)', fontSize: 13, maxWidth: 380, lineHeight: 1.6 }}>
        {triedApp
          ? 'Rien ne s’est passé ? L’app n’est pas encore installée — télécharge-la ci-dessus.'
          : 'Application Android. Après le téléchargement, autorise l’installation depuis cette source pour ouvrir le fichier.'}
      </p>

      <div style={{ marginTop: 16, display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          Découvrir PAG MATCH
        </Link>
        <Link href="/confidentialite" style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          Confidentialité
        </Link>
      </div>
    </main>
  );
}
