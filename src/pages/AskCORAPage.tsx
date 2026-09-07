import { useState, useRef, useEffect } from 'react';
import { Send, Check, X, Shield, Crown, Wallet, TrendingUp, MessageSquare, AlertTriangle, FileText, ChevronRight, Loader2 } from 'lucide-react';
import type { BusinessData } from '@/lib/types';
import { orchestrate, type OrchestrationResult, type ProposedAction } from '@/lib/orchestrator';
import { AGENT_DEFINITIONS, type AgentId } from '@/lib/permissions';
import type { PageId } from '@/components/Layout';

interface AskCORAPageProps {
  data: BusinessData;
  onNavigate: (page: PageId) => void;
  onOrchestrationComplete?: (result: OrchestrationResult) => void;
}

const agentIcons: Record<string, React.ReactNode> = {
  ceo: <Crown className="w-4 h-4" />,
  cfo: <Wallet className="w-4 h-4" />,
  sales: <TrendingUp className="w-4 h-4" />,
  assistant: <MessageSquare className="w-4 h-4" />,
};

const agentColors: Record<string, string> = {
  ceo: 'text-amber-400 bg-amber-500/10',
  cfo: 'text-blue-400 bg-blue-500/10',
  sales: 'text-emerald-400 bg-emerald-500/10',
  assistant: 'text-cyan-400 bg-cyan-500/10',
};

const suggestedQueries = [
  'What should I do about my business today?',
  'What is causing my business cash pressure?',
  'Which customers should I follow up with?',
  'How is my business doing?',
];

