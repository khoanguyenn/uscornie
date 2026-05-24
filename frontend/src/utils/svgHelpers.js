export function starPts(cx, cy, ro, ri) {
  let pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = ((i * 36 - 90) * Math.PI) / 180;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(" ");
}

export function spikeRing(cx, cy, ri, ro, n) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + ri * Math.cos(a1),
      y1 = cy + ri * Math.sin(a1);
    const x2 = cx + ro * Math.cos(a2),
      y2 = cy + ro * Math.sin(a2);
    const a3 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const x3 = cx + ri * Math.cos(a3),
      y3 = cy + ri * Math.sin(a3);
    d += `M${x1},${y1} L${x2},${y2} L${x3},${y3} `;
  }
  return d;
}

export function legs(cx, y, n, len) {
  let l = [];
  const spread = len * 2.5;
  for (let i = 0; i < n; i++) {
    const x = cx - spread / 2 + (spread / (n - 1)) * i;
    const d = Math.random() * 0.5 + 0.5;
    l.push({
      x1: x,
      y1: y - 4,
      x2: x + (i % 2 ? 2 : -2),
      y2: y + len,
      dur: 0.5 + d * 0.3,
    });
  }
  return l;
}
