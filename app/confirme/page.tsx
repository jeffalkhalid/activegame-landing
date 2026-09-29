'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

// ─────────────────────────────────────────────────────────────────────────
// Confirmation d'adresse e-mail.
//
// Pourquoi une page web plutôt que l'app : l'e-mail de confirmation partait
// vers « …supabase.co », qui vérifiait le jeton puis redirigeait vers
// `pagmatch://`. Sur un téléphone, le navigateur sait suivre ce préfixe et
// ouvrir l'app. Sur un ORDINATEUR, il ne sait pas : le compte était bien
// validé, mais la personne tombait sur une page d'erreur et ne savait pas si
// ça avait marché. C'est le tout premier e-mail que reçoit un inscrit.
//
// 🔑 On ne pouvait pas régler ça avec un lien d'application, contrairement au
// mot de passe : un lien vérifié se reconnaît sur l'adresse CLIQUÉE, or celle
// de l'e-mail appartenait à Supabase.
//
// D'où ce choix : l'e-mail pointe ici, et CETTE PAGE valide le compte
// elle-même. Rien à saisir, donc rien qui exige l'app — ordinateur, téléphone
// avec l'app, téléphone sans : les trois marchent.
//
// ⚠️ Cette adresse n'est volontairement PAS déclarée comme lien d'application.
// Si elle l'était, un téléphone ouvrirait l'app au lieu de cette page, et la
// confirmation n'aurait jamais lieu.
// ─────────────────────────────────────────────────────────────────────────

type Etat = 'verification' | 'ok' | 'echec';

export default function ConfirmeEmail() {
  const [etat, setEtat] = useState<Etat>('verification');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const jeton = q.get('token_hash');
    // `signup` pour une inscription, `email_change` pour un changement
    // d'adresse : le gabarit le passe, on ne le devine pas.
    const type = q.get('type') ?? 'signup';

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!jeton || !base || !cle) { setEtat('echec'); return; }

    (async () => {
      try {
        const r = await fetch(`${base}/auth/v1/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: cle },
          body: JSON.stringify({ type, token_hash: jeton }),
        });
        setEtat(r.ok ? 'ok' : 'echec');
      } catch {
        setEtat('echec');
      }
    })();
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
        {etat === 'ok' ? 'COMPTE CONFIRMÉ' : 'CONFIRMATION'}
      </span>

      <h1 style={{ fontSize: 'clamp(28px, 6vw, 40px)', lineHeight: 1.1, margin: 0 }}>
        {etat === 'verification' && 'Un instant…'}
        {etat === 'ok' && 'C’est bon, ton compte est ouvert.'}
        {etat === 'echec' && 'Ce lien n’est plus valable'}
      </h1>

      <p style={{ color: 'var(--muted)', maxWidth: 440, lineHeight: 1.6, margin: 0 }}>
        {etat === 'verification' && 'On vérifie ton adresse.'}
        {etat === 'ok' && 'Ouvre Pagmatch et connecte-toi : tu peux commencer à chercher une partie à ton niveau.'}
        {/* On ne dit pas « erreur » : dans l'immense majorité des cas, le compte
            est DÉJÀ confirmé et la personne a simplement recliqué le lien. */}
        {etat === 'echec' && 'Il ne sert qu’une fois. Si tu as déjà confirmé ton adresse, tout va bien : connecte-toi simplement dans l’app.'}
      </p>

      {etat !== 'verification' && (
        <a className="btn btn-brand" href="pagmatch://" style={{ marginTop: 8 }}>
          Ouvrir Pagmatch
        </a>
      )}

      {etat !== 'verification' && hasApk && (
        <a className="btn" href={LEGAL.apkUrl} style={{ marginTop: 4 }}>
          Je n&apos;ai pas encore l&apos;application
        </a>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{ color: 'var(--muted-2)', fontSize: 13 }}>Accueil</Link>
        <Link href="/confidentialite" style={{ color: 'var(--muted-2)', fontSize: 13 }}>Confidentialité</Link>
      </div>
    </main>
  );
}
