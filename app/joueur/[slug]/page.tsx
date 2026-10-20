import type { Metadata } from 'next';
import Link from 'next/link';
import { chargerEditionMemo, jsonLd } from '@/lib/frmt/data';
import { dateFR, evolutionTexte, libellesVides, nombre } from '@/lib/frmt/fiche';
import type { FicheJoueur, JoueurMatch } from '@/lib/frmt/types';
import { AppelApp, EnteteFrmt, PiedFrmt } from '../../classement/CadreFrmt';
import Courbe from './Courbe';

export const dynamicParams = false;
// Export statique : une route dynamique doit produire au moins une page. Avant
// la première édition publiée, une page d'attente tient la place.
const ATTENTE = 'bientot';

async function donnees() {
  const e = await chargerEditionMemo();
  return { e, fiches: new Map((e?.fiches ?? []).map((f) => [f.slug, f])) };
}

export async function generateStaticParams() {
  const { e } = await donnees();
  const slugs = (e?.fiches ?? []).map((f) => ({ slug: f.slug }));
  return slugs.length ? slugs : [{ slug: ATTENTE }];
}

const titre = (nom: string) => nom.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
const GENRE = { hommes: 'Hommes', femmes: 'Femmes' } as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = (await donnees()).fiches.get(slug);
  if (!f) return { title: 'Classement FRMT padel | Pagmatch', robots: { index: false } };
  const nom = titre(f.nom);
  return {
    title: `${nom} — classement FRMT padel | Pagmatch`,
    description: `${nom}, ${f.rang}${f.rang === 1 ? 'er' : 'e'} du classement FRMT padel ${GENRE[f.genre].toLowerCase()} (${nombre(f.points)} points${f.club && f.club !== 'IND' ? `, ${f.club}` : ''}). Palmarès, tournois et matchs sur 12 mois.`,
    alternates: { canonical: './' },
  };
}

// Lien seulement si le scraper a relié ce partenaire/adversaire à UN classé
// qui a une fiche (ni retiré, ni homonyme ambigu).
function Joueur({ j }: { j: JoueurMatch }) {
  const t = `${titre(j.nom)} ${j.initiale}.`;
  return j.slug ? <Link href={`/joueur/${j.slug}/`}>{t}</Link> : <span>{t}</span>;
}

function Calcul({ f }: { f: FicheJoueur }) {
  const p = f.palmares;
  if (!p) return <section className="frmt-calc"><p>Palmarès détaillé bientôt disponible.</p></section>;
  const lignes: Array<[string, string]> = [
    ['Bonus départ / FIP', `${nombre(p.bonus.depart)} / ${nombre(p.bonus.fip)}`],
    ["Championnats d'Afrique / arabe", `${nombre(p.bonus.afrique)} / ${nombre(p.bonus.arabe)}`],
    ['Assimilation', `${p.assimilation.oui ? 'Oui' : 'Non'} · ${nombre(p.assimilation.points)}`],
    ['Total points 12 mois', nombre(p.totaux.total12Mois)],
    ['Total 12 meilleurs résultats', nombre(p.totaux.douzeMeilleurs)],
    ['Bonus + 12 meilleurs', nombre(p.totaux.bonusPlusDouze)],
  ];
  return (
    <section className="frmt-calc">
      {p.meilleur && <b>Meilleur classement : {p.meilleur.rang} ({nombre(p.meilleur.points)} pts, {dateFR(p.meilleur.date)})</b>}
      <dl>
        {lignes.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        <div className="fort"><dt>Points de classement</dt><dd>{nombre(p.totaux.pointsClassement)}</dd></div>
      </dl>
    </section>
  );
}

export default async function PageJoueur({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { e, fiches } = await donnees();
  const f = fiches.get(slug);

  if (!f) {
    return (
      <>
        <EnteteFrmt />
        <main className="frmt-wrap frmt-page"><h1 className="frmt-h1">Classement <span>FRMT</span> padel</h1><p className="frmt-maj">Les fiches des joueurs arrivent très bientôt.</p></main>
        <PiedFrmt />
      </>
    );
  }

  const vides = libellesVides(f);
  const evo = evolutionTexte(f.evolutionRang);
  const personne = {
    '@context': 'https://schema.org', '@type': 'Person', name: titre(f.nom), birthDate: String(f.annee),
    ...(f.club && f.club !== 'IND' ? { memberOf: { '@type': 'SportsOrganization', name: f.club } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personne) }} />
      <EnteteFrmt />
      <main className="frmt-wrap frmt-page">
        <Link className="frmt-retour" href={`/classement/${f.genre}/`}>← Classement {GENRE[f.genre]}</Link>

        <header className="frmt-hero">
          <div className="frmt-rkbig">#{f.rang}<small>Classement FRMT {GENRE[f.genre]}</small></div>
          <h1 className="frmt-name">{titre(f.nom)}</h1>
          <div className="frmt-chips">
            {f.club && <span className="frmt-chip">{f.club}</span>}
            <span className="frmt-chip">Né{f.genre === 'femmes' ? 'e' : ''} en {f.annee}</span>
            <span className="frmt-chip">{nombre(f.points)} pts</span>
            {evo && <span className={`frmt-chip ${f.evolutionRang! > 0 ? 'up' : 'dn'}`}>{evo} cette semaine</span>}
          </div>
        </header>

        <Calcul f={f} />

        <section className="frmt-sec">
          <h2>Historique des scores (12 mois)</h2>
          {vides.resultats ? <p className="frmt-vide">{vides.resultats}</p> : f.resultats.map((r, i) => (
            <div key={i} className={`frmt-row${r.compte ? ' ok' : ''}`}>
              <div className="t">{r.tournoi}<small>{dateFR(r.date)}{r.categorie ? ` · ${r.categorie}` : ''} · {r.compte ? 'compté' : 'non compté'}</small></div>
              <div className="p">{nombre(r.points)}</div>
            </div>
          ))}
        </section>

        <section className="frmt-sec">
          <h2>Matchs{f.bilan ? ` · ${f.bilan.gagnes} V – ${f.bilan.perdus} D` : ''}</h2>
          {vides.matchs ? <p className="frmt-vide">{vides.matchs}</p> : f.matchs.map((m, i) => (
            <div key={i} className="frmt-m">
              <div className="h">
                <span>{m.tournoi}{m.phase ? ` · ${m.phase}` : ''}{m.tour ? ` · ${m.tour}` : ''}</span>
                <span className={`res ${m.resultat === 'V' ? 'w' : 'lo'}`}>{m.resultat}</span>
              </div>
              <div className="l">
                {m.partenaire && <>avec <Joueur j={m.partenaire} /> </>}
                contre {m.adversaires.map((a, k) => <span key={k}>{k > 0 && ' / '}<Joueur j={a} /></span>)}
                {m.score && <> · {m.score}</>}
              </div>
            </div>
          ))}
        </section>

        <Courbe points={f.courbe} />

        <AppelApp titre="C'est toi ?" texte="Ton classement FRMT règle ton niveau sur Pagmatch dès l'inscription." />
      </main>
      <PiedFrmt />
    </>
  );
}
