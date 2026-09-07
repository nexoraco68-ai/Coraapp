import { useState, useEffect, useCallback } from 'react';
import { Layout, type PageId } from '@/components/Layout';
import { Landing } from '@/pages/Landing';
import { BusinessSetup } from '@/pages/BusinessSetup';
import { Dashboard } from '@/pages/Dashboard';
import { CEOPage } from '@/pages/CEOPage';
import { CFOPage } from '@/pages/CFOPage';
import { SalesPage } from '@/pages/SalesPage';
import { RecoveryPage } from '@/pages/RecoveryPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { ManagePage } from '@/pages/ManagePage';
import { AITeamPage } from '@/pages/AITeamPage';
import { AskCORAPage } from '@/pages/AskCORAPage';
import { AgentActivityPage } from '@/pages/AgentActivityPage';
import { PermissionsPage } from '@/pages/PermissionsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { loadBusinessData } from '@/lib/dataLoader';
import { getOverdueInvoices } from '@/lib/analytics';
import { Logo } from '@/components/Logo';
import type { BusinessData, BusinessProfile } from '@/lib/types';
import type { OrchestrationResult } from '@/lib/orchestrator';

const DEMO_BUSINESS_ID = 'demo';
const STORAGE_KEY = 'cora_active_business';

type AppView = 'landing' | 'setup' | PageId;

function App() {
  const [view, setView] = useState<AppView>('landing');
  const [data, setData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [lastOrchestration, setLastOrchestration] = useState<OrchestrationResult | undefined>(undefined);

  const loadData = useCallback((businessId: string) => {
    setLoading(true);
    loadBusinessData(businessId).then((loaded) => {
      setData(loaded);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (activeBusinessId && !data) {
      loadData(activeBusinessId);
    }
  }, [activeBusinessId, data, loadData]);

  const navigate = (p: PageId) => {
    setView(p);
    window.scrollTo(0, 0);
  };

  const handleTryDemo = () => {
    setActiveBusinessId(DEMO_BUSINESS_ID);
    setView('dashboard');
  };

  const handleSetup = () => {
    setView('setup');
  };

  const handleSetupComplete = (business: BusinessProfile) => {
    setActiveBusinessId(business.id);
    localStorage.setItem(STORAGE_KEY, business.id);
    setView('dashboard');
  };

  const handleSwitchBusiness = () => {
    setData(null);
    setActiveBusinessId(null);
    localStorage.removeItem(STORAGE_KEY);
    setView('landing');
  };

  // Restore last business on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setActiveBusinessId(saved);
      setView('dashboard');
    }
  }, []);

  if (view === 'landing') {
    return <Landing onNavigate={navigate} onSetup={handleSetup} onTryDemo={handleTryDemo} />;
  }

  if (view === 'setup') {
    return <BusinessSetup onComplete={handleSetupComplete} onBack={() => setView('landing')} />;
  }

  const renderPage = () => {
    if (loading || !data) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-flex p-4 bg-slate-900 rounded-2xl mb-4 animate-pulse-glow">
              <Logo size={48} showText={false} />
            </div>
            <div className="text-sm text-slate-400">Loading your business data...</div>
          </div>
        </div>
      );
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard data={data} onNavigate={navigate} />;
      case 'manage':
        return <ManagePage data={data} onDataChange={() => loadData(activeBusinessId!)} />;
      case 'ai-team':
        return <AITeamPage data={data} lastResult={lastOrchestration} onNavigate={navigate} />;
      case 'ask':
        return (
          <AskCORAPage
            data={data}
            onNavigate={navigate}
            onOrchestrationComplete={(r) => setLastOrchestration(r)}
          />
        );
      case 'activity':
        return <AgentActivityPage data={data} lastResult={lastOrchestration} />;
      case 'permissions':
        return <PermissionsPage />;
      case 'settings':
        return <SettingsPage isDemo={data.business.isDemo} businessName={data.business.name} />;
      case 'ceo':
        return <CEOPage data={data} onNavigate={navigate} />;
      case 'cfo':
        return <CFOPage data={data} />;
      case 'sales':
        return <SalesPage data={data} onNavigate={navigate} />;
      case 'recovery':
        return <RecoveryPage data={data} />;
      case 'assistant':
        return <AssistantPage data={data} />;
      default:
        return <Dashboard data={data} onNavigate={navigate} />;
    }
  };

  const alertCount = data ? getOverdueInvoices(data).length : 0;

  return (
    <Layout
      current={view as PageId}
      onNavigate={navigate}
      alertCount={alertCount}
      businessName={data?.business.name}
      isDemo={data?.business.isDemo}
      onSwitchBusiness={handleSwitchBusiness}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
