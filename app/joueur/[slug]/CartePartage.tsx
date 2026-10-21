'use client';

import { useEffect, useRef, useState } from 'react';

export interface DonneesCarte {
  nom: string; genre: 'Hommes' | 'Femmes'; rang: number; top: number; mois: string;
  points: string; evolutionPoints: string | null; bilan: string | null; club: string | null; annee: number; url: string;
}

const L = 1080, H = 1350; // 4:5, bien reçu partout (stories, WhatsApp, fil Instagram)
const JAUNE = '#FFC11A', NOIR = '#0A0A0A', CARTE = '#131315', GRIS = '#8A8A93';

function image(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
}

/** Écrit un texte centré, en réduisant la police jusqu'à tenir dans la largeur. */
function centre(ctx: CanvasRenderingContext2D, texte: string, y: number, taille: number, police: string, max = 940) {
  let t = taille;
  do { ctx.font = `${police.replace('{t}', String(t))}`; t -= 4; } while (ctx.measureText(texte).width > max && t > 20);
  ctx.fillText(texte, L / 2, y);
}

function rectArrondi(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

async function dessiner(c: HTMLCanvasElement, d: DonneesCarte) {
  await Promise.all([document.fonts.load('400 200px Anton'), document.fonts.load('800 40px Inter'), document.fonts.load('600 30px Inter')]).catch(() => {});
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = NOIR; ctx.fillRect(0, 0, L, H);
  const lueur = ctx.createRadialGradient(L / 2, 420, 40, L / 2, 420, 760);
  lueur.addColorStop(0, 'rgba(255,193,26,0.28)'); lueur.addColorStop(1, 'rgba(255,193,26,0)');
  ctx.fillStyle = lueur; ctx.fillRect(0, 0, L, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';

  const [raquette, mot] = await Promise.all([image('/assets/auth/splash-racket.png'), image('/assets/auth/splash-wordmark.png')]).catch(() => [null, null]);
  if (raquette && mot) {
    const h = 64, wm = (mot.width / mot.height) * h, total = h + 12 + wm, x0 = (L - total) / 2;
    ctx.drawImage(raquette, x0, 70, h, h); ctx.drawImage(mot, x0 + h + 12, 70, wm, h);
  }

  ctx.fillStyle = '#FFFFFF'; centre(ctx, d.nom.toUpperCase(), 250, 96, '400 {t}px Anton');

  // Pastille « TOP x % »
  ctx.font = '800 34px Inter';
  const pill = `TOP ${d.top} %`, pw = ctx.measureText(pill).width + 56;
  ctx.fillStyle = JAUNE; rectArrondi(ctx, (L - pw) / 2, 290, pw, 62, 31); ctx.fill();
  ctx.fillStyle = NOIR; ctx.fillText(pill, L / 2, 333);

  // Le rang
  ctx.fillStyle = CARTE; ctx.strokeStyle = 'rgba(255,193,26,0.55)'; ctx.lineWidth = 3;
  rectArrondi(ctx, 90, 390, 900, 440, 36); ctx.fill(); ctx.stroke();
  ctx.fillStyle = JAUNE; centre(ctx, `#${d.rang}`, 680, 300, '400 {t}px Anton', 800);
  ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Inter'; ctx.fillText('CLASSEMENT NATIONAL FRMT', L / 2, 750);
  ctx.fillStyle = GRIS; ctx.font = '600 32px Inter'; ctx.fillText(`${d.genre} · ${d.mois}`, L / 2, 800);

  // Deux tuiles : points, bilan
  const tuile = (x: number, grand: string, petit: string, extra: string | null) => {
    ctx.fillStyle = CARTE; rectArrondi(ctx, x, 870, 430, 200, 28); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF'; ctx.font = '800 64px Inter';
    ctx.fillText(grand, x + 215, 960);
    if (extra) { ctx.fillStyle = '#22C55E'; ctx.font = '800 30px Inter'; ctx.fillText(extra, x + 215, 1000); }
    ctx.fillStyle = GRIS; ctx.font = '700 26px Inter'; ctx.fillText(petit, x + 215, 1045);
  };
  tuile(90, d.points, 'POINTS', d.evolutionPoints);
  tuile(560, d.bilan ?? '—', 'V – D SUR 12 MOIS', null);

  ctx.fillStyle = GRIS; ctx.font = '600 30px Inter';
  ctx.fillText([d.club, String(d.annee)].filter(Boolean).join(' · '), L / 2, 1130);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(340, 1165, 400, 2);
  ctx.fillStyle = '#FFFFFF'; ctx.font = '800 44px Inter'; ctx.fillText('pagmatch.com', L / 2, 1240);
  ctx.fillStyle = GRIS; ctx.font = '600 26px Inter'; ctx.fillText('Ton classement FRMT règle ton niveau sur Pagmatch', L / 2, 1290);
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
