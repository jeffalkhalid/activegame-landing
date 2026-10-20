'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

/** Entrée compacte de l'index (une par classé), livrée avec la page. */
export interface EntreeIndex { r: number; n: string; c: string | null; a: number | null; p: number; s: string | null; er: number | null; ep: number | null }

const PAS = 100;
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const FMT = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

function Carte({ j }: { j: EntreeIndex }) {
  const corps = (
    <>
      <div className="frmt-rk">{j.r}</div>
      <div className="frmt-mid">
        <b>{j.n}</b>
        <div className="frmt-chips">
          {j.c && <span className="frmt-chip">{j.c}</span>}
          {j.a && <span className="frmt-chip">{j.a}</span>}
          {j.er ? <span className={`frmt-chip ${j.er > 0 ? 'up' : 'dn'}`}>{j.er > 0 ? `▲${j.er}` : `▼${-j.er}`}</span> : null}
        </div>
      </div>
      <div className="frmt-pts">
        {FMT.format(j.p)}
        {j.ep ? <small className={j.ep > 0 ? 'up' : 'dn'}>{j.ep > 0 ? '+' : '−'}{FMT.format(Math.abs(j.ep))}</small> : null}
      </div>
    </>
  );
  const cls = `frmt-card${j.r <= 3 ? ' podium' : ''}`;
  return j.s
    ? <Link className={cls} href={`/joueur/${j.s}/`}>{corps}</Link>
    : <div className={`${cls} sans-lien`}>{corps}</div>;
}

export default function RechercheJoueurs({ joueurs, appel }: { joueurs: EntreeIndex[]; appel: React.ReactNode }) {
  const [q, setQ] = useState('');
  const [n, setN] = useState(PAS);
  const filtres = useMemo(() => {
    const t = norm(q.trim());
    return t ? joueurs.filter((j) => norm(`${j.n} ${j.c ?? ''}`).includes(t)) : joueurs;
  }, [q, joueurs]);
  const vus = filtres.slice(0, n);

  return (
    <>
      <input
        className="frmt-search" type="search" value={q} placeholder="Rechercher un joueur, un club…"
        aria-label="Rechercher un joueur ou un club"
        onChange={(e) => { setQ(e.target.value); setN(PAS); }}
      />
      {q && <p className="frmt-nb">{filtres.length} résultat{filtres.length > 1 ? 's' : ''}</p>}
      <div className="frmt-liste">
        {vus.map((j, i) => (
          <div key={`${j.r}-${j.n}-${i}`}>
            <Carte j={j} />
            {!q && i === 9 && appel}
          </div>
        ))}
      </div>
      {filtres.length > n && (
        <button className="frmt-plus" type="button" onClick={() => setN(n + PAS)}>
          Voir les {Math.min(PAS, filtres.length - n)} suivants
        </button>
      )}
    </>
  );
}
