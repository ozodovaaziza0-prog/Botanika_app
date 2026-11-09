import type { FlowerKind } from '../data';

// Иллюстрации-заглушки вместо фотографий. В рабочей версии — фото охапок из админки.

export interface ArtStem {
  kind: FlowerKind;
  c1: string;
  c2: string;
  count: number;
}

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

const LEAF = '#5E8A73';
const STEM = '#55806A';

function Bloom({ kind, r, c1, c2 }: { kind: FlowerKind; r: number; c1: string; c2: string }) {
  switch (kind) {
    case 'rose':
      return (
        <g>
          <circle r={r} fill={c1} />
          <circle r={r * 0.7} fill={c2} opacity={0.35} />
          <path d={`M${-r * 0.5} ${r * 0.05} a${r * 0.48} ${r * 0.48} 0 1 1 ${r * 0.62} ${r * 0.34}`} fill="none" stroke="rgba(0,0,0,.18)" strokeWidth={1.1} />
          <path d={`M${-r * 0.2} ${-r * 0.1} a${r * 0.22} ${r * 0.22} 0 1 1 ${r * 0.3} ${r * 0.16}`} fill="none" stroke="rgba(0,0,0,.2)" strokeWidth={1} />
        </g>
      );
    case 'spray':
      return (
        <g>
          {[[-0.55, 0.25], [0.5, 0.3], [0, -0.45]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x * r} ${y * r})`}>
              <circle r={r * 0.52} fill={c1} />
              <path d={`M${-r * 0.25} 0 a${r * 0.24} ${r * 0.24} 0 1 1 ${r * 0.3} ${r * 0.16}`} fill="none" stroke="rgba(0,0,0,.18)" strokeWidth={1} />
            </g>
          ))}
        </g>
      );
    case 'peony':
      return (
        <g>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx={0} cy={-r * 0.45} rx={r * 0.62} ry={r * 0.6} fill={c1} transform={`rotate(${a})`} stroke="rgba(0,0,0,.06)" />
          ))}
          <circle r={r * 0.52} fill={c2} opacity={0.6} />
          <circle r={r * 0.24} fill="rgba(255,255,255,.5)" />
        </g>
      );
    case 'ranunculus':
      return (
        <g>
          <circle r={r} fill={c1} />
          {[0.82, 0.62, 0.42].map((k) => (
            <circle key={k} r={r * k} fill="none" stroke={c2} strokeWidth={1.4} />
          ))}
          <circle r={r * 0.18} fill="#6F8F5E" />
        </g>
      );
    case 'tulip':
      return (
        <path d={`M${-r * 0.7} ${-r * 0.2} Q${-r * 0.8} ${r} 0 ${r} Q${r * 0.8} ${r} ${r * 0.7} ${-r * 0.2} L${r * 0.35} ${-r * 0.95} L0 ${-r * 0.3} L${-r * 0.35} ${-r * 0.95} Z`} fill={c1} stroke={c2} strokeWidth={1} />
      );
    case 'eustoma':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-r * 0.48} rx={r * 0.48} ry={r * 0.56} fill={c1} transform={`rotate(${a})`} stroke={c2} strokeWidth={0.8} />
          ))}
          <circle r={r * 0.22} fill={c2} />
        </g>
      );
    case 'carnation': {
      const n = 18;
      const d = Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const rr = i % 2 ? r : r * 0.82;
        return `${i ? 'L' : 'M'}${Math.cos(a) * rr} ${Math.sin(a) * rr}`;
      }).join(' ');
      return (
        <g>
          <path d={`${d} Z`} fill={c1} />
          <circle r={r * 0.55} fill={c2} opacity={0.5} />
        </g>
      );
    }
    case 'alstro':
      return (
        <g>
          {[0, 60, 120, 180, 240, 300].map((a, i) => (
            <ellipse key={a} cx={0} cy={-r * 0.5} rx={r * 0.26} ry={r * 0.52} fill={i % 2 ? c1 : c2} transform={`rotate(${a})`} />
          ))}
          <circle r={r * 0.16} fill="#E8C24A" />
        </g>
      );
    case 'chrys':
      return (
        <g>
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse key={i} cx={0} cy={-r * 0.55} rx={r * 0.16} ry={r * 0.5} fill={c1} transform={`rotate(${i * (360 / 14)})`} stroke="rgba(0,0,0,.07)" />
          ))}
          <circle r={r * 0.28} fill={c2} />
        </g>
      );
    case 'hydrangea':
      return (
        <g>
          <circle r={r} fill={c2} opacity={0.5} />
          {Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2;
            const d = i === 0 ? 0 : r * 0.55;
            return (
              <g key={i} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d})`}>
                {[0, 90, 180, 270].map((q) => (
                  <ellipse key={q} cx={0} cy={-r * 0.14} rx={r * 0.12} ry={r * 0.16} fill={c1} transform={`rotate(${q})`} />
                ))}
              </g>
            );
          })}
        </g>
      );
    case 'gyps':
      return (
        <g>
          {Array.from({ length: 11 }, (_, i) => {
            const a = i * 2.4;
            const d = r * 0.18 * Math.sqrt(i + 1);
            return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={r * 0.13} fill={c1} stroke="#DCE2D6" strokeWidth={0.6} />;
          })}
        </g>
      );
    case 'eucalyptus':
      return (
        <g>
          {[-0.8, -0.3, 0.2, 0.7].map((y, i) => (
            <g key={i}>
              <circle cx={-r * 0.3} cy={y * r} r={r * 0.28} fill={c1} />
              <circle cx={r * 0.3} cy={y * r + r * 0.15} r={r * 0.26} fill={c2} />
            </g>
          ))}
        </g>
      );
    default:
      return <circle r={r} fill={c1} />;
  }
}

