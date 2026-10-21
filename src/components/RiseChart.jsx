// Small SVG line chart of aliquot rise % over elapsed time
export default function RiseChart({ points }) {
  if (points.length < 2) return null;

  const width = 320;
  const height = 120;
  const pad = { left: 32, right: 8, top: 8, bottom: 20 };
  const maxX = Math.max(...points.map((p) => p.hours)) || 1;
  const maxY = Math.max(...points.map((p) => p.rise), 10);
  const x = (h) => pad.left + (h / maxX) * (width - pad.left - pad.right);
  const y = (r) => height - pad.bottom - (r / maxY) * (height - pad.top - pad.bottom);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.hours).toFixed(1)},${y(p.rise).toFixed(1)}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-md text-indigo-600 dark:text-indigo-400"
      role="img"
      aria-label="Aliquot rise percentage over time"
    >
      <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} stroke="currentColor" opacity="0.25" />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={height - pad.bottom} stroke="currentColor" opacity="0.25" />
      <text x={pad.left - 4} y={pad.top + 8} textAnchor="end" fontSize="9" fill="currentColor">{Math.round(maxY)}%</text>
      <text x={pad.left - 4} y={height - pad.bottom} textAnchor="end" fontSize="9" fill="currentColor">0%</text>
      <text x={width - pad.right} y={height - 6} textAnchor="end" fontSize="9" fill="currentColor">{maxX.toFixed(1)}h</text>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={x(p.hours)} cy={y(p.rise)} r="3" fill="currentColor" />
      ))}
    </svg>
  );
}
