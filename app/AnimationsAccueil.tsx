'use client';

import { useEffect } from 'react';

/**
 * Révèle les blocs `.reveal` de l'accueil et pilote l'ombre de la barre de
 * navigation, À CHAQUE affichage de l'accueil.
 *
 * Le script du <head> (layout) ne tourne qu'au tout premier chargement : en
 * arrivant sur l'accueil depuis une page du classement (logo, « Télécharger »,
 * navigation interne Next), plus rien ne révélait les blocs, masqués par
 * `.js .reveal` → écran noir (constaté le 21/10).
 */
export default function AnimationsAccueil() {
  useEffect(() => {
    const nav = document.getElementById('nav');
    const ombre = () => nav?.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', ombre, { passive: true });
    ombre();

    const blocs = [...document.querySelectorAll<HTMLElement>('.reveal:not(.in)')];
    let io: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      // Seuil 0 + marge : un bloc plus haut que l'écran se révèle aussi.
      io = new IntersectionObserver((entrees) => {
        for (const e of entrees) if (e.isIntersecting) { e.target.classList.add('in'); io?.unobserve(e.target); }
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      blocs.forEach((b) => io?.observe(b));
    } else {
      blocs.forEach((b) => b.classList.add('in'));
    }
    // Filet : tout bloc déjà au-dessus du bas de l'écran est révélé.
    const filet = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach((b) => {
        if (b.getBoundingClientRect().top < window.innerHeight) b.classList.add('in');
      });
    }, 1500);

    return () => { window.removeEventListener('scroll', ombre); io?.disconnect(); window.clearTimeout(filet); };
  }, []);
  return null;
}
