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
//
// Mécanisme iOS : il n'existe pas d'équivalent d'`intent://`. Et on ne redirige
// PAS automatiquement vers `pagmatch://` : si l'app n'est pas installée, Safari
// affiche une alerte d'erreur brutale à quelqu'un qui vient simplement de
// cliquer sur l'invitation d'un ami. On propose donc un bouton « J'ai déjà
// l'app » — un geste volontaire, sans surprise. La solution définitive est le
// Universal Link (l'app s'ouvre sans passer par cette page), qui demande le
// Team ID Apple : à poser dès qu'il sera disponible.
// ─────────────────────────────────────────────────────────────────────────

type Ctx = { title: string; sub: string };

function contextLabel(p: string | null): Ctx {
  switch (p) {
    case 'game':
      return {
        title: 'Tu es invité à une partie',
        sub: 'Ouvre PAG MATCH pour voir la partie et rejoindre les joueurs.',
      };
    case 'tournament':
      return {
        title: 'Tu es invité à un tournoi',
        sub: 'Ouvre PAG MATCH pour voir le tournoi et t’inscrire avec ton binôme.',
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
    case 'tournament': {
      // Route expo-router `app/tournaments/[id].tsx` → pagmatch://tournaments/<id>.
      const id = q.get('tournament');
      return id ? `tournaments/${encodeURIComponent(id)}` : '';
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
  // iOS ne sait pas faire d'`intent://` : on lui propose un bouton au lieu
  // d'une redirection automatique qui échouerait bruyamment.
  const [estIOS, setEstIOS] = useState(false);
  const [chemin, setChemin] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setCtx(contextLabel(q.get('p')));

    const path = deepPath(q);
    setChemin(path);

    const noRedirect = q.get('noredirect') === '1';
    const isAndroid = /android/i.test(navigator.userAgent);
    // iPadOS se déclare « Macintosh » : le test tactile le rattrape.
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
      || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    setEstIOS(isIOS);

    if (noRedirect || !isAndroid) return; // iOS/ordinateur ou retour de repli

    // Fallback = cette même page, sans nouvelle tentative (anti-boucle).
    const fallback = new URL(window.location.href);
    fallback.searchParams.set('noredirect', '1');

    const intentUrl =
      `intent://${path}#Intent;scheme=pagmatch;` +
      `S.browser_fallback_url=${encodeURIComponent(fallback.toString())};end`;

    setTriedApp(true);
    // App installée → bascule vers l'app. Sinon → browser_fallback_url.
    window.location.href = intentUrl;
  }, []);

  const hasApk = Boolean(LEGAL.apkUrl);
  const hasStore = Boolean(LEGAL.appStoreUrl);

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

      {/* iOS : geste volontaire plutôt que redirection automatique — si l'app
          n'est pas installée, Safari afficherait une alerte d'erreur à
          quelqu'un qui vient de cliquer sur l'invitation d'un ami. */}
      {estIOS && chemin && (
        <a
          className="btn btn-brand"
          href={`pagmatch://${chemin}`}
          style={{ marginTop: 8 }}
        >
          J’ai déjà l’app — l’ouvrir
        </a>
      )}

      <a
        className={estIOS && chemin ? 'btn' : 'btn btn-brand'}
        href={estIOS ? (hasStore ? LEGAL.appStoreUrl : undefined) : (hasApk ? LEGAL.apkUrl : undefined)}
        aria-disabled={estIOS ? !hasStore : !hasApk}
        style={{
          marginTop: 8,
          opacity: (estIOS ? hasStore : hasApk) ? 1 : 0.5,
          pointerEvents: (estIOS ? hasStore : hasApk) ? 'auto' : 'none',
        }}
      >
        {estIOS
          ? (hasStore ? 'Télécharger sur l’App Store' : 'Bientôt sur l’App Store')
          : (hasApk ? 'Télécharger l’app (Android)' : 'Bientôt disponible')}
      </a>

      <p style={{ color: 'var(--muted-2)', fontSize: 13, maxWidth: 380, lineHeight: 1.6 }}>
        {estIOS
          ? (chemin
              ? 'Si rien ne s’ouvre, c’est que l’app n’est pas installée sur cet iPhone.'
              : 'L’app iPhone arrive bientôt. En attendant, elle est disponible sur Android.')
          : triedApp
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
