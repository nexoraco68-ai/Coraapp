import { Crown, Wallet, TrendingUp, MessageSquare, ArrowRight, Notebook, Smartphone, FileSpreadsheet, Receipt, Building2, Play } from 'lucide-react';
import type { PageId } from '@/components/Layout';
import { Logo } from '@/components/Logo';

interface LandingProps {
  onNavigate: (page: PageId) => void;
  onSetup: () => void;
  onTryDemo: () => void;
}

export function Landing({ onNavigate, onSetup, onTryDemo }: LandingProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Logo size={40} />
          <button
            onClick={onTryDemo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Launch Demo
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-400 mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              AI Hackathon Demo · Ready
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 animate-slide-up">
              Your AI Business Team.<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Always on. Always thinking.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              CORA AI turns scattered business information into clear decisions. Your CEO, CFO, and Sales team — powered by AI — working 24/7 to grow your business.
            </p>

            {/* Two-path entry */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={onSetup}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" /> Create My Business
              </button>
              <button
                onClick={onTryDemo}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Try Demo
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Create your own business to enter real data, or try the demo to see CORA in action.
            </p>
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="py-16 sm:py-20 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Most small businesses are run on memory, not information.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Business owners have their information scattered everywhere. CORA brings it together and turns it into decisions.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Notebook className="w-6 h-6" />, label: 'Notebooks' },
              { icon: <Smartphone className="w-6 h-6" />, label: 'WhatsApp messages' },
              { icon: <FileSpreadsheet className="w-6 h-6" />, label: 'Spreadsheets' },
              { icon: <Receipt className="w-6 h-6" />, label: 'Paper receipts' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center">
                <div className="inline-flex p-3 bg-slate-800 rounded-xl text-slate-400 mb-3">{item.icon}</div>
                <div className="text-sm font-medium text-slate-300">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="h-px w-12 bg-slate-700" />
            <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">CORA turns this into</span>
            <div className="h-px w-12 bg-slate-700" />
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white">Decisions.</div>
          </div>
        </div>
      </section>

      {/* Product story */}
      <section className="py-16 sm:py-20 border-t border-slate-800/60 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12 text-center">Meet your AI executive team</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              { icon: <Crown className="w-6 h-6" />, role: 'CORA CEO', desc: 'Finds the business problem. Analyzes everything and tells you what to prioritize.', page: 'ceo' as PageId, color: 'text-amber-400 bg-amber-500/10' },
              { icon: <Wallet className="w-6 h-6" />, role: 'CORA CFO', desc: 'Explains the money. Detects where cash is leaking and margins are shrinking.', page: 'cfo' as PageId, color: 'text-blue-400 bg-blue-500/10' },
              { icon: <TrendingUp className="w-6 h-6" />, role: 'CORA Sales', desc: 'Finds the opportunity. Identifies who to contact and which products to push.', page: 'sales' as PageId, color: 'text-emerald-400 bg-emerald-500/10' },
              { icon: <MessageSquare className="w-6 h-6" />, role: 'CORA Assistant', desc: 'Ask anything. Get clear, data-driven answers in natural language.', page: 'assistant' as PageId, color: 'text-cyan-400 bg-cyan-500/10' },
            ].map((member, i) => (
              <button
                key={i}
                onClick={() => onNavigate(member.page)}
                className="w-full flex items-start gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors text-left group"
              >
                <div className={`p-3 rounded-xl shrink-0 ${member.color}`}>{member.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white mb-1">{member.role}</div>
                  <div className="text-sm text-slate-400">{member.desc}</div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 border-t border-slate-800/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to see it in action?</h2>
          <p className="text-slate-400 mb-8">Set up your own business or try the demo with realistic data.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onSetup}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Create My Business <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Launch Demo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-xs text-slate-500">CORA AI — Your AI Business Team. Built for the AI Hackathon.</div>
        </div>
      </footer>
    </div>
  );
}
