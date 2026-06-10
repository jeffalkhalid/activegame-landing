'use client';

import { useEffect, useState } from 'react';

// Choisit la vidéo adaptée à l'écran APRÈS montage → on ne télécharge
// qu'UN seul fichier (mobile portrait OU desktop paysage), pas les deux.
// Le poster s'affiche instantanément en attendant.
export default function HeroVideo() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = () => setSrc(mq.matches ? '/padel-mobile.mp4' : '/padel-desktop.mp4');
    apply(); // choix initial
    mq.addEventListener('change', apply); // re-bascule au resize / rotation
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <video
      key={src ?? 'poster'}
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/hero-poster.jpg"
    >
      {src && <source src={src} type="video/mp4" />}
    </video>
  );
}