export function AskCORAPage({ data, onNavigate, onOrchestrationComplete }: AskCORAPageProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [actionStates, setActionStates] = useState<Record<string, 'pending_approval' | 'approved' | 'rejected'>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAsk = (q: string) => {
    if (!q.trim() || running) return;
    setQuery(q);
    setRunning(true);
    setResult(null);
    setVisibleSteps(0);

    setTimeout(() => {
      const res = orchestrate(q, data);
      setResult(res);

      const states: Record<string, 'pending_approval' | 'approved' | 'rejected'> = {};
      for (const a of res.approvalActions) {
        states[a.id] = 'pending_approval';
      }
      setActionStates(states);
      setRunning(false);

      if (onOrchestrationComplete) onOrchestrationComplete(res);

      let step = 0;
      const interval = setInterval(() => {
        step++;
        setVisibleSteps(step);
        if (step >= res.steps.length + 1) {
          clearInterval(interval);
        }
      }, 600);
    }, 400);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result, visibleSteps, running]);

  const handleApprove = (actionId: string) => {
    setActionStates((prev) => ({ ...prev, [actionId]: 'approved' }));
  };

  const handleReject = (actionId: string) => {
    setActionStates((prev) => ({ ...prev, [actionId]: 'rejected' }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Ask CORA</h1>
        <p className="text-sm text-slate-400">Your question is routed to specialist agents. Each only sees data it is authorized to access.</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk(query)}
            placeholder="Ask a business question..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            disabled={running}
          />
          <button
            onClick={() => handleAsk(query)}
            disabled={running || !query.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ask
          </button>
        </div>

        {!result && !running && (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestedQueries.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {(running || result) && (
        <div ref={scrollRef} className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-slate-900/40 border border-slate-800 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">You</div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="text-sm text-slate-200">{query}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
            <div className="p-1.5 bg-blue-500/15 rounded-lg shrink-0">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="text-xs font-medium text-blue-400">CORA Orchestrator</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {running ? 'Analyzing your question and routing to specialist agents...' : 'Routed to specialist agents based on your question.'}
              </div>
            </div>
          </div>

          {result && result.steps.slice(0, visibleSteps).map((step) => {
            const def = AGENT_DEFINITIONS[step.agent as AgentId];
            return (
              <div key={step.id} className="flex items-start gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl animate-fade-in">
                <div className={`p-2 rounded-lg shrink-0 ${agentColors[step.agent]}`}>
                  {agentIcons[step.agent]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{def.name}</span>
                    {step.status === 'done' && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400">
                        <Check className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">{step.task}</div>

                  {step.permissionChecks.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {step.permissionChecks.map((check, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${
                            check.granted
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {check.granted ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                          {check.resource.replace(/_/g, ' ')} · {check.action}
                        </span>
                      ))}
                    </div>
                  )}

                  {step.result && (
                    <div className="space-y-2">
                      <div className="text-xs text-slate-300 bg-slate-800/40 rounded-lg p-2.5">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Summary</div>
                        {step.result.summary}
                      </div>
                      {step.result.insights.length > 0 && (
                        <div className="text-xs text-slate-300 bg-slate-800/40 rounded-lg p-2.5">
                          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Insights</div>
                          <ul className="space-y-1">
                            {step.result.insights.map((insight, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <ChevronRight className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {step.result.evidence && (
                        <div className="text-[10px] text-slate-500 bg-slate-900/40 rounded-lg p-2 border border-slate-800">
                          <span className="font-semibold">Evidence:</span> {step.result.evidence}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {result && visibleSteps >= result.steps.length && (
            <div className="p-5 bg-gradient-to-r from-blue-900/30 to-slate-900 border border-blue-500/20 rounded-2xl animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-500/15 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-white">CORA Priority Report</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">Today's Top Priority</div>
                  <div className="text-base font-medium text-white">{result.finalRecommendation.topPriority}</div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Why?</div>
                  <div className="text-sm text-slate-300">{result.finalRecommendation.why}</div>
                </div>

                {result.finalRecommendation.agentInsights.map((insight, i) => (
                  <div key={i}>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{insight.agentName} Insight</div>
                    <div className="text-sm text-slate-300">{insight.insight}</div>
                  </div>
                ))}

                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Recommended Action</div>
                  <div className="text-sm text-slate-300">{result.finalRecommendation.recommendedAction}</div>
                </div>

                {result.approvalActions.length > 0 && (
                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-400">Approval Required</span>
                    </div>
                    {result.approvalActions.map((action) => (
                      <ApprovalCard
                        key={action.id}
                        action={action}
                        state={actionStates[action.id] ?? 'pending_approval'}
                        onApprove={() => handleApprove(action.id)}
                        onReject={() => handleReject(action.id)}
                      />
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700/50">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Agent Collaboration</div>
                  <div className="space-y-1">
                    {result.steps.filter((s) => s.status === 'done').map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-xs text-slate-400">
                        <Check className="w-3 h-3 text-emerald-400" />
                        {s.agentName} analyzed {s.agent === 'cfo' ? 'financial information' : s.agent === 'sales' ? 'customer information' : 'combined findings'}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3 h-3 text-emerald-400" />
                      CORA generated final recommendation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {running && !result && (
            <div className="flex items-center gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-sm text-slate-400">Orchestrating agent collaboration...</span>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div className="mt-6 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-500 leading-relaxed">
              Each agent only receives data it is explicitly authorized to access. The CFO sees financials but not customer contact details.
              Sales sees customers but not full financial records. The CEO reads agent summaries, not raw data. Actions requiring external
              execution (sending messages, payments) require your approval. <span className="text-blue-400">SharedOS adapter: local-policy mode</span> —
              no external SDK connected.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ action, state, onApprove, onReject }: {
  action: ProposedAction;
  state: 'pending_approval' | 'approved' | 'rejected';
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="p-3 bg-slate-800/40 border border-slate-700 rounded-xl mb-2">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-white">{action.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{action.description}</div>
        </div>
        {action.simulation && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full text-[9px] font-medium shrink-0">
            <FileText className="w-2.5 h-2.5" /> Prototype
          </span>
        )}
      </div>

      {state === 'pending_approval' && (
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-2 bg-slate-700 hover:bg-red-600 text-slate-200 hover:text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      )}
      {state === 'approved' && (
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <Check className="w-3.5 h-3.5" />
          Approved. {action.simulation && 'Simulation — external integration not connected. No message was actually sent.'}
        </div>
      )}
      {state === 'rejected' && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <X className="w-3.5 h-3.5" />
          Rejected. Action will not be executed.
        </div>
      )}
    </div>
  );
}
