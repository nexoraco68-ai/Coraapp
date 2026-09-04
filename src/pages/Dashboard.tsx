import { DollarSign, Wallet, TrendingUp, Users, ShoppingCart, FileText, AlertTriangle, ArrowRight, Package, UserPlus, ClipboardList, Receipt } from 'lucide-react';
import type { BusinessData } from '@/lib/types';
import { getKPIs, getMonthlyBuckets, getRevenueByProduct, getExpensesByCategory, getRecentTransactions } from '@/lib/analytics';
import { formatRWF, formatCompact, formatShortDate, formatPct } from '@/lib/format';
import { KPICard } from '@/components/KPICard';
import { ChartCard } from '@/components/ChartCard';
import { LineChart } from '@/components/LineChart';
import { BarChart } from '@/components/BarChart';
import { DonutChart } from '@/components/DonutChart';
import type { PageId } from '@/components/Layout';

interface DashboardProps {
  data: BusinessData;
  onNavigate: (page: PageId) => void;
}

const chartColors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Dashboard({ data, onNavigate }: DashboardProps) {
  const kpis = getKPIs(data);
  const buckets = getMonthlyBuckets(data);
  const products = getRevenueByProduct(data).slice(0, 6);
  const expenses = getExpensesByCategory(data);
  const recent = getRecentTransactions(data, 8);

  const revenueData = buckets.map((b) => ({ label: b.label, value: b.revenue }));
  const expenseData = buckets.map((b) => ({ label: b.label, value: b.expenses }));
  const profitData = buckets.map((b) => ({ label: b.label, value: b.profit }));
  const customerData = buckets.map((b) => ({ label: b.label, value: b.customerCount }));

  const expenseDonut = expenses.slice(0, 6).map((e, i) => ({
    label: e.category,
    value: e.amount,
    color: chartColors[i % chartColors.length],
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-20 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-sm text-slate-400">Business overview · {data.business.name}{data.business.isDemo ? ' · Demo' : ''}</p>
      </div>

      {/* Empty state for new businesses with no data */}
      {data.sales.length === 0 && data.expenses.length === 0 && data.customers.length === 0 && data.products.length === 0 && (
        <div className="mb-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white mb-2">Welcome to CORA AI</h2>
          <p className="text-sm text-slate-400 mb-4">Your dashboard is empty. Start by adding your business data — CORA will analyze it automatically.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => onNavigate('manage')} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors text-left">
              <Package className="w-5 h-5 text-blue-400 shrink-0" />
              <div><div className="text-sm font-medium text-white">Add your first product</div><div className="text-xs text-slate-500">Products you sell or offer</div></div>
            </button>
            <button onClick={() => onNavigate('manage')} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors text-left">
              <UserPlus className="w-5 h-5 text-cyan-400 shrink-0" />
              <div><div className="text-sm font-medium text-white">Add your first customer</div><div className="text-xs text-slate-500">People who buy from you</div></div>
            </button>
            <button onClick={() => onNavigate('manage')} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors text-left">
              <ClipboardList className="w-5 h-5 text-emerald-400 shrink-0" />
              <div><div className="text-sm font-medium text-white">Record your first sale</div><div className="text-xs text-slate-500">Log a transaction</div></div>
            </button>
            <button onClick={() => onNavigate('manage')} className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors text-left">
              <Receipt className="w-5 h-5 text-amber-400 shrink-0" />
              <div><div className="text-sm font-medium text-white">Add your first expense</div><div className="text-xs text-slate-500">Track your costs</div></div>
            </button>
          </div>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPICard label="Revenue (Month)" value={formatRWF(kpis.monthlyRevenue)} change={kpis.revenueChange} icon={<DollarSign className="w-4 h-4" />} accent="blue" />
        <KPICard label="Expenses (Month)" value={formatRWF(kpis.totalExpenses)} change={kpis.expenseChange} icon={<Wallet className="w-4 h-4" />} accent="red" />
        <KPICard label="Est. Profit" value={formatRWF(kpis.estimatedProfit)} change={kpis.profitChange} icon={<TrendingUp className="w-4 h-4" />} accent="green" subtitle={`Margin: ${kpis.profitMargin.toFixed(1)}%`} />
        <KPICard label="Customers" value={String(kpis.customerCount)} change={kpis.customerGrowth} icon={<Users className="w-4 h-4" />} accent="cyan" />
        <KPICard label="Sales (Month)" value={String(kpis.salesThisMonth)} icon={<ShoppingCart className="w-4 h-4" />} accent="blue" />
        <KPICard label="Outstanding" value={formatRWF(kpis.outstandingAmount)} icon={<FileText className="w-4 h-4" />} accent="amber" subtitle={`${kpis.outstandingInvoices} invoices`} />
        <KPICard label="Overdue" value={formatRWF(kpis.overdueAmount)} icon={<AlertTriangle className="w-4 h-4" />} accent="red" subtitle={`${kpis.overdueInvoices} invoices`} />
        <KPICard label="Profit Margin" value={`${kpis.profitMargin.toFixed(1)}%`} change={kpis.profitChange} icon={<TrendingUp className="w-4 h-4" />} accent="green" />
      </div>

      {/* Alert banner */}
      {kpis.overdueInvoices > 0 && (
        <button
          onClick={() => onNavigate('recovery')}
          className="w-full flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 hover:bg-red-500/15 transition-colors text-left"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-red-300">{kpis.overdueInvoices} overdue invoice{kpis.overdueInvoices === 1 ? '' : 's'} totaling {formatRWF(kpis.overdueAmount)}</div>
            <div className="text-xs text-red-400/70">Tap to send payment reminders</div>
          </div>
          <ArrowRight className="w-4 h-4 text-red-400 shrink-0" />
        </button>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <ChartCard title="Revenue Trend" action={<span className="text-xs text-emerald-400 font-medium">{formatPct(kpis.revenueChange)}</span>}>
          <LineChart data={revenueData} color="#3b82f6" formatY={(n) => formatCompact(n)} />
        </ChartCard>
        <ChartCard title="Expenses Trend" action={<span className="text-xs text-red-400 font-medium">{formatPct(kpis.expenseChange)}</span>}>
          <LineChart data={expenseData} color="#ef4444" formatY={(n) => formatCompact(n)} />
        </ChartCard>
        <ChartCard title="Profit Trend" action={<span className="text-xs font-medium text-slate-400">{formatPct(kpis.profitChange)}</span>}>
          <LineChart data={profitData} color="#10b981" formatY={(n) => formatCompact(n)} />
        </ChartCard>
        <ChartCard title="Customer Growth">
          <BarChart data={customerData} color="#06b6d4" height={180} formatValue={(n) => String(n)} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <ChartCard title="Revenue by Product">
          <BarChart
            data={products.map((p) => ({ label: p.product, value: p.revenue, color: '#3b82f6' }))}
            horizontal
            formatValue={(n) => formatRWF(n)}
          />
        </ChartCard>
        <ChartCard title="Expenses by Category">
          <DonutChart data={expenseDonut} centerLabel="Total" centerValue={formatCompact(expenses.reduce((s, e) => s + e.amount, 0))} />
        </ChartCard>
      </div>

      {/* Recent transactions */}
      <ChartCard title="Recent Transactions">
        <div className="space-y-2">
          {recent.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${tx.type === 'sale' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200 truncate">{tx.description}</div>
                <div className="text-xs text-slate-500">{formatShortDate(tx.date)}</div>
              </div>
              <div className={`text-sm font-medium tabular-nums shrink-0 ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {tx.amount >= 0 ? '+' : ''}{formatRWF(Math.abs(tx.amount))}
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
