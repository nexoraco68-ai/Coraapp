import { Crown, Wallet, TrendingUp, MessageSquare, Shield, Check, X, Clock, Activity } from 'lucide-react';
import type { BusinessData } from '@/lib/types';
import type { OrchestrationResult } from '@/lib/orchestrator';
import { getAgentStatuses } from '@/lib/orchestrator';
import { AGENT_DEFINITIONS, type AgentId } from '@/lib/permissions';
import type { PageId } from '@/components/Layout';

interface AITeamPageProps {
  data: BusinessData;
  lastResult?: OrchestrationResult;
  onNavigate: (page: PageId) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Crown: <Crown className="w-5 h-5" />,
  Wallet: <Wallet className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  MessageSquare: <MessageSquare className="w-5 h-5" />,
};

const accentMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  ceo: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  cfo: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  sales: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  assistant: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
};

export function AITeamPage({ data, lastResult, onNavigate }: AITeamPageProps) {
  const statuses = getAgentStatuses(data, lastResult);
  const agentIds: AgentId[] = ['ceo', 'cfo', 'sales', 'assistant'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pb-20 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">AI Team</h1>
        <p className="text-sm text-slate-400">Your permissioned AI business team — each agent has specialized access and responsibilities.</p>
      </div>

      <div className="mb-6 p-5 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/15 rounded-xl shrink-0">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white mb-1">CORA Orchestrator</div>
            <div className="text-xs text-slate-400 leading-relaxed">
              Routes user questions to specialist agents, enforces permission checks before each agent accesses business data,
              combines results, and requests human approval before any external action.
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-medium text-emerald-400">
                <Check className="w-3 h-3" /> Deny by Default
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-medium text-blue-400">
                <Shield className="w-3 h-3" /> SharedOS Adapter
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agentIds.map((agentId) => {
          const agent = AGENT_DEFINITIONS[agentId];
          const status = statuses.find((s) => s.agent === agentId)!;
          const c = accentMap[agentId];

          return (
            <div key={agentId} className={`p-5 bg-slate-900/60 border ${c.border} rounded-2xl`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 ${c.bg} rounded-xl`}>
                    {iconMap[agent.icon]}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">{agent.name}</div>
                    <div className="text-xs text-slate-500">{agent.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${status.status === 'done' ? 'bg-emerald-400' : status.status === 'analyzing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                    {status.status === 'done' ? 'Ready' : status.status === 'analyzing' ? 'Working' : 'Idle'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{agent.description}</p>

              <div className="mb-4">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Responsibilities</div>
                <ul className="space-y-1">
                  {agent.responsibilities.map((r, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <div className={`w-1 h-1 rounded-full ${c.dot} mt-1.5 shrink-0`} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Allowed
                  </div>
                  <div className="space-y-1">
                    {agent.permissions.filter((p) => p.allowed).map((p, i) => (
                      <div key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p.resource.replace(/_/g, ' ')} · {p.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <X className="w-3 h-3" /> Denied
                  </div>
                  <div className="space-y-1">
                    {agent.permissions.filter((p) => !p.allowed).slice(0, 5).map((p, i) => (
                      <div key={i} className="text-[10px] text-slate-500 flex items-start gap-1.5">
                        <X className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                        <span>{p.resource.replace(/_/g, ' ')} · {p.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Current Task</span>
                </div>
                <div className="text-xs text-slate-300">{status.currentTask}</div>
                {status.recentActivity !== 'No recent activity' && (
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {status.recentActivity}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl text-center">
        <p className="text-sm text-slate-400 mb-3">Ask CORA a question to see the agents collaborate in real time.</p>
        <button
          onClick={() => onNavigate('ask')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Ask CORA
        </button>
      </div>
    </div>
  );
}
