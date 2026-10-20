import type { MetadataRoute } from 'next';
import { chargerEdition } from '@/lib/frmt/data';

// Généré au build (export statique) : remplace l'ancien public/sitemap.xml.
// Contient chaque fiche joueur publiée — c'est la porte d'entrée Google des
// pages du classement FRMT. Les joueurs exclus ou ambigus n'ont pas de fiche,
// donc pas d'entrée.
export const dynamic = 'force-static';

const BASE = 'https://www.pagmatch.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const e = await chargerEdition();
  const maj = e ? new Date(e.edition.date) : undefined;
  return [
    { url: `${BASE}/` },
    { url: `${BASE}/cgu/` },
    { url: `${BASE}/confidentialite/` },
    { url: `${BASE}/classement/hommes/`, lastModified: maj, changeFrequency: 'weekly' },
    { url: `${BASE}/classement/femmes/`, lastModified: maj, changeFrequency: 'weekly' },
    ...(e?.fiches ?? []).map((f) => ({ url: `${BASE}/joueur/${f.slug}/`, lastModified: maj, changeFrequency: 'weekly' as const })),
  ];
}
