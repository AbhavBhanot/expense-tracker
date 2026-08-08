import React from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, PiggyBank, 
  Receipt, CreditCard, ShoppingBag, 
  Target, BarChart3, Clock, AlertTriangle
} from 'lucide-react';
import Header from '../layout/Header';
import KPICard from './KPICard';
import ProgressBar from '../shared/ProgressBar';
import QuickExpenseEntry from './QuickExpenseEntry';
import SpendingPieChart from './SpendingPieChart';
import BudgetVsActualChart from './BudgetVsActualChart';
import SpendingTrendChart from './SpendingTrendChart';
import WeeklySpendingChart from './WeeklySpendingChart';
import WeeklySpendingGuideCard from './WeeklySpendingGuideCard';
import CategoryProgressList from './CategoryProgressList';
import AlertsPanel from './AlertsPanel';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { useAlerts } from '../../hooks/useAlerts';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function Dashboard() {
  const {
    categoryTotals,
    overallMetrics,
    weeklySpending,
    cumulativeSpending,
    spendingPace,
    essentialVsDiscretionary,
  } = useBudgetCalculations();

  const alerts = useAlerts();

  const m = overallMetrics;

  return (
    <div className="dashboard-page animate-fadeIn">
      <Header title="Dashboard" subtitle="Your financial overview at a glance" />
      
      {/* Quick Expense Entry */}
      <QuickExpenseEntry />

      {/* Overall Budget Progress */}
      <div className="card budget-progress-card">
        <div className="budget-progress-header">
          <div>
            <h3 className="budget-progress-title">Monthly Budget</h3>
            <p className="budget-progress-subtitle">
              {formatCurrency(m.totalSpent)} spent of {formatCurrency(m.totalBudget)}
            </p>
          </div>
          <div className="budget-progress-stats">
            <span className={`budget-progress-percent ${m.percentUsed >= 90 ? 'text-danger' : m.percentUsed >= 75 ? 'text-warning' : 'text-success'}`}>
              {formatPercent(m.percentUsed)}
            </span>
            <span className="budget-progress-label">used</span>
          </div>
        </div>
        <ProgressBar 
          value={m.totalSpent} 
          max={m.totalBudget} 
          size="lg"
          showPercent={false}
        />
        {spendingPace && (
          <div className="spending-pace-info">
            <Clock size={14} />
            <span>
              {spendingPace.daysElapsed} of {spendingPace.daysTotal} days elapsed 
              ({formatPercent(spendingPace.expectedPercent)} expected, {formatPercent(spendingPace.actualPercent)} actual)
            </span>
            {spendingPace.actualPercent > spendingPace.expectedPercent + 15 && (
              <span className="pace-warning text-warning">
                <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Spending faster than expected
              </span>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          title="Total Budget"
          value={formatCurrency(m.totalBudget)}
          icon={Wallet}
          variant="info"
          animateValue
        />
        <KPICard
          title="Total Spent"
          value={formatCurrency(m.totalSpent)}
          icon={ShoppingBag}
          variant={m.percentUsed >= 90 ? 'danger' : m.percentUsed >= 75 ? 'warning' : 'success'}
          subtitle={`${formatPercent(m.percentUsed)} of budget`}
          animateValue
        />
        <KPICard
          title="Remaining"
          value={formatCurrency(m.totalRemaining)}
          icon={m.totalRemaining >= 0 ? TrendingUp : TrendingDown}
          variant={m.totalRemaining >= 0 ? 'success' : 'danger'}
          animateValue
        />
        <KPICard
          title="Savings"
          value={formatCurrency(m.actualSavings)}
          icon={PiggyBank}
          variant="teal"
          subtitle={`Target: ${formatCurrency(m.savingsTarget)}`}
          animateValue
        />
        <KPICard
          title="Transactions"
          value={String(m.totalTransactions)}
          icon={Receipt}
          variant="default"
          animateValue
        />
        <KPICard
          title="Daily Average"
          value={formatCurrency(m.avgDailySpending)}
          icon={BarChart3}
          variant="default"
          animateValue
        />
        <KPICard
          title="Essential"
          value={formatCurrency(essentialVsDiscretionary.essential?.total || 0)}
          icon={Target}
          variant="info"
          subtitle={`${formatPercent(essentialVsDiscretionary.essential?.percent || 0)} of spending`}
          animateValue
        />
        <KPICard
          title="Discretionary"
          value={formatCurrency(essentialVsDiscretionary.discretionary?.total || 0)}
          icon={CreditCard}
          variant="warning"
          subtitle={`${formatPercent(essentialVsDiscretionary.discretionary?.percent || 0)} of spending`}
          animateValue
        />
      </div>

      {/* Weekly Spending Guide */}
      <WeeklySpendingGuideCard />

      {/* Charts Grid */}
      <div className="charts-grid">
        <SpendingPieChart categoryTotals={categoryTotals} />
        <BudgetVsActualChart categoryTotals={categoryTotals} />
        <SpendingTrendChart cumulativeSpending={cumulativeSpending} />
        <WeeklySpendingChart weeklySpending={weeklySpending} />
      </div>

      {/* Category Progress + Alerts */}
      <div className="dashboard-bottom-grid">
        <CategoryProgressList categoryTotals={categoryTotals} />
        <AlertsPanel alerts={alerts} />
      </div>
    </div>
  );
}
