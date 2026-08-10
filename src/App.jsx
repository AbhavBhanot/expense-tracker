import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BudgetProvider } from './contexts/BudgetContext';
import Sidebar from './components/layout/Sidebar';
import Layout from './components/layout/Layout';
import MobileTabBar from './components/layout/MobileTabBar';
import Dashboard from './components/dashboard/Dashboard';
import ExpenseLog from './components/expenses/ExpenseLog';
import BudgetSetup from './components/budget/BudgetSetup';
import CategorySummary from './components/analysis/CategorySummary';
import SpendingAnalysis from './components/analysis/SpendingAnalysis';
import MonthlyReview from './components/analysis/MonthlyReview';
import Settings from './components/settings/Settings';
import AuthPage from './components/auth/AuthPage';
import { Wallet, Loader2 } from 'lucide-react';

const PAGES = {
  dashboard: Dashboard,
  expenses: ExpenseLog,
  budget: BudgetSetup,
  summary: CategorySummary,
  analysis: SpendingAnalysis,
  review: MonthlyReview,
  settings: Settings,
};

function MainContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return PAGES[hash] ? hash : 'dashboard';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (PAGES[hash]) setActivePage(hash);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (page) => {
    window.location.hash = page;
    setActivePage(page);
  };

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-box">
          <div className="sidebar-logo-icon" style={{ width: '48px', height: '48px' }}>
            <Wallet size={24} />
          </div>
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'sidebar-collapsed-layout' : ''}`}>
      <Sidebar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Layout>
        <PageComponent />
      </Layout>
      <MobileTabBar activePage={activePage} onNavigate={handleNavigate} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <MainContent />
      </BudgetProvider>
    </AuthProvider>
  );
}

export default App;

