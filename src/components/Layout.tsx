import { type ReactNode, useState } from 'react';
import { LayoutDashboard, Crown, Wallet, TrendingUp, MessageSquare, Bell, Menu, X, Plus, Users, Shield, Activity, Settings } from 'lucide-react';
import { Logo } from './Logo';

export type PageId = 'landing' | 'dashboard' | 'manage' | 'ai-team' | 'ask' | 'activity' | 'permissions' | 'settings' | 'ceo' | 'cfo' | 'sales' | 'assistant' | 'recovery';

interface NavItem {
  id: PageId;
  label: string;
  icon: ReactNode;
  short: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, short: 'Home' },
  { id: 'manage', label: 'Business Profile', icon: <Plus className="w-5 h-5" />, short: 'Profile' },
  { id: 'ai-team', label: 'AI Team', icon: <Users className="w-5 h-5" />, short: 'Team' },
  { id: 'ask', label: 'Ask CORA', icon: <MessageSquare className="w-5 h-5" />, short: 'Ask' },
  { id: 'activity', label: 'Agent Activity', icon: <Activity className="w-5 h-5" />, short: 'Activity' },
  { id: 'permissions', label: 'Permissions', icon: <Shield className="w-5 h-5" />, short: 'Perms' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, short: 'Settings' },
];

const agentNavItems: NavItem[] = [
  { id: 'ceo', label: 'CORA CEO', icon: <Crown className="w-5 h-5" />, short: 'CEO' },
  { id: 'cfo', label: 'CORA CFO', icon: <Wallet className="w-5 h-5" />, short: 'CFO' },
  { id: 'sales', label: 'CORA Sales', icon: <TrendingUp className="w-5 h-5" />, short: 'Sales' },
  { id: 'assistant', label: 'CORA Assistant', icon: <MessageSquare className="w-5 h-5" />, short: 'Ask' },
  { id: 'recovery', label: 'Payment Recovery', icon: <Bell className="w-5 h-5" />, short: 'Collect' },
];

interface LayoutProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
  alertCount?: number;
  businessName?: string;
  isDemo?: boolean;
  onSwitchBusiness?: () => void;
}

export function Layout({ current, onNavigate, children, alertCount = 0, businessName, isDemo, onSwitchBusiness }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: PageId) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 border-r border-slate-800 bg-slate-900/40 shrink-0">
        <div className="p-5 border-b border-slate-800">
          <button onClick={() => handleNav('landing')}>
            <Logo size={40} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                current === item.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="pt-3 pb-1 px-3">
            <div className="text-[9px] font-semibold text-slate-600 uppercase tracking-widest">Specialist Agents</div>
          </div>

          {agentNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                current === item.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'recovery' && alertCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {alertCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500">
            <div className="font-medium text-slate-400 mb-1">{businessName ?? 'Loading...'}</div>
            <div>{isDemo ? 'Demo Mode' : 'Your Business'}{onSwitchBusiness && <button onClick={onSwitchBusiness} className="text-blue-400 hover:text-blue-300 underline ml-1">Switch</button>}</div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
          <button onClick={() => handleNav('landing')}>
            <Logo size={36} />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <nav className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur p-3 space-y-1 animate-fade-in max-h-[70vh] overflow-y-auto">
            {[...navItems, ...agentNavItems].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  current === item.id
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'recovery' && alertCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {alertCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        )}

        <main className="flex-1 overflow-x-hidden">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex items-center justify-around px-1 py-1.5">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors ${
                current === item.id ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-medium">{item.short}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
