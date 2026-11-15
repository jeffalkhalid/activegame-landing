import type { Metadata } from 'next';
import Link from 'next/link';
import { chargerEditionMemo, jsonLd } from '@/lib/frmt/data';
import { dateFR, evolutionTexte, nombre } from '@/lib/frmt/fiche';
import { bilan12Mois, indicateurs, moisClassement, topPourcent } from '@/lib/frmt/stats';
import { frise, libelleTour, partenaires, titresTotal } from '@/lib/frmt/unepage';
import type { FicheJoueur, JoueurMatch, ResultatFiche } from '@/lib/frmt/types';
import { AppelApp, EnteteFrmt, PiedFrmt } from '../../classement/CadreFrmt';
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
const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = (await donnees()).fiches.get(slug);
  if (!f) return { title: 'Classement FRMT padel | Pagmatch', robots: { index: false } };
  const nom = titre(f.nom);
  return {
    title: `${nom} — classement FRMT padel | Pagmatch`,
    description: `${nom}, ${f.rang}${f.rang === 1 ? 'er' : 'e'} du classement FRMT padel ${GENRE[f.genre].toLowerCase()} (${nombre(f.points)} points${f.club && f.club !== 'IND' ? `, ${f.club}` : ''}). Tournois, titres, partenaires et matchs sur 12 mois.`,
    alternates: { canonical: './' },
  };
}

// Lien seulement si le scraper a relié ce partenaire/adversaire à UN classé
// qui a une fiche (ni retiré, ni homonyme ambigu).
function Joueur({ j }: { j: Pick<JoueurMatch, 'nom' | 'initiale' | 'slug'> }) {
  const t = `${titre(j.nom)} ${j.initiale}.`;
  return j.slug ? <Link href={`/joueur/${j.slug}/`}>{t}</Link> : <span>{t}</span>;
}

/** « BOUNUS FIP » (orthographe FRMT) → « Bonus FIP » ; les tournois gardent leur nom officiel. */
const nomResultat = (r: ResultatFiche) => (r.categorie ? r.tournoi : /FIP/i.test(r.tournoi) ? 'Bonus FIP' : titre(r.tournoi));
const moisCourt = (mois: string) => new Date(`${mois}-15T12:00:00Z`).toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' });

function Saison({ f, date }: { f: FicheJoueur; date: string }) {
  const bilan = bilan12Mois(f.matchs, date);
  const { tournois, victoires } = indicateurs(f.resultats, bilan);
  const titres = titresTotal(f.resultats);
  const il = f.genre === 'femmes' ? 'Elle' : 'Il';
  return (
    <section id="saison" className="fp-sec">
      <div className="fp-etiq">Sur 12 mois</div>
      <h2>Sa saison</h2>
      <div className="fp-bloc">
        <p className="fp-phrase">
          {tournois ? <><b>{pluriel(tournois, 'tournoi')}</b>{titres ? <>, dont <b>{titres} gagné{titres > 1 ? 's' : ''}</b></> : null}. </> : null}
          {bilan ? <>{il} gagne <b>{victoires} %</b> de ses matchs.</> : null}
          {!tournois && !bilan ? 'Aucun tournoi ni match sur 12 mois.' : null}
        </p>
        <div className="fp-trio">
          <div><b>{titres}</b><span>{titres > 1 ? 'TITRES' : 'TITRE'}</span></div>
          {bilan ? (
            <>
              <div><b>{bilan.gagnes}</b><span>VICTOIRES</span></div>
              <div><b>{bilan.perdus}</b><span>DÉFAITES</span></div>
            </>
          ) : <div><b>{tournois}</b><span>TOURNOIS</span></div>}
        </div>
        {bilan && bilan.joues > 0 && (
          <div className="fp-vd" aria-hidden="true"><i style={{ width: `${(bilan.gagnes / bilan.joues) * 100}%` }} /><i style={{ width: `${(bilan.perdus / bilan.joues) * 100}%` }} /></div>
        )}
      </div>
    </section>
  );
}

function Annee({ f, date }: { f: FicheJoueur; date: string }) {
  const mois = frise(f.resultats, date);
  return (
    <section id="annee" className="fp-sec">
      <div className="fp-etiq">Du plus récent au plus ancien</div>
      <h2>Son année, mois par mois</h2>
      <div className="fp-bloc">
        <div className="fp-frise">
          {mois.map((m) => (
            <div key={m.mois} className={`fp-mois${m.resultats.length ? '' : ' vide'}`}>
              <div className="fp-m">{moisCourt(m.mois)}<small>{m.mois.slice(0, 4)}</small></div>
              <div className="fp-pt"><i /></div>
              <div className="fp-tx">
                {m.resultats.length ? m.resultats.map((r, i) => (
                  <div key={i} className={`fp-tn${r.compte ? '' : ' non'}`}>
                    <div className="nm">
                      {nomResultat(r)}{r.titre && <span className="fp-titre">TITRE</span>}
                      <small>{[r.categorie, dateFR(r.date).slice(0, 5), r.compte ? null : 'ne compte pas'].filter(Boolean).join(' · ')}</small>
                    </div>
                    <div className="p">{nombre(r.points)}</div>
                  </div>
                )) : 'Pas de tournoi'}
              </div>
            </div>
          ))}
        </div>
        <p className="fp-legende">En gris : les tournois qui ne comptent pas au classement (seuls les meilleurs résultats sont retenus).</p>
      </div>
    </section>
  );
}

