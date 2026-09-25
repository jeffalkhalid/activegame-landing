import Link from 'next/link';
import { LEGAL } from '@/lib/legal';
import HeroVideo from './HeroVideo';

/* ============================================================================
   Landing pagmatch.com — d'après design_handoff_pagmatch_landing.

   Les téléphones ne sont plus dessinés en CSS : chaque écran est un
   EMPLACEMENT D'IMAGE (`.phone-slot`) qui contient une seule <img> au ratio
   1290/2796. Remplacer une doublure par une vraie capture = changer le `src`,
   rien d'autre. Ne jamais redessiner un écran ici.

   Périmètre annoncé : ce que la V1 publiée sait faire. Pas de tournoi, pas de
   match en direct, pas de montre connectée — les promettre ferait télécharger
   des joueurs qui ne les trouveraient pas.
   ========================================================================= */

/* ---------- Badges stores (état « bientôt » tant que l'URL est vide) ------- */

const AppleGlyph = (
  <svg viewBox="0 0 24 24" fill="#0A0A0A" aria-hidden="true"><path d="M16.5 1.6c.1 1-.3 2-1 2.8-.7.8-1.8 1.4-2.8 1.3-.1-1 .4-2 1-2.7.7-.8 1.9-1.4 2.8-1.4zM20 17.2c-.5 1.2-.8 1.7-1.4 2.7-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.4.9-3.7.9c-1.6 0-2.8-1.6-3.7-2.9C1.2 16.4.9 11.8 2.5 9.4c1.1-1.7 2.9-2.7 4.5-2.7 1.7 0 2.7 1 4.1 1 1.3 0 2.1-1 4.1-1 1.5 0 3 .8 4.1 2.2-3.6 2-3 7.1.2 8.3z" /></svg>
);

const PlayGlyph = (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00D3FF" d="M3.7 2.3 13.8 12H3.7z" /><path fill="#00F076" d="M3.7 21.7 13.8 12H3.7z" /><path fill="#FF3945" d="M3.7 2.3 20 12h-6.2z" /><path fill="#FFCE00" d="M3.7 21.7 20 12h-6.2z" /></svg>
);

