import { TrendingUp, Users, Phone, Star, AlertCircle, ArrowRight } from 'lucide-react';
import type { BusinessData } from '@/lib/types';
import { getSalesAnalysis } from '@/lib/ai';
import { formatRWF, formatDate, daysSince } from '@/lib/format';
import { ChartCard } from '@/components/ChartCard';
import { BarChart } from '@/components/BarChart';
import type { PageId } from '@/components/Layout';

interface SalesPageProps {
  data: BusinessData;
  onNavigate: (page: PageId) => void;
}

export function SalesPage({ data, onNavigate }: SalesPageProps) {
  const analysis = getSalesAnalysis(data);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-20 md:pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-500/10 rounded-xl">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">CORA Sales</h1>
          <p className="text-sm text-slate-400">Growth & Pipeline</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Revenue</div>
          <div className="text-xl font-bold text-white">{formatRWF(analysis.totalRevenue)}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Best Customers</div>
          <div className="text-xl font-bold text-white">{analysis.bestCustomers.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Inactive</div>
          <div className="text-xl font-bold text-amber-400">{analysis.inactiveCustomers.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">To Contact</div>
          <div className="text-xl font-bold text-red-400">{analysis.customersToContact.length}</div>
        </div>
      </div>

      {/* Top products */}
      <ChartCard title="Best-Selling Products" className="mb-6">
        <BarChart
          data={analysis.topProducts.map((p) => ({ label: p.product, value: p.revenue, color: '#10b981' }))}
          horizontal
          formatValue={(n) => formatRWF(n)}
        />
      </ChartCard>

      {/* Declining products */}
      {analysis.decliningProducts.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-sm text-amber-300">
            <span className="font-medium">Declining products:</span> {analysis.decliningProducts.join(', ')} — revenue dropped significantly vs last month.
          </div>
        </div>
      )}

      {/* Best customers */}
      <ChartCard title="Best Customers" className="mb-6">
        <div className="space-y-2">
          {analysis.bestCustomers.map((c, i) => (
            <div key={c.customer.id} className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{c.customer.name}</div>
                <div className="text-xs text-slate-500">{c.purchaseCount} purchases · {c.customer.phone}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-white tabular-nums">{formatRWF(c.totalSpent)}</div>
                {c.isHighValue && <Star className="w-3 h-3 text-amber-400 ml-auto mt-0.5" />}
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Customers to Contact */}
      <ChartCard title="Customers to Contact" className="mb-6">
        <div className="space-y-3">
          {analysis.customersToContact.length === 0 ? (
            <div className="text-sm text-slate-500 py-4 text-center">No customers need contacting right now.</div>
          ) : (
            analysis.customersToContact.map((c) => (
              <div key={c.customer.id} className="p-4 bg-slate-800/40 rounded-xl">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white">{c.customer.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {c.customer.phone}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-white tabular-nums">{formatRWF(c.totalValue)}</div>
                    <div className="text-xs text-slate-500">
                      {c.lastPurchase ? `${daysSince(c.lastPurchase)} days ago` : 'No purchases'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-amber-400 font-medium">{c.reason}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.action}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ChartCard>

      {/* Inactive customers */}
      {analysis.inactiveCustomers.length > 0 && (
        <ChartCard title={`Inactive Customers (${analysis.inactiveCustomers.length})`}>
          <div className="space-y-2">
            {analysis.inactiveCustomers.map((c) => (
              <div key={c.customer.id} className="flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0">
                <Users className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-200 truncate">{c.customer.name}</div>
                  <div className="text-xs text-slate-500">Last: {c.lastPurchaseDate ? formatDate(c.lastPurchaseDate) : 'Never'} · {formatRWF(c.totalSpent)} lifetime</div>
                </div>
                <div className="text-xs text-amber-400 font-medium shrink-0">{c.daysSinceLastPurchase}d</div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* CTA to payment recovery */}
      <button
        onClick={() => onNavigate('recovery')}
        className="w-full flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mt-6 hover:bg-blue-500/15 transition-colors text-left"
      >
        <ArrowRight className="w-5 h-5 text-blue-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-blue-300">Go to Payment Recovery</div>
          <div className="text-xs text-blue-400/70">Send reminders to customers with outstanding balances</div>
        </div>
      </button>
    </div>
  );
}