function Partenaires({ f }: { f: FicheJoueur }) {
  const liste = partenaires(f.matchs);
  if (!liste.length) return null;
  return (
    <section id="partenaires" className="fp-sec">
      <div className="fp-etiq">Sur tous ses matchs FRMT</div>
      <h2>Ses partenaires</h2>
      <div className="fp-bloc">
        {liste.map((p) => (
          <div key={`${p.nom}|${p.initiale}`} className="fp-part">
            <div className="fp-ini">{p.initiale}{p.nom.charAt(0)}</div>
            <div className="c">
              <b><Joueur j={p} /></b>
              <span>{p.joues} matchs ensemble · {pluriel(p.gagnes, 'victoire')}</span>
              <div className="fp-jauge"><i style={{ width: `${p.pct}%` }} /></div>
            </div>
            <div className="pc">{p.pct} %</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LigneMatch({ m }: { m: FicheJoueur['matchs'][number] }) {
  const tour = libelleTour(m.tour);
  return (
    <div className="fp-match">
      <div className={`fp-res${m.resultat === 'V' ? '' : ' d'}`}>{m.resultat}</div>
      <div className="c">
        <div className="t">{[m.tournoi, tour].filter(Boolean).join(' · ')}</div>
        <div className="o">
          {m.partenaire && <>avec <Joueur j={m.partenaire} /><br /></>}
          <small>contre</small> {m.adversaires.map((a, k) => <span key={k}>{k > 0 && ' / '}<Joueur j={a} /></span>)}
        </div>
      </div>
      {m.score && <div className="s">{m.score}</div>}
    </div>
  );
}

function Matchs({ f }: { f: FicheJoueur }) {
  const premiers = f.matchs.slice(0, 5), suite = f.matchs.slice(5);
  return (
    <section id="matchs" className="fp-sec">
      <div className="fp-etiq">{f.bilan ? `${pluriel(f.bilan.gagnes, 'victoire')} – ${pluriel(f.bilan.perdus, 'défaite')} au total` : 'Matchs FRMT'}</div>
      <h2>Ses derniers matchs</h2>
      <div className="fp-bloc">
        {premiers.length ? premiers.map((m, i) => <LigneMatch key={i} m={m} />) : <p className="fp-vide">Aucun match FRMT.</p>}
        {/* Tous les matchs restent dans la page (lus par Google), repliés. */}
        {suite.length > 0 && (
          <details className="fp-suite">
            <summary>Voir ses {f.matchs.length} matchs</summary>
            {suite.map((m, i) => <LigneMatch key={i} m={m} />)}
          </details>
        )}
      </div>
    </section>
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
  const date = e.edition.date;
  const bilanCarte = bilan12Mois(f.matchs, date);
  const effectif = e.classements[f.genre].length;
  const top = topPourcent(f.rang, effectif);
  const mois = moisClassement(date);
  const { tournois } = indicateurs(f.resultats, bilanCarte);
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

        {/* En-tête noir, dans l'esprit de la story « Carte Noire » de l'app. */}
        <header className="fp-heros">
          <span className="fp-pastille">● CLASSEMENT FRMT · {GENRE[f.genre].toUpperCase()}</span>
          <h1>{titre(f.nom)}</h1>
          <div className="fp-ligne-rang">
            <div className="fp-rang"><small>N°</small>{f.rang}</div>
            <div className="d"><b>{nombre(f.points)} points</b><span>Top {top} % · {mois}{evo && <em className={f.evolutionRang! > 0 ? 'up' : 'dn'}> · {evo}</em>}</span></div>
          </div>
          <div className="fp-puces">
            {f.club && <span>{f.club}</span>}
            <span>Né{f.genre === 'femmes' ? 'e' : ''} en {f.annee}</span>
            {tournois > 0 && <span>{pluriel(tournois, 'tournoi')} en 12 mois</span>}
          </div>
          <a className="fp-btn-carte" href="#carte">Partager sa carte</a>
        </header>

        <nav className="fp-sommaire" aria-label="Sommaire de la fiche">
          <a href="#saison">Sa saison</a><a href="#annee">Mois par mois</a>
          {partenaires(f.matchs).length > 0 && <a href="#partenaires">Partenaires</a>}
          <a href="#matchs">Matchs</a><a href="#carte">Carte</a>
        </nav>

        <Saison f={f} date={date} />
        <Annee f={f} date={date} />
        <Partenaires f={f} />
        <Matchs f={f} />

        <section id="carte" className="fp-sec">
          <div className="fp-etiq">À partager</div>
          <h2>Sa carte</h2>
          <CartePartage d={{
            nom: titre(f.nom), genre: GENRE[f.genre], rang: f.rang, top, mois,
            points: nombre(f.points), bilan: bilanCarte ? { gagnes: bilanCarte.gagnes, perdus: bilanCarte.perdus } : null, club: f.club, annee: f.annee,
            url: `https://www.pagmatch.com/joueur/${f.slug}/`,
          }} />
        </section>

        <AppelApp titre="C'est toi ?" texte="Ton classement FRMT règle ton niveau sur Pagmatch dès l'inscription." />
      </main>
      <PiedFrmt />
    </>
  );
}
