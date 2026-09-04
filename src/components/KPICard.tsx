import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPct } from '@/lib/format';

interface KPICardProps {
  label: string;
  value: string;
  change?: number | null;
  icon?: ReactNode;
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'cyan' | 'slate';
  subtitle?: string;
}

const accentMap = {
  blue: 'text-blue-400 bg-blue-500/10',
  green: 'text-emerald-400 bg-emerald-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  red: 'text-red-400 bg-red-500/10',
  cyan: 'text-cyan-400 bg-cyan-500/10',
  slate: 'text-slate-400 bg-slate-500/10',
};

export function KPICard({ label, value, change, icon, accent = 'blue', subtitle }: KPICardProps) {
  const changeIcon = change === undefined || change === null ? <Minus className="w-3 h-3" /> : change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  const changeColor = change === undefined || change === null ? 'text-slate-500' : change >= 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-colors animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        {icon && <div className={`p-1.5 rounded-lg ${accentMap[accent]}`}>{icon}</div>}
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="flex items-center gap-1.5 mt-2">
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${changeColor}`}>
            {changeIcon}
            {formatPct(change)}
          </span>
        )}
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </div>
    </div>
  );
}
