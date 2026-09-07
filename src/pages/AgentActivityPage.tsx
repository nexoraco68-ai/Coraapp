import { Clock, Check, Shield, Crown, Wallet, TrendingUp, MessageSquare, Activity, FileText } from 'lucide-react';
import type { BusinessData } from '@/lib/types';
import type { OrchestrationResult } from '@/lib/orchestrator';
import { generateActivityLog, type ActivityEntry } from '@/lib/orchestrator';

interface AgentActivityPageProps {
  data: BusinessData;
  lastResult?: OrchestrationResult;
}

const agentIcons: Record<string, React.ReactNode> = {
  ceo: <Crown className="w-3.5 h-3.5" />,
  cfo: <Wallet className="w-3.5 h-3.5" />,
  sales: <TrendingUp className="w-3.5 h-3.5" />,
  assistant: <MessageSquare className="w-3.5 h-3.5" />,
};

const typeColors: Record<string, string> = {
  analysis: 'text-blue-400 bg-blue-500/10',
  permission_check: 'text-amber-400 bg-amber-500/10',
  recommendation: 'text-emerald-400 bg-emerald-500/10',
  approval: 'text-purple-400 bg-purple-500/10',
  collaboration: 'text-cyan-400 bg-cyan-500/10',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function AgentActivityPage({ data, lastResult }: AgentActivityPageProps) {
  const entries: ActivityEntry[] = lastResult ? generateActivityLog(lastResult) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Agent Activity</h1>
        <p className="text-sm text-slate-400">Timeline of agent collaboration, permission checks, and recommendations.</p>
      </div>

      {entries.length === 0 ? (
        <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-2xl text-center">
          <Activity className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-medium text-slate-400">No agent activity yet</div>
          <div className="text-xs text-slate-500 mt-1">Ask CORA a question to see agents collaborate in real time.</div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-800" />

          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="relative flex items-start gap-4 pl-0">
                <div className={`relative z-10 p-1.5 rounded-full ${typeColors[entry.type] ?? 'bg-slate-800 text-slate-400'} shrink-0`}>
                  {entry.type === 'permission_check' ? (
                    <Shield className="w-3 h-3" />
                  ) : entry.type === 'approval' ? (
                    <FileText className="w-3 h-3" />
                  ) : entry.type === 'recommendation' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    agentIcons[entry.agent] ?? <Check className="w-3 h-3" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-white">{entry.agentName}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">{entry.action}</div>
                  <div className={`text-[10px] mt-0.5 ${
                    entry.detail === 'ALLOWED' ? 'text-emerald-400' :
                    entry.detail === 'DENIED' ? 'text-red-400' :
                    entry.detail.includes('Simulation') ? 'text-amber-400' :
                    'text-slate-500'
                  }`}>
                    {entry.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-center">
            <div className="text-lg font-bold text-white">{entries.filter((e) => e.type === 'analysis').length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Analyses</div>
          </div>
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-center">
            <div className="text-lg font-bold text-white">{entries.filter((e) => e.type === 'permission_check').length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Permission Checks</div>
          </div>
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-center">
            <div className="text-lg font-bold text-white">{entries.filter((e) => e.type === 'approval').length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Approval Actions</div>
          </div>
        </div>
      )}
    </div>
  );
}
