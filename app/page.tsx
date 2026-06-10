import Link from 'next/link';
import { LEGAL } from '@/lib/legal';
import { HomeScreen, MatchScreen, RankScreen } from './mockups';
import HeroVideo from './HeroVideo';

/* Bascule le fond du hero : true = vidéo padel en fond, false = fond dégradé (défaut handoff). */
const HERO_BG_VIDEO = true;

/* ---------- Store badges (App Store + Google Play) ---------- */
function StoreBadges() {
  return (
    <div className="stores">
      <StoreBadge
        href={LEGAL.appStoreUrl}
        label="Télécharger sur l'App Store"
        small="Télécharger sur"
        big="App Store"
        icon={<svg viewBox="0 0 24 24" fill="#0A0A0A"><path d="M16.5 1.6c.1 1-.3 2-1 2.8-.7.8-1.8 1.4-2.8 1.3-.1-1 .4-2 1-2.7.7-.8 1.9-1.4 2.8-1.4zM20 17.2c-.5 1.2-.8 1.7-1.4 2.7-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.4.9-3.7.9c-1.6 0-2.8-1.6-3.7-2.9C1.2 16.4.9 11.8 2.5 9.4c1.1-1.7 2.9-2.7 4.5-2.7 1.7 0 2.7 1 4.1 1 1.3 0 2.1-1 4.1-1 1.5 0 3 .8 4.1 2.2-3.6 2-3 7.1.2 8.3z" /></svg>}
      />
      <StoreBadge
        href={LEGAL.playStoreUrl}
        label="Disponible sur Google Play"
        small="Disponible sur"
        big="Google Play"
        icon={<svg viewBox="0 0 24 24"><path fill="#00D3FF" d="M3.7 2.3 13.8 12H3.7z" /><path fill="#00F076" d="M3.7 21.7 13.8 12H3.7z" /><path fill="#FF3945" d="M3.7 2.3 20 12h-6.2z" /><path fill="#FFCE00" d="M3.7 21.7 20 12h-6.2z" /></svg>}
      />
    </div>
  );
}

function StoreBadge({ href, label, small, big, icon }: {
  href: string; label: string; small: string; big: string; icon: React.ReactNode;
}) {
  const inner = (
    <>
      {icon}
      <div className="st-txt">
        <span className="st-small">{href ? small : 'Bientôt disponible'}</span>
        <span className="st-big">{big}</span>
      </div>
    </>
  );
  if (!href) return <span className="store soon" aria-label={`${big} — bientôt disponible`}>{inner}</span>;
  return <a className="store" href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>{inner}</a>;
}

