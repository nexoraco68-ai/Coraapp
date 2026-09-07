import { Shield, Bot, Database, Info, Check, X } from 'lucide-react';
import { sharedOSAdapter } from '@/lib/permissions';

interface SettingsPageProps {
  isDemo: boolean;
  businessName: string;
}

export function SettingsPage({ isDemo, businessName }: SettingsPageProps) {
  const aiApiConfigured = !!(import.meta.env.VITE_AI_API_KEY as string | undefined);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-slate-400">System configuration, AI integration, and security architecture.</p>
      </div>

      <div className="mb-6 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">Business Context</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Active Business</div>
            <div className="text-sm text-slate-200">{businessName}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Mode</div>
            <div className="text-sm text-slate-200">{isDemo ? 'Demo Data' : 'Real Business Data'}</div>
          </div>
        </div>
        {isDemo && (
          <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
            Demo mode: All data is pre-seeded sample data. No real business results are being shown.
          </div>
        )}
      </div>

      <div className="mb-6 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">AI Model Configuration</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
            <div className="min-w-0">
              <div className="text-sm text-slate-200">Foundation Model API</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {aiApiConfigured
                  ? 'API key detected via VITE_AI_API_KEY environment variable.'
                  : 'No API key configured. Agents use built-in rule-based analysis. Set VITE_AI_API_KEY to connect a foundation model.'}
              </div>
            </div>
            {aiApiConfigured ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium shrink-0">
                <Check className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-400 rounded-full text-[10px] font-medium shrink-0">
                <X className="w-3 h-3" /> Not Connected
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 leading-relaxed">
            CORA's agents currently use structured rule-based analysis over your business data. The architecture is designed so a
            foundation model (OpenAI, Anthropic, etc.) can be connected by setting the VITE_AI_API_KEY environment variable.
            API keys are never exposed in frontend code — all AI calls should be proxied through a server-side endpoint.
          </div>
        </div>
      </div>

      <div className="mb-6 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">Security Architecture</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
            <div className="text-sm text-slate-200">Permission Model</div>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium">
              <Check className="w-3 h-3" /> Deny by Default
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
            <div className="text-sm text-slate-200">SharedOS SDK</div>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-medium">
              Adapter Ready · Not Connected
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
            <div className="text-sm text-slate-200">Human Approval Required</div>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium">
              <Check className="w-3 h-3" /> Enabled
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
            <div className="text-sm text-slate-200">Context Filtering</div>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium">
              <Check className="w-3 h-3" /> Per-Agent
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 leading-relaxed">
          CORA does not fabricate AI capabilities. Agent analysis is based on structured business data and rule-based reasoning.
          No fake API calls or SharedOS authorizations are simulated. Actions labeled "Prototype" or "Simulation" cannot actually
          execute externally — they demonstrate the approval workflow without sending real messages or payments.
        </div>
      </div>
    </div>
  );
}
