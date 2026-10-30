'use client';

import { useEffect, useState } from 'react';

/** Hauteur défilée à partir de laquelle la flèche apparaît : environ un écran. */
const SEUIL_PX = 600;

/** Petite flèche fixe, en bas à droite, qui ramène en haut de l'accueil. */
export default function FlecheHaut() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const suivre = () => setVisible(window.scrollY > SEUIL_PX);
    window.addEventListener('scroll', suivre, { passive: true });
    suivre();
    return () => window.removeEventListener('scroll', suivre);
  }, []);

  return (
    <a className={`fleche-haut${visible ? ' on' : ''}`} href="#top" aria-label="Remonter en haut de la page" tabIndex={visible ? 0 : -1}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </a>
  );
}