function StoreBadge({ href, small, big, glyph }: {
  href: string; small: string; big: string; glyph: React.ReactNode;
}) {
  // URL vide = app pas encore publiée : le badge existe, mais il n'est pas un
  // lien. Un <a href=""> rechargerait la page ; un <button> désactivé
  // ressemblerait à une panne.
  if (!href) {
    return (
      <span className="store soon" aria-label={`${big} — bientôt disponible`}>
        {glyph}
        <span className="st-txt">
          <span className="st-soon"><span className="st-dot" />Bientôt disponible</span>
          <span className="st-big">{big}</span>
        </span>
      </span>
    );
  }
  return (
    <a className="store" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${small} ${big}`}>
      {glyph}
      <span className="st-txt">
        <span className="st-small">{small}</span>
        <span className="st-big">{big}</span>
      </span>
    </a>
  );
}

function StoreBadges({ center = false }: { center?: boolean }) {
  return (
    <div className={`stores${center ? ' center' : ''}`}>
      <StoreBadge href={LEGAL.appStoreUrl} small="Télécharger sur" big="App Store" glyph={AppleGlyph} />
      <StoreBadge href={LEGAL.playStoreUrl} small="Disponible sur" big="Google Play" glyph={PlayGlyph} />
    </div>
  );
}

/* ---------- Le cadre de téléphone = un emplacement d'image ---------------- */

function Phone({ src, alt, size, anim, tabbar, className = '' }: {
  src: string;
  alt: string;
  /** Largeur du cadre. Les tailles vivent dans globals.css (.phone.w-238 …). */
  size: 'hero' | '238' | '262' | '232';
  /** Défilement de la capture longue (fil) ou passage des diapos (bilan). */
  anim?: 'feed' | 'story';
  /** Barre d'onglets figée par-dessus la capture qui défile. */
  tabbar?: boolean;
  className?: string;
}) {
  return (
    <div className={`phone w-${size} ${className}`}>
      <div className="phone-slot">
        <img src={src} alt={alt} className={anim ? `anim-${anim}` : undefined} />
        {tabbar && <img className="phone-tabbar" src="/screens/3b-tabbar.png" alt="" aria-hidden="true" />}
      </div>
    </div>
  );
}

/* ---------- Petits blocs de texte réutilisés ------------------------------ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

function Check() {
  return (
    <span className="check-ic" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L19 7" /></svg>
    </span>
  );
}

function Row({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="row-ic" aria-hidden="true">{icon}</span>
      <div>
        <div className="row-t">{title}</div>
        <div className="row-d">{children}</div>
      </div>
    </div>
  );
}

const Ic = {
  waitlist: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h10M4 18h7" /><path d="M17 15v6M14 18l3 3 3-3" /></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 6.2 2.6 8.4 2.9 8.7a.6.6 0 0 1-.4 1H3.5a.6.6 0 0 1-.4-1C3.4 16.4 6 14.2 6 8z" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>,
  chat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.3 7.3L4 21l1.7-5.7A8 8 0 1 1 21 12z" /></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9.5 14.5l5 5M14.5 14.5l-5 5" /></svg>,
  trend: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
  bars: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M8 17V11M13 17V7M18 17v-4" /></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
  follow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>,
};

/* ---------- NAV ----------------------------------------------------------- */

function Nav() {
  return (
    <nav className="nav" id="nav">
      <div className="wrap nav-inner">
        <a className="nav-logo" href="#top">
          <img className="racket" src="/assets/auth/splash-racket.png" alt="" />
          <img className="wm" src="/assets/auth/splash-wordmark.png" alt="PAG MATCH" />
        </a>
        <div className="nav-links">
          <a href="#orga">Fonctionnement</a>
          <a href="#profil">Ton profil</a>
          <a href="#defi">Le défi</a>
          <a href="#score">Le score</a>
          <a href="#how">Comment ça marche</a>
        </div>
        <a className="btn btn-brand" href="#download">Télécharger</a>
      </div>
    </nav>
  );
}

/* ---------- HERO ---------------------------------------------------------- */

function Hero() {
  const trails = [
    { top: '18%', left: '60%', w: 220 },
    { top: '26%', left: '64%', w: 160 },
    { top: '70%', left: '6%', w: 180 },
    { top: '76%', left: '9%', w: 120 },
  ];
  return (
    <header className="hero" id="top">
      <div className="hero-bg">
        <HeroVideo />
        <div className="hero-vid-overlay" />
      </div>
      <div className="hero-grain" />
      <div className="hero-trails">
        {trails.map((s, i) => (
          <span key={i} style={{ top: s.top, left: s.left, width: s.w, transform: 'rotate(-18deg)' }} />
        ))}
      </div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="pill">
            <span className="dot" />
            <span className="hero-pill-long">L&apos;app des joueurs de padel au Maroc</span>
            <span className="hero-pill-short">L&apos;app padel du Maroc</span>
          </div>
          <h1 className="display">Le Padel.<br /><span className="y">Niveau Supérieur.</span></h1>
          <p className="lede">
            Trouve des joueurs vraiment à ton niveau — calculé sur tes matchs, pas déclaré.
            <span className="lede-rest"> Crée ta partie, saisis ton score, regarde ton niveau bouger.</span>
          </p>
          <div className="hero-cta">
            <StoreBadges />
            <div className="hero-note">
              <span>Gratuit</span><span className="sep" /><span>iOS &amp; Android</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="glow" />
          <div className="hero-float">
            <Phone size="hero" src="/screens/hero-accueil.png" alt="Accueil PAG MATCH : prochain match et parties suggérées" />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- 01. FONCTIONNEMENT ------------------------------------------- */

function Orga() {
  return (
    <section className="sec" id="orga">
      <div className="wrap split">
        <div className="reveal">
          <Eyebrow>Fonctionnement · Trouver ton 4e joueur</Eyebrow>
          <h2 className="welcome">«&nbsp;Il me manque un <span className="y">quatrième joueur</span>&nbsp;»</h2>
          <p className="sec-lede">
            Tout le monde se dit « niveau 4 ». Ici, personne ne se déclare :{' '}
            <strong>ton niveau est calculé à partir de tes matchs.</strong> Les joueurs qu&apos;on te
            propose sont vraiment à ta portée — et on te dit à quel point on en est sûr.
          </p>
          <div className="checklist">
            <div className="check">
              <Check />
              <p>L&apos;accueil te propose des parties à <strong>ton niveau</strong> d&apos;abord, puis les plus proches, puis les plus urgentes, puis tes clubs favoris.</p>
            </div>
            <div className="check">
              <Check />
              <p>Filtre par niveau, créneau, distance ou club. Crée ta partie : date, heure, terrain, niveau visé, places, mixte ou pas.</p>
            </div>
            <div className="check">
              <Check />
              <p>Un joueur d&apos;un autre niveau veut entrer ? <strong>Les inscrits votent.</strong></p>
            </div>
          </div>
        </div>
        <div className="reveal phone-col" data-delay="90ms">
          <Phone size="238" src="/screens/1a-partie-ouverte.png" alt="Partie ouverte : niveau demandé et joueurs inscrits" />
        </div>
      </div>

      <div className="wrap"><div className="rule" /></div>

      <div className="wrap split rev">
        <div className="reveal phone-col notif-col">
          <div className="notif-glow" />
          <Phone size="262" src="/screens/2-discussion.png" alt="Discussion d’une partie" className="notif-phone" />
          <div className="notifs" aria-hidden="true">
            <div className="notif">
              <img src="/assets/favicon.png" alt="" />
              <div>
                <div className="notif-h"><span>Une place s&apos;est libérée</span><span className="notif-t">maintenant</span></div>
                <div className="notif-d">Tu passes de la liste d&apos;attente à la partie. Sam. 18:30 · Padel Casa.</div>
              </div>
            </div>
            <div className="notif shift">
              <img src="/assets/favicon.png" alt="" />
              <div>
                <div className="notif-h"><span>Terrain pas encore réservé</span><span className="notif-t">15:30</span></div>
                <div className="notif-d">Ta partie commence dans 3 h. Pense à réserver.</div>
              </div>
            </div>
            <div className="notif">
              <img src="/assets/favicon.png" alt="" />
              <div>
                <div className="notif-h"><span>Dans 30 minutes</span><span className="notif-t">18:00</span></div>
                <div className="notif-d">Tu joues au Padel Casa. Tes partenaires sont prévenus.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="reveal" data-delay="90ms">
          <Eyebrow>Fonctionnement · S&apos;organiser</Eyebrow>
          <h2 className="welcome">«&nbsp;On s&apos;organise dans un <span className="y">groupe WhatsApp</span>&nbsp;»</h2>
          <p className="sec-lede">
            Et à la fin, une place libre à 22 h la veille, un terrain que personne n&apos;a réservé,
            un joueur qui ne répond plus. L&apos;app s&apos;occupe de tout ça.
          </p>
          <div className="rows">
            <Row icon={Ic.waitlist} title="La liste d’attente se promeut toute seule">
              Quelqu&apos;un se désiste, le suivant entre. Personne n&apos;a à relancer.
            </Row>
            <Row icon={Ic.bell} title="Rappel 1 h, puis 30 min avant">
              Et 3 h avant si le terrain n&apos;est pas encore réservé.
            </Row>
            <Row icon={Ic.chat} title="Une discussion par partie">
              Plus des messages privés entre joueurs — tu acceptes avant, tu peux bloquer.
            </Row>
            <Row icon={Ic.calendar} title="Jamais deux parties en même temps">
              Impossible de t&apos;inscrire sur deux créneaux qui se chevauchent.
            </Row>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 02. TON PROFIL ------------------------------------------------ */

function Profil() {
  return (
    <section className="sec sec-alt" id="profil">
      <div className="wrap split">
        <div className="reveal">
          <Eyebrow>Ton profil</Eyebrow>
          <h2 className="welcome">«&nbsp;Il joue à quel niveau, <span className="y">lui&nbsp;?</span>&nbsp;»</h2>
          <p className="sec-lede">
            Chaque joueur a un profil public. Son niveau, sa fiabilité, son classement FRMT,
            ses résultats : tu sais avec qui tu joues avant d&apos;entrer sur la piste.
          </p>
          <div className="rows">
            <Row icon={Ic.trend} title="Ton niveau, ta ligue, ta courbe">
              De Découverte à Diamant. Ta courbe sur tes derniers résultats, et ce qu&apos;il te reste jusqu&apos;au palier suivant.
            </Row>
            <Row icon={Ic.bars} title="Tes stats">
              Victoires, série en cours, côté préféré, partenaire favori.
            </Row>
            <Row icon={Ic.trophy} title="Matchs, palmarès, badges, binômes">
              Tout ton historique en onglets. Et tes binômes : avec qui tu gagnes le plus.
            </Row>
            <Row icon={Ic.follow} title="Suivre, défier, écrire">
              Sur le profil d&apos;un joueur : tu le suis, tu le défies en 2 contre 2, ou tu lui écris.
            </Row>
          </div>
        </div>
        <div className="reveal phone-col" data-delay="90ms">
          <Phone size="238" src="/screens/1b-fiche-joueur.png" alt="Fiche joueur : niveau, fiabilité, classement FRMT" />
        </div>
      </div>

      <div className="wrap">
        <div className="cards3">
          <div className="feat-card reveal">
            <div className="card-k">Ton niveau</div>
            <div className="lvl-val"><span className="lvl-n">4.2</span><span className="lvl-max">/ 8</span></div>
            <div className="lvl-bar">
              <span className="lvl-fill" />
              <span className="lvl-knob" />
            </div>
            <div className="lvl-ticks">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => <span key={n}>{n}</span>)}
            </div>
            <h3>De 0 à 8, calculé</h3>
            <p>Chaque match fait bouger tes points. Tes points donnent ton niveau. Pas de case à cocher.</p>
          </div>

          <div className="feat-card reveal" data-delay="70ms">
            <div className="card-k">Indice de fiabilité</div>
            <div className="rel-bars" aria-hidden="true">
              {[30, 38, 46, 54, 62, 70, 78, 86, 93, 100].map((h, i) => (
                <span key={h} style={{ height: `${h}%` }} className={i < 6 ? 'on' : i === 6 ? 'half' : ''} />
              ))}
            </div>
            <div className="card-legend"><span>↑ tu joues</span><span>↓ tu t&apos;arrêtes</span></div>
            <h3>On te dit si c&apos;est sûr</h3>
            <p>L&apos;indice monte avec les matchs joués et redescend avec l&apos;inactivité. Un niveau, et à quel point t&apos;y fier.</p>
          </div>

          <div className="feat-card reveal" data-delay="140ms">
            <div className="card-k">Classement officiel</div>
            <div className="frmt-row">
              <span className="frmt-tag">FRMT</span>
              <svg className="frmt-link" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>
              <img src="/assets/auth/splash-racket.png" alt="" />
            </div>
            <div className="card-legend one">Rattaché automatiquement</div>
            <h3>Ton classement FRMT</h3>
            <p>Le classement de la Fédération Royale Marocaine de Tennis s&apos;affiche sur ton profil, sans rien saisir.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 03. LE DÉFI ---------------------------------------------------- */

function Defi() {
  // PAS d'écran dessiné ici. Trois écrans inventés y ont vécu quelques heures :
  // ils affichaient un parcours « étape 1/2/3 », un en-tête et des onglets qui
  // ne sont pas ceux du hub Défi. Le tableau ci-dessous est un graphique web :
  // il ne prétend pas montrer l'app, donc il ne peut pas mentir sur elle. Une
  // VRAIE capture du hub Défi prendra sa place le jour venu.
  return (
    <section className="sec sec-defi" id="defi">
      <div className="wrap split">
        <div className="reveal">
          <Eyebrow>Le défi</Eyebrow>
          <h2 className="welcome">«&nbsp;Allez, on vous prend <span className="y">quand vous voulez</span>&nbsp;»</h2>
          <p className="sec-lede">
            Cette phrase-là, tout le monde l&apos;a dite. Le défi, c&apos;est elle transformée en match :{' '}
            <strong>deux joueurs contre deux joueurs, et des points en jeu.</strong>
          </p>
          <div className="checklist">
            <div className="check">
              <Check />
              <p>Tu commences par <strong>choisir ton binôme.</strong> Un défi ne se relève jamais seul, et rien ne part tant que ton partenaire n&apos;a pas confirmé. En défi ciblé, tu désignes aussi les adversaires.</p>
            </div>
            <div className="check">
              <Check />
              <p><strong>L&apos;enjeu te dit si ça vaut le coup.</strong> Avant d&apos;accepter, tu vois ce que ce match précis te rapporte et ce qu&apos;il te coûte. Gagner contre plus faible que toi ne rapporte presque rien — c&apos;est ce qui pousse à jouer plus haut que sa zone de confort.</p>
            </div>
            <div className="check">
              <Check />
              <p><strong>La revanche est à un geste.</strong> Sous ta défaite, dans le fil, un bouton « Revanche&nbsp;? » qui ouvre le défi. Et à partir de trois duels contre le même joueur, l&apos;app tient votre face-à-face.</p>
            </div>
          </div>
        </div>

        <div className="reveal phone-col" data-delay="90ms">
          <Phone size="238" src="/screens/defi-hub.png" alt="Hub Défi : les défis à relever, avec l’enjeu de chacun" />
        </div>
      </div>

      {/* ... et la carte passe en bande pleine largeur, sous les deux colonnes :
          c'est elle qui porte l'enjeu et le face-a-face, elle a besoin de place. */}
      <div className="wrap">
        <div className="defi-card reveal">
            <div className="defi-orb" aria-hidden="true" />
            <div className="pill tight"><span>Ça compte pour de vrai</span></div>
            <div className="defi-board">
              <div className="team">
                <div className="team-av"><span className="av me">Y</span><span className="av">M</span></div>
                <div className="team-n">Toi + Mehdi</div>
                <div className="team-l">Niv. 4.20 · 4.30</div>
              </div>
              <div className="vs">VS</div>
              <div className="team">
                <div className="team-av"><span className="av">S</span><span className="av">K</span></div>
                <div className="team-n">Salma + Karim</div>
                <div className="team-l">Niv. 4.05 · 4.30</div>
              </div>
              <div className="stake">
                <span className="stake-k">Ce match te vaut</span>
                <span className="stake-lose">−0,05</span>
                <span className="stake-sep">/</span>
                <span className="stake-win">+0,07</span>
                <span className="stake-u">de niveau</span>
              </div>
            </div>
            {/* Le face-a-face : ce qui donne envie de la revanche. */}
            <div className="h2h">
              <div className="h2h-k">Votre face-à-face</div>
              <div className="h2h-s">3<span>–</span>2</div>
              <div className="h2h-hist" aria-hidden="true">
                <span className="w" /><span className="l" /><span className="w" /><span className="l" /><span className="w" />
              </div>
              <div className="h2h-n">5 duels depuis mars</div>
            </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 04. LE SCORE -------------------------------------------------- */

function Score() {
  return (
    <section className="sec" id="score">
      <div className="wrap">
        <div className="score-head reveal">
          <div>
            <Eyebrow>Le score</Eyebrow>
            <h2 className="welcome">«&nbsp;On a joué, <span className="y">et alors ?</span>&nbsp;»</h2>
          </div>
          <p className="sec-lede">
            Le score se perd dans le groupe, personne ne sait qui progresse. Ici, l&apos;adversaire
            valide, l&apos;enjeu est connu d&apos;avance, et chaque match alimente ton classement,
            ton palmarès, tes badges et ton bilan du mois.
          </p>
        </div>

        <div className="rail">
          <div className="rail-item reveal">
            <Phone size="232" src="/screens/3a-valider-score.png" alt="Scores à valider : valider ou contester" />
            <h3>Validé par l&apos;adversaire</h3>
            <p>Il valide, ou conteste en donnant son motif. Pas de réponse ? Validé tout seul au bout de 24 h.</p>
          </div>
          <div className="rail-item reveal" data-delay="90ms">
            <Phone size="232" src="/screens/3b-fil.png" alt="Fil d’activité : match, commentaire, pronostic" anim="feed" tabbar />
            <h3>Le fil d&apos;activité</h3>
            <p>Les matchs des autres. Tu commentes, tu pronostiques avant, tu vois le verdict après. Et ton match part en story.</p>
          </div>
          <div className="rail-item reveal" data-delay="180ms">
            <Phone size="232" src="/screens/3c-bilan.png" alt="Bilan mensuel" anim="story" />
            <h3>Ton mois, en rétro</h3>
            <p>Chaque mois, ton bilan façon fin d&apos;année. Sur ton profil : palmarès, badges, stats et ta progression.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 04. COMMENT ÇA MARCHE ---------------------------------------- */

function How() {
  const steps = [
    { n: '01', t: 'Crée ton profil', d: 'Donne ton niveau de départ et tes clubs. Tes premiers matchs te calibrent.' },
    { n: '02', t: 'Trouve ta partie', d: 'Rejoins une partie à ton niveau près de chez toi, ou crée la tienne et invite qui tu veux.' },
    { n: '03', t: 'Joue, saisis le score', d: 'L’adversaire valide, ton niveau bouge. C’est tout.' },
  ];
  return (
    <section className="sec how" id="how">
      <div className="wrap">
        <div className="section-head reveal">
          <Eyebrow>Comment ça marche</Eyebrow>
          <h2 className="welcome">Du téléphone <span className="y">à la piste</span></h2>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step reveal" key={s.n} data-delay={`${i * 90}ms`}>
              <div className="step-n"><span className="num">{s.n}</span><span className="step-rule" /></div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 05. PREUVES --------------------------------------------------- */

function Proofs() {
  return (
    <section className="proofs">
      <div className="wrap proofs-grid reveal">
        <div className="proof">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 4h12v4a6 6 0 0 1-12 0V4z" /><path d="M6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 18h6M10 14v4M14 14v4" /></svg>
          <div>
            <div className="proof-t">Classement officiel FRMT</div>
            <div className="proof-d">Rattaché aux profils des joueurs.</div>
          </div>
        </div>
        <div className="proof bordered">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>
          <div>
            <div className="proof-t">Données hébergées dans l&apos;UE</div>
            <div className="proof-d proof-links">
              <Link href="/cgu">CGU</Link>
              <Link href="/confidentialite">Confidentialité</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 06. APPEL FINAL ----------------------------------------------- */

function CtaBand() {
  return (
    <section className="cta-band" id="download">
      <div className="cta-trails" aria-hidden="true">
        <span style={{ top: '28%', left: '8%', width: 200, transform: 'rotate(-18deg)' }} />
        <span style={{ top: '62%', left: '74%', width: 170, transform: 'rotate(-18deg)' }} />
      </div>
      <div className="wrap cta-inner reveal">
        <div className="pill"><span className="dot" /><span>Gratuit · iOS &amp; Android</span></div>
        <h2 className="welcome">Ton 4<sup>e</sup> joueur <span className="y">est dans l&apos;app.</span></h2>
        <p>Télécharge PAG MATCH, trouve ta partie et fais bouger ton niveau dès ce week-end.</p>
        <StoreBadges center />
      </div>
    </section>
  );
}

/* ---------- PIED DE PAGE -------------------------------------------------- */

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
            <p>L&apos;app des joueurs de padel au Maroc. By {LEGAL.brand.toUpperCase().replace(/\s/g, '')}.</p>
          </div>
          <div className="foot-col">
            <h4>Produit</h4>
            <a href="#orga">Fonctionnement</a>
            <a href="#profil">Ton profil</a>
            <a href="#defi">Le défi</a>
            <a href="#score">Le score</a>
            <a href="#how">Comment ça marche</a>
            <a href="#download">Télécharger</a>
          </div>
          <div className="foot-col">
            <h4>Légal</h4>
            <Link href="/cgu">Conditions d&apos;utilisation</Link>
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
          <p>© {new Date().getFullYear()} PAG MATCH — by {LEGAL.brand.toUpperCase().replace(/\s/g, '')}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- PAGE ---------------------------------------------------------- */

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Orga />
      <Profil />
      <Defi />
      <Score />
      <How />
      <Proofs />
      <CtaBand />
      <Footer />
    </>
  );
}
