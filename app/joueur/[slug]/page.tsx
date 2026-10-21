import type { Metadata } from 'next';
import Link from 'next/link';
import { chargerEditionMemo, jsonLd } from '@/lib/frmt/data';
import { dateFR, evolutionTexte, libellesVides, nombre } from '@/lib/frmt/fiche';
import { bilan12Mois, indicateurs, moisClassement, palmares, parCategorie, pointsParMois, topPourcent } from '@/lib/frmt/stats';
import type { FicheJoueur, JoueurMatch } from '@/lib/frmt/types';
import { AppelApp, EnteteFrmt, PiedFrmt } from '../../classement/CadreFrmt';
import Courbe from './Courbe';
import Onglets from './Onglets';
import CartePartage from './CartePartage';

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

const Coupe = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
  </svg>
);

const MOIS_COURT = (m: string) => `${m.slice(5, 7)}/${m.slice(2, 4)}`;
const TEINTES = ['var(--brand)', '#FFE08A', '#E8A906', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.25)'];

function Stats({ f, date }: { f: FicheJoueur; date: string }) {
  const bilan = bilan12Mois(f.matchs, date);
  const ind = indicateurs(f.resultats, bilan);
  const titres = palmares(f.resultats);
  const mois = pointsParMois(f.resultats, date);
  const maxMois = Math.max(1, ...mois.map((m) => m.comptes + m.nonComptes));
  const cats = parCategorie(f.resultats);
  const totalCats = cats.reduce((s, c) => s + c.points, 0) || 1;
  const tuiles: Array<[string, string]> = [
    ['Tournois (12 mois)', String(ind.tournois)],
    ['Moyenne par tournoi', ind.moyenne != null ? `${nombre(ind.moyenne)} pts` : '—'],
    ['Meilleur résultat', ind.meilleur != null ? `${nombre(ind.meilleur)} pts` : '—'],
    ['Victoires', ind.victoires != null ? `${ind.victoires} %` : '—'],
  ];
  return (
    <>
      <section className="frmt-sec">
        <h2>Indicateurs clés</h2>
        <div className="frmt-kpis">
          {tuiles.map(([k, v]) => <div key={k} className="frmt-kpi"><span>{k}</span><b>{v}</b></div>)}
        </div>
        {bilan && <p className="frmt-nb">{bilan.gagnes} victoire{bilan.gagnes > 1 ? 's' : ''}, {bilan.perdus} défaite{bilan.perdus > 1 ? 's' : ''} sur 12 mois.</p>}
      </section>

      {titres.length > 0 && (
        <section className="frmt-sec">
          <h2>Palmarès</h2>
          <div className="frmt-palmares">
            {titres.map((t) => (
              <div key={t.categorie} className="frmt-palm-ligne">
                <span className="frmt-palm-cat">{t.categorie}</span>
                <span className="frmt-palm-coupes" aria-label={`${t.titres} titre${t.titres > 1 ? 's' : ''}`}>
                  {Array.from({ length: t.titres }, (_, i) => <Coupe key={i} />)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="frmt-sec">
        <h2>Points par mois</h2>
        <div className="frmt-mois">
          {mois.map((m) => (
            <div key={m.mois} className="frmt-mois-ligne">
              <span className="frmt-mois-l">{MOIS_COURT(m.mois)}</span>
              <span className="frmt-barre">
                <i className="ok" style={{ width: `${(m.comptes / maxMois) * 100}%` }} />
                <i className="non" style={{ width: `${(m.nonComptes / maxMois) * 100}%` }} />
              </span>
              <span className="frmt-mois-v">{nombre(m.comptes + m.nonComptes)} pts</span>
            </div>
          ))}
        </div>
        <p className="frmt-legende"><i className="ok" /> compte au classement <i className="non" /> ne compte pas</p>
      </section>

      {cats.length > 0 && (
        <section className="frmt-sec">
          <h2>Répartition par catégorie</h2>
          <div className="frmt-repart">
            {cats.map((c, i) => <i key={c.categorie} style={{ width: `${(c.points / totalCats) * 100}%`, background: TEINTES[i % TEINTES.length] }} />)}
          </div>
          <div className="frmt-repart-l">
            {cats.map((c, i) => <span key={c.categorie}><i style={{ background: TEINTES[i % TEINTES.length] }} />{c.categorie} : {nombre(c.points)} pts</span>)}
          </div>
        </section>
      )}
    </>
  );
}

function Historique({ f }: { f: FicheJoueur }) {
  const vides = libellesVides(f);
  return (
    <>
      <Courbe points={f.courbe} />
      <section className="frmt-sec">
        <h2>Tournois (12 mois)</h2>
        {vides.resultats ? <p className="frmt-vide">{vides.resultats}</p> : f.resultats.map((r, i) => (
          <div key={i} className={`frmt-row${r.compte ? ' ok' : ''}`}>
            <div className="t">{r.tournoi}<small>{dateFR(r.date)}{r.categorie ? ` · ${r.categorie}` : ''} · {r.compte ? 'compté' : 'non compté'}</small></div>
            <div className="p">{nombre(r.points)}</div>
          </div>
        ))}
      </section>
      <section className="frmt-sec">
        <h2>Tous ses matchs FRMT{f.bilan ? ` · ${f.bilan.gagnes} V – ${f.bilan.perdus} D` : ''}</h2>
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
    </>
  );
}

export default async function PageJoueur({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { e, fiches } = await donnees();
  const f = fiches.get(slug);

  if (!f || !e) {
    return (
      <>
        <EnteteFrmt />
        <main className="frmt-wrap frmt-page"><h1 className="frmt-h1">Classement <span>FRMT</span> padel</h1><p className="frmt-maj">Les fiches des joueurs arrivent très bientôt.</p></main>
        <PiedFrmt />
      </>
    );
  }

  const evo = evolutionTexte(f.evolutionRang);
  const bilanCarte = bilan12Mois(f.matchs, e.edition.date);
  const effectif = e.classements[f.genre].length;
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
            <span className="frmt-chip">Top {topPourcent(f.rang, effectif)} %</span>
            {evo && <span className={`frmt-chip ${f.evolutionRang! > 0 ? 'up' : 'dn'}`}>{evo}</span>}
          </div>
        </header>

        <Onglets titres={['Stats', 'Historique', 'Carte']} panneaux={[
          <Stats key="stats" f={f} date={e.edition.date} />,
          <Historique key="historique" f={f} />,
          <CartePartage key="carte" d={{
            nom: titre(f.nom), genre: GENRE[f.genre], rang: f.rang, top: topPourcent(f.rang, effectif), mois: moisClassement(e.edition.date),
            points: nombre(f.points), bilan: bilanCarte ? { gagnes: bilanCarte.gagnes, perdus: bilanCarte.perdus } : null, club: f.club, annee: f.annee,
            url: `https://www.pagmatch.com/joueur/${f.slug}/`,
          }} />,
        ]} />

        <AppelApp titre="C'est toi ?" texte="Ton classement FRMT règle ton niveau sur Pagmatch dès l'inscription." />
      </main>
      <PiedFrmt />
    </>
  );
}
