import React, { useState } from 'react';
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

const PAGES = {
  dashboard: Dashboard,
  expenses: ExpenseLog,
  budget: BudgetSetup,
  summary: CategorySummary,
  analysis: SpendingAnalysis,
  review: MonthlyReview,
  settings: Settings,
};

function App() {
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

  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <BudgetProvider>
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
    </BudgetProvider>
  );
}

export default App;
