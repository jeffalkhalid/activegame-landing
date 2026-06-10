import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

export function LegalHero({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <header className="legal-hero">
      <div className="container">
        <Link href="/" className="legal-back">← Retour à l’accueil</Link>
        <div className="legal-kicker">{kicker}</div>
        <h1>{title}</h1>
        <p className="sub">{sub}</p>
        <div className="updated-badge"><span className="dot" /> À jour le {LEGAL.lastUpdate}</div>
      </div>
    </header>
  );
}

export function Tldr({ points }: { points: string[] }) {
  return (
    <div className="tldr">
      <h3>En bref</h3>
      <ul>{points.map((p, i) => <li key={i}>{p}</li>)}</ul>
    </div>
  );
}

export function Section({ n, icon, title, children }: {
  n: number; icon: string; title: string; children: React.ReactNode;
}) {
  return (
    <section className="lsec">
      <div className="lsec-head">
        <span className="lnum">{icon}</span>
        <h2>{n}. {title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Sub({ logo, color, name, role }: { logo: string; color: string; name: string; role: string }) {
  return (
    <div className="sub">
      <span className="sub-logo" style={{ background: color + '22', color, border: `1px solid ${color}55` }}>{logo}</span>
      <div><b>{name}</b><span>{role}</span></div>
    </div>
  );
}

export function Callout({ icon, warn, children }: { icon: string; warn?: boolean; children: React.ReactNode }) {
  return (
    <div className={`callout${warn ? ' warn' : ''}`}>
      <span className="ci">{icon}</span>
      <p>{children}</p>
    </div>
  );
}
