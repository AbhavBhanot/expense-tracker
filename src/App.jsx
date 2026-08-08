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
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = PAGES[activePage] || Dashboard;

  return (
    <BudgetProvider>
      <div className="app-layout">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <Layout>
          <PageComponent />
        </Layout>
        <MobileTabBar activePage={activePage} onNavigate={setActivePage} />
      </div>
    </BudgetProvider>
  );
}

export default App;
