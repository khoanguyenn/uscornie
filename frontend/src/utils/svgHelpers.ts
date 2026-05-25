export function starPts(
  cx: number,
  cy: number,
  ro: number,
  ri: number,
): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = ((i * 36 - 90) * Math.PI) / 180;
    const px = (cx + r * Math.cos(a)).toFixed(2);
    const py = (cy + r * Math.sin(a)).toFixed(2);
    pts.push(`${px},${py}`);
  }
  return pts.join(" ");
}

export function spikeRing(
  cx: number,
  cy: number,
  ri: number,
  ro: number,
  n: number,
): string {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
    const x1 = (cx + ri * Math.cos(a1)).toFixed(2);
    const y1 = (cy + ri * Math.sin(a1)).toFixed(2);
    const x2 = (cx + ro * Math.cos(a2)).toFixed(2);
    const y2 = (cy + ro * Math.sin(a2)).toFixed(2);
    const a3 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const x3 = (cx + ri * Math.cos(a3)).toFixed(2);
    const y3 = (cy + ri * Math.sin(a3)).toFixed(2);
    d += `M${x1},${y1} L${x2},${y2} L${x3},${y3} `;
  }
  return d;
}

export interface LegInfo {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dur: number;
}

export function legs(cx: number, y: number, n: number, len: number): LegInfo[] {
  const l: LegInfo[] = [];
  const spread = len * 2.5;
  for (let i = 0; i < n; i++) {
    const x = cx - spread / 2 + (spread / (n - 1)) * i;
    const d = ((i * 7) % 10) / 10; // Deterministic pseudo-random value [0, 0.9]
    l.push({
      x1: Number(x.toFixed(2)),
      y1: Number((y - 4).toFixed(2)),
      x2: Number((x + (i % 2 ? 2 : -2)).toFixed(2)),
      y2: Number((y + len).toFixed(2)),
      dur: Number((0.5 + d * 0.3).toFixed(2)),
    });
  }
  return l;
}
