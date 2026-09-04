interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  color?: string;
  height?: number;
  formatValue?: (n: number) => string;
  horizontal?: boolean;
}

export function BarChart({ data, color = '#3b82f6', height = 200, formatValue, horizontal = false }: BarChartProps) {
  if (data.length === 0) return <div className="text-slate-500 text-sm py-8 text-center">No data available</div>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-300 font-medium truncate pr-2">{d.label}</span>
              <span className="text-xs text-slate-400 font-medium tabular-nums whitespace-nowrap">
                {formatValue ? formatValue(d.value) : d.value.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(d.value / maxVal) * 100}%`, backgroundColor: d.color ?? color }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const barWidth = 100 / data.length;
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <div className="w-full flex-1 flex items-end">
            <div
              className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
              style={{
                height: `${(d.value / maxVal) * 100}%`,
                backgroundColor: d.color ?? color,
                minHeight: d.value > 0 ? '4px' : '0',
              }}
              title={formatValue ? formatValue(d.value) : String(d.value)}
            />
          </div>
          <span className="text-[10px] text-slate-400 text-center truncate w-full">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
