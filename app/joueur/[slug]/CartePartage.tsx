'use client';

import { useEffect, useRef, useState } from 'react';
import { CARTE_MARGE, colonnesCarte } from '@/lib/frmt/carte';

export interface DonneesCarte {
  nom: string; genre: 'Hommes' | 'Femmes'; rang: number; top: number; mois: string;
  points: string; bilan: { gagnes: number; perdus: number } | null; club: string | null; annee: number; url: string;
}

const L = 1080, H = 1350; // 4:5, bien reçu partout (stories, WhatsApp, fil Instagram)
const JAUNE = '#FFC11A', NOIR = '#0A0A0A';
const BLANC_40 = 'rgba(255,255,255,0.40)', BLANC_13 = 'rgba(255,255,255,0.13)';
const M = CARTE_MARGE, UTILE = L - 2 * CARTE_MARGE;

function image(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
}

function rectArrondi(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/** Texte espacé (letter-spacing) : le canvas ne le fait pas partout. */
function espace(ctx: CanvasRenderingContext2D, texte: string, x: number, y: number, pas: number, align: 'left' | 'right' = 'left') {
  const largeur = [...texte].reduce((s, ch) => s + ctx.measureText(ch).width + pas, -pas);
  let cx = align === 'right' ? x - largeur : x;
  ctx.textAlign = 'left';
  for (const ch of texte) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + pas; }
  return largeur;
}

/** Le nom sur deux lignes (coupure la plus équilibrée), réduit s'il le faut pour tenir. */
function lignesNom(ctx: CanvasRenderingContext2D, nom: string): { lignes: string[]; taille: number } {
  const mots = nom.toUpperCase().split(/\s+/).filter(Boolean);
  const coupures = mots.length < 2 ? [[mots.join(' ')]]
    : mots.slice(1).map((_, i) => [mots.slice(0, i + 1).join(' '), mots.slice(i + 1).join(' ')]);
  ctx.font = '400 146px Anton';
  const plusLarge = (l: string[]) => Math.max(...l.map((x) => ctx.measureText(x).width));
  const lignes = coupures.reduce((a, b) => (plusLarge(b) < plusLarge(a) ? b : a));
  let taille = 146;
  while (taille > 60) { ctx.font = `400 ${taille}px Anton`; if (plusLarge(lignes) <= UTILE) break; taille -= 4; }
  return { lignes, taille };
}

