import type { Metadata } from 'next';
import Link from 'next/link';
import StoreBadges from '../StoreBadges';
import { APP_STORE_PUB, PLAY_PUB } from '@/lib/telecharger';

/*
 * Page de REPLI de /telecharger. Les iPhone et les Android ne la voient pas :
 * vercel.json les envoie directement au store (302). Elle sert aux ordinateurs
 * (QR code), aux robots, et aux appareils non reconnus (iPad en mode bureau).
 */
export const metadata: Metadata = {
  title: 'Télécharge PAGMATCH',
  description: 'Trouve ta partie de padel, à ton niveau.',
  robots: { index: false, follow: false },
};

export default function Telecharger() {
  return (
    <main className="tel">
      <Link className="nav-logo tel-logo" href="/">
        <img className="racket" src="/assets/auth/splash-racket.png" alt="" />
        <img className="wm" src="/assets/auth/splash-wordmark.png" alt="Pagmatch" />
      </Link>
      <h1 className="tel-titre">Télécharge <span>PAGMATCH</span></h1>
      <p className="tel-sous">Trouve ta partie de padel, à ton niveau.</p>
      <StoreBadges center liens={{ apple: APP_STORE_PUB, google: PLAY_PUB }} />
      <div className="tel-qr">
        <img src="/assets/qr-telecharger.svg" alt="QR code vers www.pagmatch.com/telecharger" width={176} height={176} />
        <p>Scanne avec ton téléphone</p>
      </div>
    </main>
  );
}
