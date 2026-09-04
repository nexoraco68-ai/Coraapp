import { Crown, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import type { BusinessData } from '@/lib/types';
import { getCEODiagnosis, getWeeklyPriorities } from '@/lib/ai';
import { ChartCard } from '@/components/ChartCard';
import type { PageId } from '@/components/Layout';

interface CEOPageProps {
  data: BusinessData;
  onNavigate: (page: PageId) => void;
}

export function CEOPage({ data, onNavigate }: CEOPageProps) {
  const diagnosis = getCEODiagnosis(data);
  const priorities = getWeeklyPriorities(data);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-amber-500/10 rounded-xl">
          <Crown className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">CORA CEO</h1>
          <p className="text-sm text-slate-400">Strategy & Priorities</p>
        </div>
      </div>

      {/* Business Diagnosis */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Business Diagnosis</h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-medium text-amber-400 uppercase tracking-wide mb-1.5">What is happening?</div>
            <div className="text-base text-white font-medium">{diagnosis.what}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Evidence</div>
            <div className="text-sm text-slate-300">{diagnosis.evidence}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Likely cause</div>
            <div className="text-sm text-slate-300">{diagnosis.cause}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-red-400 uppercase tracking-wide mb-1.5">Business impact</div>
            <div className="text-sm text-slate-300">{diagnosis.impact}</div>
          </div>
          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wide mb-1.5">Recommended action</div>
            <div className="text-sm text-white font-medium">{diagnosis.action}</div>
          </div>
        </div>
      </div>

      {/* Weekly Priorities */}
      <ChartCard title="Weekly Priorities">
        <div className="space-y-3">
          {priorities.map((p) => (
            <div key={p.rank} className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 text-sm font-bold shrink-0">
                {p.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{p.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{p.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <button
          onClick={() => onNavigate('cfo')}
          className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors text-left"
        >
          <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">See CFO Analysis</div>
            <div className="text-xs text-slate-500">Understand the money</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
        </button>
        <button
          onClick={() => onNavigate('sales')}
          className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors text-left"
        >
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">See Sales Opportunities</div>
            <div className="text-xs text-slate-500">Find growth</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
        </button>
        <button
          onClick={() => onNavigate('assistant')}
          className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors text-left"
        >
          <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">Ask CORA</div>
            <div className="text-xs text-slate-500">Get an action plan</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
        </button>
      </div>
    </div>
  );
}