// Carte « Noire » (proposition A du 15/11/2026), dans l'esprit de la story de l'app :
// tout aligné à gauche, nom sur deux lignes, rang en jaune sans cadre, une ligne de chiffres.
async function dessiner(c: HTMLCanvasElement, d: DonneesCarte) {
  await Promise.all([document.fonts.load('400 200px Anton'), document.fonts.load('900 40px Inter'), document.fonts.load('800 40px Inter'), document.fonts.load('600 30px Inter')]).catch(() => {});
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = NOIR; ctx.fillRect(0, 0, L, H);
  const lueur = ctx.createRadialGradient(L * 0.85, H * 0.08, 20, L * 0.85, H * 0.08, 760);
  lueur.addColorStop(0, 'rgba(255,193,26,0.20)'); lueur.addColorStop(1, 'rgba(255,193,26,0)');
  ctx.fillStyle = lueur; ctx.fillRect(0, 0, L, H);
  ctx.textBaseline = 'alphabetic';

  // En-tête : logo à gauche, « CARTE JOUEUR » à droite.
  const [raquette, mot] = await Promise.all([image('/assets/auth/splash-racket.png'), image('/assets/auth/splash-wordmark.png')]).catch(() => [null, null]);
  if (raquette && mot) {
    const h = 58; ctx.drawImage(raquette, M, 97, h, h); ctx.drawImage(mot, M + h + 12, 97, (mot.width / mot.height) * h, h);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = '800 22px Inter';
  espace(ctx, 'CARTE JOUEUR', L - M, 135, 5, 'right');

  // Pastille « ● CLASSEMENT FRMT · HOMMES »
  ctx.font = '900 23px Inter';
  const pastille = `● CLASSEMENT FRMT · ${d.genre.toUpperCase()}`;
  const lp = [...pastille].reduce((s, ch) => s + ctx.measureText(ch).width + 3, -3);
  ctx.fillStyle = 'rgba(255,193,26,0.12)'; ctx.strokeStyle = 'rgba(255,193,26,0.45)'; ctx.lineWidth = 2;
  rectArrondi(ctx, M, 240, lp + 48, 52, 26); ctx.fill(); ctx.stroke();
  ctx.fillStyle = JAUNE; espace(ctx, pastille, M + 24, 275, 3);

  // Le nom, sur deux lignes
  const { lignes, taille } = lignesNom(ctx, d.nom);
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left'; ctx.font = `400 ${taille}px Anton`;
  const hauteurLigne = taille * 1.08;
  let y = 330 + taille * 0.92;
  for (const l of lignes) { ctx.fillText(l, M, y); y += hauteurLigne; }
  if (lignes.length === 1) y += hauteurLigne * 0.4;

  // Le rang : « RANG NATIONAL », « N°1 » en jaune, « Top x % » et le mois à côté
  const yRang = Math.min(y + 210, 960);
  ctx.fillStyle = BLANC_40; ctx.font = '800 23px Inter'; espace(ctx, 'RANG NATIONAL', M, yRang - 270, 4);
  ctx.fillStyle = JAUNE; ctx.font = '400 130px Anton'; ctx.fillText('N°', M, yRang - 135);
  const lNo = ctx.measureText('N°').width + 6;
  ctx.font = '400 270px Anton'; ctx.fillText(String(d.rang), M + lNo, yRang);
  const xCote = M + lNo + ctx.measureText(String(d.rang)).width + 44;
  ctx.fillStyle = '#FFFFFF'; ctx.font = '900 50px Inter'; ctx.fillText(`Top ${d.top} %`, xCote, yRang - 66);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '600 27px Inter'; ctx.fillText(d.mois, xCote, yRang - 22);

  // Ligne de chiffres entre deux filets (sans victoire ni défaite : les points seuls)
  ctx.fillStyle = BLANC_13; ctx.fillRect(M, 1040, UTILE, 2); ctx.fillRect(M, 1206, UTILE, 2);
  for (const col of colonnesCarte(d.points, d.bilan)) {
    ctx.textAlign = col.align;
    ctx.fillStyle = '#FFFFFF'; ctx.font = '400 82px Anton'; ctx.fillText(col.valeur, col.x, 1140);
    ctx.fillStyle = BLANC_40; ctx.font = '800 21px Inter';
    if (col.align === 'center') { ctx.textAlign = 'left'; const w = [...col.libelle].reduce((s, ch) => s + ctx.measureText(ch).width + 3, -3); espace(ctx, col.libelle, col.x - w / 2, 1180, 3); }
    else espace(ctx, col.libelle, col.x, 1180, 3, col.align === 'right' ? 'right' : 'left');
  }

  // Pied : le site à gauche, club et année à droite
  ctx.textAlign = 'left'; ctx.fillStyle = '#FFFFFF'; ctx.font = '800 36px Inter'; ctx.fillText('pagmatch.com', M, 1272);
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.42)'; ctx.font = '600 25px Inter';
  ctx.fillText([d.club, String(d.annee)].filter(Boolean).join(' · '), L - M, 1270);
}

export default function CartePartage({ d }: { d: DonneesCarte }) {
  const toile = useRef<HTMLCanvasElement>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const c = toile.current;
    if (!c) return;
    dessiner(c, d).then(() => setApercu(c.toDataURL('image/png'))).catch(() => setMessage("L'image n'a pas pu être créée."));
  }, [d]);

  const fichier = () => new Promise<File>((ok, ko) => toile.current?.toBlob((b) => (b ? ok(new File([b], `pagmatch-${d.url.split('/').filter(Boolean).pop()}.png`, { type: 'image/png' })) : ko()), 'image/png'));

  async function partager() {
    setMessage(null);
    try {
      const f = await fichier();
      const donnees = { files: [f], title: `${d.nom} — classement FRMT`, text: `${d.nom}, #${d.rang} du classement FRMT padel ${d.genre.toLowerCase()} : ${d.url}` };
      if (navigator.canShare?.(donnees)) { await navigator.share(donnees); return; }
      // Ordinateur ou navigateur sans partage de fichier : image téléchargée + lien copié.
      const a = document.createElement('a');
      a.href = URL.createObjectURL(f); a.download = f.name; a.click();
      await navigator.clipboard?.writeText(d.url).catch(() => {});
      setMessage('Image téléchargée et lien de la fiche copié.');
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') setMessage('Partage impossible sur cet appareil.');
    }
  }

  return (
    <div className="frmt-carte">
      <canvas ref={toile} width={L} height={H} hidden />
      {apercu ? <img className="frmt-carte-img" src={apercu} alt={`Carte de ${d.nom} : #${d.rang} du classement FRMT`} /> : <div className="frmt-carte-attente">Création de la carte…</div>}
      <button type="button" className="btn btn-brand frmt-partager" onClick={partager} disabled={!apercu}>Partager ma carte</button>
      {message && <p className="frmt-nb">{message}</p>}
    </div>
  );
}
