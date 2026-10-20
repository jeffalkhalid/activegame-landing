import type { Metadata } from 'next';
import Link from 'next/link';
import { chargerEditionMemo } from '@/lib/frmt/data';
import type { Genre } from '@/lib/frmt/types';
import RechercheJoueurs, { type EntreeIndex } from '../RechercheJoueurs';
import { AppelApp, EnteteFrmt, PiedFrmt } from '../CadreFrmt';

export const dynamicParams = false;
const GENRES: Genre[] = ['hommes', 'femmes'];
const LIBELLE: Record<Genre, string> = { hommes: 'Hommes', femmes: 'Femmes' };

export function generateStaticParams() {
  return GENRES.map((genre) => ({ genre }));
}

export async function generateMetadata({ params }: { params: Promise<{ genre: Genre }> }): Promise<Metadata> {
  const { genre } = await params;
  return {
    title: `Classement FRMT padel ${LIBELLE[genre]} — Maroc | Pagmatch`,
    description: `Le classement officiel FRMT de padel ${LIBELLE[genre].toLowerCase()} au Maroc, mis à jour chaque semaine : rang, points, club et palmarès de chaque joueur.`,
    alternates: { canonical: './' },
  };
}

const dateLongue = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Casablanca' });

export default async function PageClassement({ params }: { params: Promise<{ genre: Genre }> }) {
  const { genre } = await params;
  const e = await chargerEditionMemo();
  const liste = e?.classements[genre] ?? [];
  const index: EntreeIndex[] = liste.map((j) => ({ r: j.rang, n: j.nom, c: j.club, a: j.annee, p: j.points, s: j.slug, er: j.evolutionRang, ep: j.evolutionPoints }));

  return (
    <>
      <EnteteFrmt />
      <main className="frmt-wrap frmt-page">
        <h1 className="frmt-h1">Classement <span>FRMT</span> padel</h1>
        <p className="frmt-maj">{e ? `Mis à jour le ${dateLongue(e.edition.date)} · source FRMT` : 'Le classement arrive très bientôt.'}</p>
        <div className="frmt-tabs">
          {GENRES.map((g) => (
            <Link key={g} className={`frmt-tab${g === genre ? ' on' : ''}`} href={`/classement/${g}/`}>
              {LIBELLE[g]}{e ? ` · ${e.classements[g].length.toLocaleString('fr-FR')}` : ''}
            </Link>
          ))}
        </div>
        <RechercheJoueurs
          joueurs={index}
          appel={<AppelApp titre="Tu es classé FRMT ?" texte="Sur Pagmatch, ton classement règle ton niveau dès l'inscription." />}
        />
        {liste.length < 10 && <AppelApp titre="Tu es classé FRMT ?" texte="Sur Pagmatch, ton classement règle ton niveau dès l'inscription." />}
      </main>
      <PiedFrmt />
    </>
  );
}
