/** Points FRMT édition après édition (SVG statique, sans bibliothèque). */
export default function Courbe({ points }: { points: { date: string; points: number }[] }) {
  if (points.length < 2) return null;
  const W = 320, H = 90, P = 8;
  const vals = points.map((p) => p.points);
  const min = Math.min(...vals), max = Math.max(...vals);
  const x = (i: number) => P + (i * (W - 2 * P)) / (points.length - 1);
  const y = (v: number) => (max === min ? H / 2 : H - P - ((v - min) * (H - 2 * P)) / (max - min));
  const trace = points.map((p, i) => `${x(i).toFixed(1)},${y(p.points).toFixed(1)}`).join(' ');
  const d0 = new Date(points[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return (
    <section className="frmt-sec">
      <h2>Évolution des points</h2>
      <div className="frmt-courbe">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={`Points FRMT depuis le ${d0}`}>
          <polyline fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" points={trace} />
          <circle cx={x(points.length - 1)} cy={y(vals[vals.length - 1])} r="4" fill="var(--brand)" />
        </svg>
        <div className="frmt-courbe-l"><span>{d0}</span><span>aujourd&apos;hui</span></div>
      </div>
    </section>
  );
}
