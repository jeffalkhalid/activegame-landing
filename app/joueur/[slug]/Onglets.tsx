'use client';

import { useState } from 'react';

/**
 * Onglets de la fiche (Stats · Historique · Carte). Tous les panneaux restent
 * dans le HTML (masqués par `hidden`) : Google lit le contenu de chaque onglet.
 */
// Les panneaux sont passés en tableau, un par onglet : en enfants, React
// aplatissait les fragments (« Stats » en plusieurs sections) et décalait tout.
export default function Onglets({ titres, panneaux }: { titres: string[]; panneaux: React.ReactNode[] }) {
  const [actif, setActif] = useState(0);
  return (
    <>
      <div className="frmt-onglets" role="tablist">
        {titres.map((t, i) => (
          <button key={t} type="button" role="tab" aria-selected={i === actif}
            className={`frmt-onglet${i === actif ? ' on' : ''}`} onClick={() => setActif(i)}>
            {t}
          </button>
        ))}
      </div>
      {panneaux.map((p, i) => (
        <div key={i} role="tabpanel" hidden={i !== actif}>{p}</div>
      ))}
    </>
  );
}
