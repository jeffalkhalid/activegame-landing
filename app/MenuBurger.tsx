'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { RUBRIQUES } from './rubriques';

/**
 * Menu du téléphone : le burger remplace le bouton « Télécharger » et le lien
 * « Rubriques », et contient les deux. Masqué au-dessus de 860 px (globals.css),
 * où la barre affiche les rubriques et le bouton directement.
 *
 * Le panneau s'accroche à `.nav`, qui est fixe : il suit la page au défilement
 * et prend toute la largeur de l'écran.
 */
export default function MenuBurger() {
  const [ouvert, setOuvert] = useState(false);
  const racine = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const toucheEchap = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false); };
    const appuiDehors = (e: PointerEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false);
    };
    document.addEventListener('keydown', toucheEchap);
    document.addEventListener('pointerdown', appuiDehors);
    return () => {
      document.removeEventListener('keydown', toucheEchap);
      document.removeEventListener('pointerdown', appuiDehors);
    };
  }, [ouvert]);

  const fermer = () => setOuvert(false);

  return (
    <div className="nav-burger" ref={racine}>
      <button
        type="button"
        className={`burger${ouvert ? ' open' : ''}`}
        aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={ouvert}
        aria-controls="menu-mobile"
        onClick={() => setOuvert(o => !o)}
      >
        <span /><span /><span />
      </button>
      <div className={`nav-panel${ouvert ? ' open' : ''}`} id="menu-mobile">
        <div className="wrap nav-panel-inner">
          <a className="btn btn-brand" href="#download" onClick={fermer}>Télécharger</a>
          {RUBRIQUES.map(r => ('page' in r
            ? <Link key={r.href} href={r.href} onClick={fermer}>{r.label}</Link>
            : <a key={r.href} href={r.href} onClick={fermer}>{r.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
