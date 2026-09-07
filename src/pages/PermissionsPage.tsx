import { Shield, Check, X, Lock, Crown, Wallet, TrendingUp, MessageSquare, Info } from 'lucide-react';
import { getFullPermissionMatrix, AGENT_DEFINITIONS, RESOURCE_LABELS, sharedOSAdapter, type AgentId, type PermissionMatrixEntry } from '@/lib/permissions';

const agentIcons: Record<string, React.ReactNode> = {
  ceo: <Crown className="w-4 h-4" />,
  cfo: <Wallet className="w-4 h-4" />,
  sales: <TrendingUp className="w-4 h-4" />,
  assistant: <MessageSquare className="w-4 h-4" />,
};

const agentColors: Record<string, string> = {
  ceo: 'text-amber-400',
  cfo: 'text-blue-400',
  sales: 'text-emerald-400',
  assistant: 'text-cyan-400',
};

export function PermissionsPage() {
  const matrix = getFullPermissionMatrix();
  const agents: AgentId[] = ['cfo', 'sales', 'ceo', 'assistant'];
  const resourceKeys = Array.from(new Set(matrix.map((e) => `${e.resource}:${e.action}`)));

  const byAgent: Record<string, PermissionMatrixEntry[]> = {};
  for (const agent of agents) {
    byAgent[agent] = matrix.filter((e) => e.agent === agent);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pb-20 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Security & Permissions</h1>
        <p className="text-sm text-slate-400">Each agent has explicit capabilities. Access is denied by default unless explicitly granted.</p>
      </div>

      <div className="mb-6 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">SharedOS Integration Adapter</div>
            <div className="text-xs text-slate-400 mt-1">
              Status: <span className="text-amber-400 font-medium">Local Policy Mode</span> — no external SDK connected.
              The adapter provides a clean interface that mirrors the SharedOS permission-check architecture.
              When the real SharedOS SDK is installed, the local policy checks will be replaced with actual SDK authorization calls.
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded-full text-[10px] font-medium text-slate-400">
                <Lock className="w-2.5 h-2.5" /> Source: {sharedOSAdapter.isSDKConnected ? 'sharedos-sdk' : 'local-policy'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-medium text-emerald-400">
                <Check className="w-2.5 h-2.5" /> Deny by Default
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Resource</th>
                  {agents.map((agent) => (
                    <th key={agent} className="text-center px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={agentColors[agent]}>{agentIcons[agent]}</span>
                        <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide">{AGENT_DEFINITIONS[agent].name.replace('CORA ', '')}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resourceKeys.map((key) => {
                  const [resource, action] = key.split(':');
                  const label = RESOURCE_LABELS[resource] ?? resource.replace(/_/g, ' ');
                  return (
                    <tr key={key} className="border-b border-slate-800/50 last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="text-xs text-slate-300">{label}</div>
                        <div className="text-[9px] text-slate-600 uppercase">{action}</div>
                      </td>
                      {agents.map((agent) => {
                        const entry = matrix.find((e) => e.agent === agent && e.resource === resource && e.action === action);
                        const allowed = entry?.status === 'ALLOWED';
                        return (
                          <td key={agent} className="text-center px-4 py-2.5">
                            {allowed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-medium">
                                <Check className="w-2.5 h-2.5" /> Allow
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-[9px] font-medium">
                                <X className="w-2.5 h-2.5" /> Deny
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const def = AGENT_DEFINITIONS[agent];
          const entries = byAgent[agent];
          const allowed = entries.filter((e) => e.status === 'ALLOWED');
          const denied = entries.filter((e) => e.status === 'DENIED');

          return (
            <div key={agent} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className={agentColors[agent]}>{agentIcons[agent]}</span>
                <span className="text-sm font-semibold text-white">{def.name}</span>
                <span className="text-[10px] text-slate-500 ml-auto">{allowed.length} allowed · {denied.length} denied</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Allow
                  </div>
                  <div className="space-y-1">
                    {allowed.map((e) => (
                      <div key={`${e.resource}-${e.action}`} className="text-[10px] text-slate-400">
                        {RESOURCE_LABELS[e.resource] ?? e.resource.replace(/_/g, ' ')} · {e.action}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-red-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <X className="w-3 h-3" /> Deny
                  </div>
                  <div className="space-y-1">
                    {denied.slice(0, 8).map((e) => (
                      <div key={`${e.resource}-${e.action}`} className="text-[10px] text-slate-500">
                        {RESOURCE_LABELS[e.resource] ?? e.resource.replace(/_/g, ' ')} · {e.action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 leading-relaxed">
          CORA's permission system follows a deny-by-default model. No agent automatically receives access to every business record or tool.
          Each permission is explicitly defined, and the SharedOS adapter checks access before every agent operation. Sensitive actions
          (sending messages, executing payments, modifying records) always require human approval.
        </div>
      </div>
    </div>
  );
}