const SIZE: Record<FlowerKind, number> = {
  rose: 13, spray: 13, peony: 18, ranunculus: 11, tulip: 12, eustoma: 12, carnation: 12,
  alstro: 13, chrys: 13, hydrangea: 22, gyps: 14, eucalyptus: 16,
};

/**
 * Рисует охапку. pack="box" — цветы в коробке Botanika (охапка), "vase" — в стеклянной вазе («Собери сам»).
 * Если стеблей много, рисуем не все, а пропорционально.
 */
export function FlowerArt({ seed, stems, pack, className }: { seed: string; stems: ArtStem[]; pack: 'box' | 'vase'; className?: string }) {
  const rand = rng(seed);
  const total = stems.reduce((s, x) => s + x.count, 0);
  const cap = 22;
  const scale = total > cap ? cap / total : 1;

  type B = { kind: FlowerKind; c1: string; c2: string; filler: boolean };
  const list: B[] = [];
  stems.forEach((s) => {
    const n = Math.max(1, Math.round(s.count * scale));
    for (let i = 0; i < n; i++) list.push({ kind: s.kind, c1: s.c1, c2: s.c2, filler: s.kind === 'gyps' || s.kind === 'eucalyptus' });
  });
  // перемешиваем, чтобы смесь выглядела естественно
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  const cx = 100;
  const neckY = pack === 'box' ? 150 : 160;
  const n = list.length;
  const spread = Math.min(70, 26 + Math.sqrt(n) * 11);
  const topY = neckY - 40 - Math.min(40, n * 1.6);

  const placed = list.map((b, i) => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt((i + 0.5) / Math.max(n, 1)) * spread;
    const x = cx + Math.cos(a) * d;
    const y = topY + 30 + Math.sin(a) * d * 0.55 - (b.filler ? 10 : 0);
    return { ...b, x, y, r: SIZE[b.kind] * (0.88 + rand() * 0.24), rot: rand() * 360 };
  });
  const fillers = placed.filter((p) => p.filler);
  const blooms = placed.filter((p) => !p.filler).sort((p, q) => p.y - q.y);

  return (
    <svg viewBox="0 0 200 250" className={className} role="img" aria-hidden="true">
      {/* стебли */}
      {placed.map((p, i) => (
        <path key={`s${i}`} d={`M${p.x} ${p.y} Q${(p.x + cx) / 2} ${(p.y + neckY) / 2 + 6} ${cx + (p.x - cx) * 0.18} ${neckY + 20}`} stroke={STEM} strokeWidth={1.6} fill="none" />
      ))}
      {pack === 'vase' &&
        placed.map((p, i) => <line key={`v${i}`} x1={cx + (p.x - cx) * 0.18} y1={neckY + 20} x2={cx + (p.x - cx) * 0.1} y2={232} stroke={STEM} strokeWidth={1.4} />)}
      {/* листья */}
      {Array.from({ length: Math.min(8, 2 + Math.round(n / 3)) }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        const x = cx + side * (spread * 0.6 + rand() * 18);
        const y = topY + 50 + rand() * 30;
        return <ellipse key={`l${i}`} cx={x} cy={y} rx={6} ry={17} fill={LEAF} transform={`rotate(${side * (35 + rand() * 30)} ${x} ${y})`} />;
      })}
      {fillers.map((p, i) => (
        <g key={`f${i}`} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
          <Bloom kind={p.kind} r={p.r} c1={p.c1} c2={p.c2} />
        </g>
      ))}
      {blooms.map((p, i) => (
        <g key={`b${i}`} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}>
          <Bloom kind={p.kind} r={p.r} c1={p.c1} c2={p.c2} />
        </g>
      ))}
      {pack === 'box' ? (
        <g>
          <path d={`M${cx - 46} ${neckY} L${cx + 46} ${neckY} L${cx + 40} 240 L${cx - 40} 240 Z`} fill="#F3EEE4" />
          <path d={`M${cx - 46} ${neckY} L${cx + 46} ${neckY} L${cx + 44} ${neckY + 12} L${cx - 44} ${neckY + 12} Z`} fill="#E5DDCD" />
          <rect x={cx - 20} y={neckY + 34} width="40" height="22" rx="3" fill="#2E5A4C" />
          <text x={cx} y={neckY + 49} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#F3EEE4" fontFamily="Onest, system-ui, sans-serif">
            Botanika
          </text>
        </g>
      ) : (
        <g>
          <path d={`M${cx - 30} ${neckY + 14} Q${cx - 44} 200 ${cx - 32} 238 L${cx + 32} 238 Q${cx + 44} 200 ${cx + 30} ${neckY + 14} Z`} fill="rgba(255,255,255,.45)" stroke="rgba(46,90,76,.25)" strokeWidth="1.5" />
          <path d={`M${cx - 38} 196 Q${cx} 202 ${cx + 38} 196 L${cx + 34} 236 L${cx - 34} 236 Z`} fill="rgba(160,200,190,.28)" />
        </g>
      )}
    </svg>
  );
}

/** Один цветок крупно — для списков. */
export function StemIcon({ kind, c1, c2 }: { kind: FlowerKind; c1: string; c2: string }) {
  return (
    <svg viewBox="-24 -24 48 48" role="img" aria-hidden="true">
      <Bloom kind={kind} r={kind === 'hydrangea' || kind === 'peony' ? 17 : 16} c1={c1} c2={c2} />
    </svg>
  );
}