/* ---------- NAV ---------- */
function Nav() {
  return (
    <nav className="nav" id="nav">
      <div className="wrap nav-inner">
        <a className="nav-logo" href="#top">
          <img className="racket" src="/assets/auth/splash-racket.png" alt="" />
          <img className="wm" src="/assets/auth/splash-wordmark.png" alt="PAG MATCH" />
        </a>
        <div className="nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#how">Comment ça marche</a>
          <a href="#preview">Aperçu</a>
        </div>
        <a className="btn btn-brand" href="#download">Télécharger</a>
      </div>
    </nav>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  const trails = [
    { top: '18%', left: '60%', w: 220 },
    { top: '26%', left: '64%', w: 160 },
    { top: '70%', left: '6%', w: 180 },
    { top: '76%', left: '9%', w: 120 },
  ];
  return (
    <header className={`hero${HERO_BG_VIDEO ? ' hero-has-video' : ''}`} id="top">
      {HERO_BG_VIDEO && (
        <div className="hero-bg">
          <HeroVideo />
          <div className="hero-vid-overlay" />
        </div>
      )}
      <div className="hero-grain" />
      <div className="hero-trails">
        {trails.map((s, i) => <span key={i} style={{ top: s.top, left: s.left, width: s.w, transform: 'rotate(-18deg)' }} />)}
      </div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="pill"><span className="dot" /><span>La nouvelle ère du Padel</span></div>
          <h1 className="display">Le Padel.<br /><span className="y">Niveau Supérieur.</span></h1>
          <p className="lede">Trouvez des partenaires à votre niveau, enregistrez vos matchs et grimpez au classement de  la communauté PadelActiveGame.</p>
          <div className="hero-cta">
            <StoreBadges />
            <div className="hero-note"><span style={{ color: 'var(--brand)' }}>★★★★★</span> Rejoignez la communauté PadelActiveGame</div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="glow" />
          <div className="phone float phone-tilt" style={{ zIndex: 1 }}><div className="phone-screen"><HomeScreen /></div></div>
        </div>
      </div>
    </header>
  );
}

/* ---------- inline feature icons ---------- */
const Ic = {
  target: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" /><rect x="12" y="7" width="3" height="10" /><rect x="17" y="13" width="3" height="4" /></svg>,
  bolt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v4a6 6 0 0 1-12 0V4z" /><path d="M6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 18h6M10 18v3M14 18v3" /></svg>,
  chat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.3 7.3L4 21l1.7-5.7A8 8 0 1 1 21 12z" /></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0M17 5.5a3 3 0 0 1 0 5.8M21 20a6 6 0 0 0-4-5.6" /></svg>,
};

/* ---------- FEATURES ---------- */
function Features() {
  // 6 cartes identiques → grille 3×2 uniforme (aucune carte large).
  const items = [
    { ic: Ic.target, t: 'Partenaires à votre niveau', d: 'Un score de compatibilité analyse niveau, disponibilités et distance pour vous proposer les bons joueurs — pas les frustrants.' },
    { ic: Ic.chart, t: 'Classement du club', d: 'Chaque match compte et fait évoluer votre position dans le classement.' },
    { ic: Ic.bolt, t: 'Matchmaking instantané', d: 'Filtrez par niveau, créneau et distance. Trouvez votre 4ᵉ joueur en quelques secondes.' },
    { ic: Ic.trophy, t: 'Suivez votre progression', d: 'Visualisez votre évolution match après match et votre statut au sein de la communauté PAG.' },
    { ic: Ic.chat, t: 'Chat & organisation', d: 'Discutez avec votre partie, confirmez le créneau et la piste, gérez tout sans quitter l’app.' },
    { ic: Ic.users, t: 'Communauté de club', d: 'Amis, alertes de parties ouvertes et événements : la communauté, vivante, dans votre poche.' },
  ];
  return (
    <section className="features" id="features">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">Ce que vous obtenez</div>
          <h2 className="welcome">Tout pour <span className="y">mieux jouer</span></h2>
          <p>PAG MATCH connecte les joueurs de la communauté PadelActiveGame, fait correspondre les niveaux et tient le score à votre place.</p>
        </div>
        <div className="feat-grid">
          {items.map((it, i) => (
            <div className="feat-card reveal" key={i} style={{ transitionDelay: `${(i % 3) * 70}ms` }}>
              <div className="feat-ic">{it.ic}</div>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- HOW ---------- */
function How() {
  const steps = [
    { n: 1, t: 'Créez votre profil', d: 'Indiquez votre niveau de padel et votre club. On calibre votre niveau de départ.' },
    { n: 2, t: 'Trouvez votre match', d: 'Le matchmaking vous propose des partenaires compatibles. Réservez créneau et piste.' },
    { n: 3, t: 'Jouez & grimpez', d: 'Entrez le score après la partie. Votre classement se met à jour automatiquement.' },
  ];
  return (
    <section className="how" id="how">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">Comment ça marche</div>
          <h2 className="welcome">Du téléphone <span className="y">à la piste</span></h2>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="num display"><em>{String(s.n).padStart(2, '0')}</em></div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              <div className="bar" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- PREVIEW ---------- */
function Preview() {
  return (
    <section className="preview" id="preview">
      <div className="wrap">
        <div className="section-head center reveal">
          <div className="eyebrow">Aperçu de l’app</div>
          <h2 className="welcome">Pensée pour <span className="y">les joueurs</span></h2>
        </div>
        <div className="preview-rail">
          <div className="phone reveal"><div className="phone-screen"><RankScreen /></div></div>
          <div className="phone mid reveal" style={{ transitionDelay: '90ms' }}><div className="phone-screen"><MatchScreen /></div></div>
          <div className="phone reveal" style={{ transitionDelay: '180ms' }}><div className="phone-screen"><HomeScreen /></div></div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CtaBand() {
  return (
    <section className="cta-band" id="download">
      <div className="wrap cta-inner">
        <div className="pill reveal"><span className="dot" /><span>Gratuit · iOS &amp; Android</span></div>
        <h2 className="welcome reveal">Prêt à passer au <span className="y">niveau supérieur ?</span></h2>
        <p className="reveal">Téléchargez PAG MATCH, trouvez votre prochain match et faites grimper votre classement dès ce week-end.</p>
        <div className="reveal"><StoreBadges /></div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="footer-logo" href="#top">
              <img className="racket" src="/assets/auth/splash-racket.png" alt="" />
              <img className="wm" src="/assets/auth/splash-wordmark.png" alt="PAG MATCH" />
            </a>
            <p>L’app de matchmaking et de classement padel de votre club. By {LEGAL.brand.toUpperCase()}.</p>
          </div>
          <div className="foot-col">
            <h4>Produit</h4>
            <a href="#features">Fonctionnalités</a>
            <a href="#how">Comment ça marche</a>
            <a href="#preview">Aperçu de l’app</a>
            <a href="#download">Télécharger</a>
          </div>
          <div className="foot-col">
            <h4>Légal</h4>
            <Link href="/cgu">Conditions d’utilisation</Link>
            <Link href="/confidentialite">Politique de confidentialité</Link>
          </div>
          <div className="foot-col">
            <h4>Contact</h4>
            <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
            <a href={`mailto:${LEGAL.contactEmail}?subject=Support`}>Support</a>
            <a href={`mailto:${LEGAL.contactEmail}?subject=Club%20partenaire`}>Devenir club partenaire</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} PAG MATCH — by {LEGAL.brand.toUpperCase()}. Tous droits réservés.</p>
          <div className="socials">
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>
            <a href="#" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2 1.6 3.5 3.6 3.8v2.7c-1.3 0-2.6-.4-3.6-1.1v6.1a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.8 2.8 0 1 0 2 2.7V3H16z" /></svg></a>
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V7c0-1 .3-1.5 1.5-1.5H17V3h-2.4C12 3 11 4.5 11 6.7V9H9v3h2v9h3v-9h2.2l.4-3H14z" /></svg></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- PAGE ---------- */
export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Features />
      <How />
      <Preview />
      <CtaBand />
      <Footer />
    </>
  );
}
