interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  formatY?: (n: number) => string;
}

export function LineChart({ data, color = '#3b82f6', height = 180, formatY }: LineChartProps) {
  if (data.length === 0) return <div className="text-slate-500 text-sm py-8 text-center">No data available</div>;

  const width = 600;
  const padding = { top: 20, right: 10, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  const stepX = chartW / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + chartH - ((d.value - minVal) / range) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => minVal + (range * i) / yTicks);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {tickValues.map((tv, i) => {
        const y = padding.top + chartH - ((tv - minVal) / range) * chartH;
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1e293b" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-slate-500" style={{ fontSize: 10 }}>
              {formatY ? formatY(tv) : Math.round(tv).toLocaleString()}
            </text>
          </g>
        );
      })}
      {/* Area */}
      <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={color} />
          <circle cx={p.x} cy={p.y} r="6" fill={color} opacity="0" className="hover:opacity-20 transition-opacity" />
          <text x={p.x} y={height - 8} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10 }}>
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}
