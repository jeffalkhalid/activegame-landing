import { LEGAL } from '@/lib/legal';

/* ---------- Badges stores (état « bientôt » tant que l'URL est vide) -------
   Les badges OFFICIELS d'Apple et de Google, en français, tels que fournis
   (Apple : toolbox.marketingtools.apple.com ; Google : badge web générique,
   seule la marge transparente haut/bas a été rognée pour aligner les hauteurs).
   Ne pas les redessiner ni les recolorer : leurs chartes l'interdisent. */

const BADGES = {
  apple: { src: '/badges/app-store-fr.svg', alt: 'Télécharger dans l’App Store', w: 126.5, h: 40 },
  google: { src: '/badges/google-play-fr.png', alt: 'Disponible sur Google Play', w: 646, h: 190 },
} as const;

function StoreBadge({ href, store }: { href: string; store: keyof typeof BADGES }) {
  const b = BADGES[store];
  const img = <img className={`store-img ${store}`} src={b.src} alt={b.alt} width={b.w} height={b.h} />;
  // URL vide = app pas encore publiée : le badge existe, mais il n'est pas un
  // lien. Un <a href=""> rechargerait la page ; un <button> désactivé
  // ressemblerait à une panne.
  if (!href) {
    return (
      <span className="store soon" aria-label={`${b.alt} — bientôt disponible`}>
        {img}
        <span className="st-soon"><span className="st-dot" />Bientôt disponible</span>
      </span>
    );
  }
  return (
    <a className="store" href={href} target="_blank" rel="noopener noreferrer">
      {img}
    </a>
  );
}

export default function StoreBadges({ center = false }: { center?: boolean }) {
  return (
    <div className={`stores${center ? ' center' : ''}`}>
      <StoreBadge href={LEGAL.appStoreUrl} store="apple" />
      <StoreBadge href={LEGAL.playStoreUrl} store="google" />
    </div>
  );
}

