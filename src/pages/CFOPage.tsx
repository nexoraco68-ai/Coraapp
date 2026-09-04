import { Wallet, AlertTriangle, Info, TrendingDown, TrendingUp } from 'lucide-react';
import type { BusinessData } from '@/lib/types';
import { getCFOAnalysis } from '@/lib/ai';
import { formatRWF, formatPct } from '@/lib/format';
import { KPICard } from '@/components/KPICard';
import { ChartCard } from '@/components/ChartCard';
import { LineChart } from '@/components/LineChart';
import { BarChart } from '@/components/BarChart';
import { getMonthlyBuckets, getExpensesByCategory } from '@/lib/analytics';
import { formatCompact } from '@/lib/format';

interface CFOPageProps {
  data: BusinessData;
}

const severityColor: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

export function CFOPage({ data }: CFOPageProps) {
  const cfo = getCFOAnalysis(data);
  const buckets = getMonthlyBuckets(data);
  const expenses = getExpensesByCategory(data);

  const profitData = buckets.map((b) => ({ label: b.label, value: b.profit }));
  const revVsExp = buckets.map((b) => ({ label: b.label, value: b.revenue - b.expenses }));

  const healthColor = cfo.healthScore >= 75 ? 'text-emerald-400' : cfo.healthScore >= 50 ? 'text-amber-400' : 'text-red-400';
  const healthBg = cfo.healthScore >= 75 ? 'bg-emerald-500/10 border-emerald-500/20' : cfo.healthScore >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-20 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-500/10 rounded-xl">
          <Wallet className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">CORA CFO</h1>
          <p className="text-sm text-slate-400">Money & Cash Flow</p>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className={`border rounded-2xl p-5 sm:p-6 mb-6 ${healthBg} animate-fade-in`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Financial Health</h2>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${healthColor}`}>{cfo.healthScore}</span>
            <span className="text-sm text-slate-400">/100</span>
          </div>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              cfo.healthScore >= 75 ? 'bg-emerald-500' : cfo.healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${cfo.healthScore}%` }}
          />
        </div>
        <div className={`text-sm font-medium ${healthColor}`}>{cfo.healthLabel}</div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPICard label="Revenue" value={formatRWF(cfo.revenue)} change={cfo.revenueChange} accent="blue" />
        <KPICard label="Expenses" value={formatRWF(cfo.expenses)} change={cfo.expenseChange} accent="red" />
        <KPICard label="Profit" value={formatRWF(cfo.profit)} change={cfo.profitChange} accent="green" />
        <KPICard label="Margin" value={`${cfo.margin.toFixed(1)}%`} accent="cyan" />
      </div>

      {/* Outstanding / Overdue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Outstanding Invoices</div>
          <div className="text-2xl font-bold text-amber-400">{formatRWF(cfo.outstandingAmount)}</div>
          <div className="text-xs text-slate-500 mt-1">Unpaid and partially paid invoices</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Overdue Amount</div>
          <div className="text-2xl font-bold text-red-400">{formatRWF(cfo.overdueAmount)}</div>
          <div className="text-xs text-slate-500 mt-1">Past due date — needs collection</div>
        </div>
      </div>

      {/* Anomalies */}
      {cfo.anomalies.length > 0 && (
        <ChartCard title="Detected Anomalies">
          <div className="space-y-3">
            {cfo.anomalies.map((a, i) => (
              <div key={i} className={`p-4 rounded-xl border ${severityColor[a.severity] ?? severityColor.low}`}>
                <div className="flex items-start gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="text-sm font-medium text-white">{a.title}</div>
                </div>
                <div className="text-xs text-slate-300 ml-6 mb-1">{a.description}</div>
                <div className="text-xs text-slate-500 ml-6">{a.evidence}</div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Insights */}
      <ChartCard title="Financial Insights" className="mt-6">
        <div className="space-y-2">
          {cfo.insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        <ChartCard title="Profit Trend">
          <LineChart data={profitData} color="#10b981" formatY={(n) => formatCompact(n)} />
        </ChartCard>
        <ChartCard title="Net Cash Flow">
          <BarChart data={revVsExp} color="#3b82f6" height={180} formatValue={(n) => formatCompact(n)} />
        </ChartCard>
      </div>

      <div className="mt-6">
        <ChartCard title="Expenses by Category">
          <BarChart
            data={expenses.map((e) => ({ label: e.category, value: e.amount, color: '#ef4444' }))}
            horizontal
            formatValue={(n) => formatRWF(n)}
          />
        </ChartCard>
      </div>

      {/* Actual vs Estimated disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl mt-6">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 leading-relaxed">{cfo.actualVsEstimated}</div>
      </div>
    </div>
  );
}
