import type { FlowerKind, Wrap } from '../data';

// Иллюстрации-заглушки вместо фотографий букетов. В рабочей версии — фото из админки.

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
const STEM = '#4E7A62';

function Bloom({ kind, x, y, r, c, rot }: { kind: FlowerKind; x: number; y: number; r: number; c: string; rot: number }) {
  const t = `translate(${x} ${y}) rotate(${rot})`;
  switch (kind) {
    case 'rose':
      return (
        <g transform={t}>
          <circle r={r} fill={c} />
          <circle r={r * 0.72} fill="none" stroke="rgba(0,0,0,.14)" strokeWidth={1.2} />
          <path d={`M${-r * 0.45} 0 a${r * 0.45} ${r * 0.45} 0 1 1 ${r * 0.5} ${r * 0.3}`} fill="none" stroke="rgba(0,0,0,.18)" strokeWidth={1.2} />
          <circle r={r * 0.18} fill="rgba(0,0,0,.12)" />
        </g>
      );
    case 'peony':
      return (
        <g transform={t}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx={0} cy={-r * 0.45} rx={r * 0.62} ry={r * 0.6} fill={c} transform={`rotate(${a})`} stroke="rgba(0,0,0,.06)" />
          ))}
          <circle r={r * 0.5} fill={c} stroke="rgba(0,0,0,.1)" />
          <circle r={r * 0.22} fill="rgba(255,255,255,.45)" />
        </g>
      );
    case 'tulip':
      return (
        <g transform={t}>
          <path d={`M${-r * 0.7} ${-r * 0.2} Q${-r * 0.8} ${r} 0 ${r} Q${r * 0.8} ${r} ${r * 0.7} ${-r * 0.2} L${r * 0.35} ${-r * 0.9} L0 ${-r * 0.3} L${-r * 0.35} ${-r * 0.9} Z`} fill={c} stroke="rgba(0,0,0,.12)" />
        </g>
      );
    case 'chrys':
      return (
        <g transform={t}>
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse key={i} cx={0} cy={-r * 0.55} rx={r * 0.16} ry={r * 0.5} fill={c} transform={`rotate(${i * (360 / 14)})`} stroke="rgba(0,0,0,.08)" />
          ))}
          <circle r={r * 0.28} fill="#D8B54A" />
        </g>
      );
    case 'hydrangea':
      return (
        <g transform={t}>
          <circle r={r} fill={c} opacity={0.55} />
          {Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2;
            const d = i === 0 ? 0 : r * 0.55;
            return (
              <g key={i} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d})`}>
                {[0, 90, 180, 270].map((q) => (
                  <ellipse key={q} cx={0} cy={-r * 0.14} rx={r * 0.12} ry={r * 0.16} fill={c} transform={`rotate(${q})`} stroke="rgba(0,0,0,.08)" />
                ))}
              </g>
            );
          })}
        </g>
      );
    default:
      return <circle cx={x} cy={y} r={r} fill={c} />;
  }
}

export function FlowerArt({
  seed,
  kind,
  wrap,
  colors,
  stems,
  className,
}: {
  seed: string;
  kind: FlowerKind;
  wrap: Wrap;
  colors: string[];
  stems: number;
  className?: string;
}) {
  const rand = rng(seed + stems);
  const n = Math.max(5, Math.min(19, Math.round(stems * 0.55)));
  const kinds: FlowerKind[] = kind === 'mix' ? ['rose', 'peony', 'chrys', 'rose'] : [kind];
  const cx = 100;
  const topY = wrap === 'basket' || wrap === 'box' ? 112 : 92;
  const spread = wrap === 'box' ? 46 : wrap === 'basket' ? 62 : 52;

  const blooms = Array.from({ length: n }, (_, i) => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * spread;
    const x = cx + Math.cos(a) * d;
    const y = topY + Math.sin(a) * d * 0.62;
    const k = kinds[i % kinds.length];
    const base = k === 'hydrangea' ? 22 : k === 'peony' ? 18 : k === 'tulip' ? 12 : 14;
    return { x, y, r: base * (0.85 + rand() * 0.3), c: colors[i % colors.length], k, rot: rand() * 360 };
  }).sort((p, q) => p.y - q.y);

  const leaves = Array.from({ length: 6 }, (_, i) => {
    const side = i % 2 ? 1 : -1;
    return { x: cx + side * (spread + 4 - rand() * 14), y: topY + 6 + rand() * 30, rot: side * (30 + rand() * 40) };
  });

  return (
    <svg viewBox="0 0 200 250" className={className} role="img" aria-hidden="true">
      {wrap === 'vase' && <rect x="66" y="150" width="68" height="88" rx="14" fill="rgba(255,255,255,.55)" stroke="rgba(0,0,0,.08)" />}
      {(wrap === 'paper' || wrap === 'vase') &&
        Array.from({ length: Math.min(n, 9) }, (_, i) => (
          <line key={i} x1={cx - 10 + i * 2.5} y1={topY + 10} x2={cx - 6 + i * 1.5} y2={236} stroke={STEM} strokeWidth={2} />
        ))}
      {wrap === 'paper' && (
        <>
          <path d={`M${cx - 74} ${topY - 4} L${cx - 10} 236 L${cx + 10} 236 L${cx + 74} ${topY - 4} L${cx + 40} ${topY + 40} L${cx} ${topY + 20} L${cx - 40} ${topY + 40} Z`} fill="#EDE6D8" />
          <path d={`M${cx - 74} ${topY - 4} L${cx - 10} 236 L${cx - 40} ${topY + 40} Z`} fill="#E2D9C6" />
        </>
      )}
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx={7} ry={20} fill={LEAF} transform={`rotate(${l.rot} ${l.x} ${l.y})`} />
      ))}
      {blooms.map((b, i) => (
        <Bloom key={i} kind={b.k} x={b.x} y={b.y} r={b.r} c={b.c} rot={b.rot} />
      ))}
      {wrap === 'paper' && <path d={`M${cx - 18} ${topY + 70} Q${cx} ${topY + 82} ${cx + 18} ${topY + 70} L${cx + 14} ${topY + 84} Q${cx} ${topY + 92} ${cx - 14} ${topY + 84} Z`} fill="#7E9C8A" />}
      {wrap === 'box' && (
        <>
          <rect x={cx - 62} y={topY + 18} width="124" height="104" rx="6" fill="#2F4F45" />
          <ellipse cx={cx} cy={topY + 18} rx="62" ry="10" fill="#3A5F53" />
          <rect x={cx - 62} y={topY + 70} width="124" height="10" fill="#C8A86A" opacity=".85" />
        </>
      )}
      {wrap === 'basket' && (
        <>
          <path d={`M${cx - 76} ${topY + 16} Q${cx} ${topY + 130} ${cx + 76} ${topY + 16} Z`} fill="#B98B5A" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${cx - 70 + i * 6} ${topY + 26 + i * 18} Q${cx} ${topY + 60 + i * 20} ${cx + 70 - i * 6} ${topY + 26 + i * 18}`} fill="none" stroke="#9C7245" strokeWidth="3" />
          ))}
          <path d={`M${cx - 70} ${topY + 16} Q${cx} ${topY - 90} ${cx + 70} ${topY + 16}`} fill="none" stroke="#9C7245" strokeWidth="5" />
        </>
      )}
    </svg>
  );
}
