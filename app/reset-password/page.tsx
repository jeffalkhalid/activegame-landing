'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

// ─────────────────────────────────────────────────────────────────────────
// Page de secours de la réinitialisation du mot de passe.
//
// Depuis que l'app déclare `https://www.pagmatch.com/reset-password` comme
// lien d'application (vérifié par /.well-known/), un téléphone qui l'a
// installée n'arrive JAMAIS ici : le système ouvre l'app directement.
//
// Cette page n'existe donc que pour les cas où ça ne marche pas — ordinateur,
// téléphone sans l'app, navigateur qui refuse l'ouverture. Avant, ces cas
// tombaient sur un `pagmatch://` que le navigateur ne connaît pas : rien ne
// se passait, et le jeton était déjà consommé. Le joueur était bloqué sans
// comprendre.
//
// Le jeton voyage dans l'adresse (`token_hash`). On ne l'échange PAS ici : le
// changement de mot de passe se fait dans l'app, sur un seul écran, avec la
// même validation que partout. Dupliquer ce formulaire sur le web, ce serait
// deux endroits où se tromper. La page se contente donc de rouvrir l'app en
// lui passant le jeton, et d'expliquer quand elle n'est pas là.
// ─────────────────────────────────────────────────────────────────────────

export default function ResetPasswordGate() {
  const [jeton, setJeton] = useState<string | null>(null);
  const [tente, setTente] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    // `token_hash` est le chemin actuel ; `code` celui des e-mails deja partis,
    // valides encore une heure.
    setJeton(q.get('token_hash') ?? q.get('code'));
  }, []);

  const hasApk = Boolean(LEGAL.apkUrl);

  return (
    <main
      className="container"
      style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        gap: 16, padding: '48px 20px',
      }}
    >
      <span className="kicker" style={{ color: 'var(--brand)' }}>
        MOT DE PASSE
      </span>

      <h1 style={{ fontSize: 'clamp(28px, 6vw, 40px)', lineHeight: 1.1, margin: 0 }}>
        Ouvre ce lien depuis ton téléphone
      </h1>

      <p style={{ color: 'var(--muted)', maxWidth: 440, lineHeight: 1.6, margin: 0 }}>
        La réinitialisation se termine dans l'application, sur l'appareil où tu
        viens d'en faire la demande. C'est lui qui détient la clé qui autorise le
        changement — aucun autre ne le peut, même avec ce lien.
      </p>

      {/* Geste volontaire, jamais automatique : sur iOS, un `pagmatch://` qui
          échoue affiche une alerte brutale à quelqu'un qui vient de cliquer un
          lien reçu par courriel. */}
      {jeton && (
        <a
          className="btn btn-brand"
          href={`pagmatch://reset-password?token_hash=${encodeURIComponent(jeton)}&type=recovery`}
          onClick={() => setTente(true)}
          style={{ marginTop: 8 }}
        >
          J'ai l'app sur cet appareil
        </a>
      )}

      {tente && (
        <p style={{ color: 'var(--muted-2)', fontSize: 13, maxWidth: 400, lineHeight: 1.6 }}>
          Rien ne s'est passé ? C'est que l'app n'est pas sur cet appareil.
          Recommence depuis ton téléphone : dans Pagmatch, écran de connexion →
          « Mot de passe oublié ».
        </p>
      )}

      {hasApk && (
        <a className="btn" href={LEGAL.apkUrl} style={{ marginTop: 4 }}>
          Télécharger l'application
        </a>
      )}

      <p style={{ color: 'var(--muted-2)', fontSize: 13, maxWidth: 400, lineHeight: 1.6 }}>
        Ce lien ne sert qu'une fois et expire au bout d'une heure. S'il ne
        fonctionne plus, redemande-en un depuis l'app — c'est normal, et sans
        conséquence pour ton compte.
      </p>

      <div style={{ marginTop: 16, display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{ color: 'var(--muted-2)', fontSize: 13 }}>Accueil</Link>
        <Link href="/confidentialite" style={{ color: 'var(--muted-2)', fontSize: 13 }}>Confidentialité</Link>
      </div>
    </main>
  );
}
