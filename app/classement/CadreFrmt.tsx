import Link from 'next/link';
import StoreBadges from '../StoreBadges';

/** En-tête et pied communs aux pages du classement FRMT (liste et fiches). */
export function EnteteFrmt() {
  return (
    <nav className="frmt-nav">
      <div className="frmt-wrap frmt-nav-inner">
        <Link className="nav-logo" href="/">
          <img className="racket" src="/assets/auth/splash-racket.png" alt="" />
          <img className="wm" src="/assets/auth/splash-wordmark.png" alt="Pagmatch" />
        </Link>
        <Link className="btn btn-brand frmt-dl" href="/#download">Télécharger</Link>
      </div>
    </nav>
  );
}

/** L'appel vers l'app : la raison d'être de ces pages. */
export function AppelApp({ titre, texte }: { titre: string; texte: string }) {
  return (
    <section className="frmt-cta">
      <div className="frmt-cta-t">{titre}</div>
      <p>{texte}</p>
      <StoreBadges />
    </section>
  );
}

export function PiedFrmt() {
  return (
    <footer className="frmt-pied">
      <div className="frmt-wrap">
        <p>Classement officiel de la Fédération Royale Marocaine de Tennis (padel), repris chaque semaine. Source : FRMT.</p>
        <p><Link href="/">Pagmatch</Link> · <Link href="/cgu/">Conditions d&apos;utilisation</Link> · <Link href="/confidentialite/">Confidentialité</Link></p>
      </div>
    </footer>
  );
}
