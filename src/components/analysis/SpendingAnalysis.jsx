import React, { useState, useMemo } from 'react';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, 
  CategoryScale, LinearScale, PointElement, LineElement, LineController, BarController 
} from 'chart.js';
import { Chart, Doughnut, Bar } from 'react-chartjs-2';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { useBudget } from '../../contexts/BudgetContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Header from '../layout/Header';
import { CHART_COLORS } from '../../utils/constants';
import { tooltipDefaults, CHART_THEME, tickFont } from '../../utils/chartTheme';
import SpendingPieChart from '../dashboard/SpendingPieChart';
import CategoryProgressList from '../dashboard/CategoryProgressList';
import { 
  AlertCircle, TrendingUp, TrendingDown, DollarSign, 
  PieChart, BarChart3, Calendar, Activity 
} from 'lucide-react';

ChartJS.register(
  ArcElement, Tooltip, Legend, BarElement, CategoryScale, 
  LinearScale, PointElement, LineElement, LineController, BarController
);

export default function SpendingAnalysis() {
  const { essentialVsDiscretionary, fixedVsVariable, dailySpending, categoryTotals, overallMetrics } = useBudgetCalculations();
  const { state } = useBudget();
  const currentMonthData = state.months[state.currentMonth] || { expenses: [], budget: { categories: [] } };
  const { expenses } = currentMonthData;

  const [activeTab, setActiveTab] = useState('proportions');

  // Shared tooltip/pie options — stable references so Chart.js doesn't re-init
  const tooltipOptions = useMemo(() => tooltipDefaults(), []);

  const pieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: CHART_THEME.tickColor,
          usePointStyle: true, 
          padding: 16,
          font: { family: CHART_THEME.fontFamily, size: 12 } 
        } 
      },
      tooltip: tooltipDefaults()
    }
  }), []);

  // Essential vs Discretionary Chart Data
  const evdData = useMemo(() => ({
    labels: ['Essential', 'Discretionary'],
    datasets: [{
      data: [essentialVsDiscretionary.essential.total, essentialVsDiscretionary.discretionary.total],
      backgroundColor: ['#3b82f6', '#f59e0b'],
      borderColor: CHART_THEME.tooltipBg,
      borderWidth: 3,
      hoverOffset: 6
    }]
  }), [essentialVsDiscretionary.essential.total, essentialVsDiscretionary.discretionary.total]);
  
  // Fixed vs Variable Chart Data
  const fvvData = useMemo(() => ({
    labels: ['Fixed', 'Variable'],
    datasets: [{
      data: [fixedVsVariable.fixed.total, fixedVsVariable.variable.total],
      backgroundColor: ['#14b8a6', '#10b981'],
      borderColor: CHART_THEME.tooltipBg,
      borderWidth: 3,
      hoverOffset: 6
    }]
  }), [fixedVsVariable.fixed.total, fixedVsVariable.variable.total]);

  // Top Spending Categories
  const topCategories = useMemo(() => 
    [...categoryTotals]
      .filter(c => c.actualSpent > 0 && c.priority !== 'Savings' && c.priority !== 'Investment')
      .sort((a, b) => b.actualSpent - a.actualSpent)
      .slice(0, 5),
  [categoryTotals]);

  const topSpendingData = useMemo(() => ({
    labels: topCategories.map(c => c.name),
    datasets: [{
      label: 'Spent',
      data: topCategories.map(c => c.actualSpent),
      backgroundColor: CHART_COLORS.slice(0, 5),
      borderRadius: 6,
      barPercentage: 0.6
    }]
  }), [topCategories]);

  const topSpendingOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: tooltipDefaults()
    },
    scales: {
      x: { 
        grid: { color: CHART_THEME.gridColor }, 
        ticks: { 
          color: CHART_THEME.tickColor,
          font: tickFont(11),
          callback: (v) => `₹${(v / 1000).toFixed(0)}K`
        } 
      },
      y: { grid: { display: false }, ticks: { color: CHART_THEME.tickColorBold, font: tickFont(11) } }
    }
  }), []);

  // Daily Spending Chart — uses <Chart> (mixed type) not <Bar>
  const avgDaily = overallMetrics.avgDailySpending;

  const dailyData = useMemo(() => ({
    labels: dailySpending.map(d => d.date.split('-')[2]),
    datasets: [
      {
        type: 'line',
        label: 'Daily Average',
        data: dailySpending.map(() => avgDaily),
        borderColor: 'rgba(239, 68, 68, 0.75)',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        borderWidth: 2,
        order: 1
      },
      {
        type: 'bar',
        label: 'Daily Spending',
        data: dailySpending.map(d => d.total),
        backgroundColor: 'rgba(20, 184, 166, 0.65)',
        borderColor: 'rgba(20, 184, 166, 0.9)',
        borderWidth: 1,
        borderRadius: 4,
        order: 2
      }
    ]
  }), [dailySpending, avgDaily]);

  const dailyOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top', 
        labels: { color: CHART_THEME.tickColor, usePointStyle: true, font: tickFont(11) } 
      },
      tooltip: tooltipDefaults()
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: CHART_THEME.tickColor, font: tickFont(11) } },
      y: { 
        grid: { color: CHART_THEME.gridColor }, 
        beginAtZero: true,
        ticks: { 
          color: CHART_THEME.tickColor, 
          font: tickFont(11), 
          callback: (v) => `₹${v.toLocaleString('en-IN')}` 
        } 
      }
    }
  }), []);
  
  // Most Frequent Category calculation
  const { mostFreqCategory, mostFreqCount } = useMemo(() => {
    const freq = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + 1;
      return acc;
    }, {});
    let cat = '';
    let count = 0;
    for (const [c, n] of Object.entries(freq)) {
      if (n > count) { cat = c; count = n; }
    }
    return { mostFreqCategory: cat, mostFreqCount: count };
  }, [expenses]);
  
  // Highest Variance calculation
  const highestVariance = useMemo(() => {
    if (categoryTotals.length === 0) return null;
    return [...categoryTotals].reduce((prev, curr) =>
      Math.abs(curr.difference) > Math.abs(prev.difference) ? curr : prev
    , categoryTotals[0]);
  }, [categoryTotals]);

  return (
    <div className="analysis-page animate-fadeIn">
      <Header title="Spending Analysis" subtitle="Deep financial insights, category proportions, and spending velocity" />

      {/* Filter Tabs */}
      <div className="card p-3 flex-between gap-2" style={{ overflowX: 'auto' }}>
        <div className="flex gap-2">
          <button 
            className={`btn ${activeTab === 'proportions' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('proportions')}
          >
            <PieChart size={16} /> Proportions
          </button>
          <button 
            className={`btn ${activeTab === 'top' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('top')}
          >
            <BarChart3 size={16} /> Top Categories
          </button>
          <button 
            className={`btn ${activeTab === 'velocity' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('velocity')}
          >
            <Activity size={16} /> Daily Velocity
          </button>
        </div>
        <div className="text-tertiary text-xs hidden-mobile">
          {expenses.length} expenses analyzed
        </div>
      </div>

      {/* KPI Derived Metrics Cards */}
      <div className="kpi-grid">
        <div className="card kpi-card kpi-purple">
          <div className="kpi-content">
            <span className="kpi-label">Largest Expense</span>
            <span className="kpi-value">
              {overallMetrics.largestExpense ? formatCurrency(overallMetrics.largestExpense.amount) : '₹0'}
            </span>
            <span className="kpi-subtitle truncate">
              {overallMetrics.largestExpense ? overallMetrics.largestExpense.description : 'No transactions'}
            </span>
          </div>
          <div className="kpi-icon kpi-icon-purple">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="card kpi-card kpi-info">
          <div className="kpi-content">
            <span className="kpi-label">Avg Transaction</span>
            <span className="kpi-value">{formatCurrency(overallMetrics.avgTransaction)}</span>
            <span className="kpi-subtitle">{overallMetrics.totalTransactions} transactions total</span>
          </div>
          <div className="kpi-icon kpi-icon-info">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="card kpi-card kpi-warning">
          <div className="kpi-content">
            <span className="kpi-label">Most Frequent</span>
            <span className="kpi-value">{mostFreqCategory || 'N/A'}</span>
            <span className="kpi-subtitle">{mostFreqCount} logged transactions</span>
          </div>
          <div className="kpi-icon kpi-icon-warning">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="card kpi-card kpi-danger">
          <div className="kpi-content">
            <span className="kpi-label">Highest Variance</span>
            <span className="kpi-value">{highestVariance ? highestVariance.name : 'N/A'}</span>
            <span className="kpi-subtitle">
              {highestVariance ? (
                highestVariance.difference >= 0 
                  ? `${formatCurrency(highestVariance.difference)} under budget` 
                  : `${formatCurrency(Math.abs(highestVariance.difference))} over budget`
              ) : 'N/A'}
            </span>
          </div>
          <div className="kpi-icon kpi-icon-danger">
            <TrendingDown size={22} />
          </div>
        </div>
      </div>

      {/* Proportions Section with Stat Chiclets */}
      {activeTab === 'proportions' && (
        <div className="grid-2">
          <div className="card chart-card">
            <h4 className="card-title">
              <PieChart size={18} className="text-info" />
              Essential vs Discretionary
            </h4>
            <div className="chart-container chart-container-pie">
              <Doughnut data={evdData} options={pieOptions} />
            </div>

            <div className="stat-chiclet-grid">
              <div className="stat-chiclet stat-chiclet-info" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <div className="stat-chiclet-header">
                  <span className="stat-chiclet-title text-info" style={{ paddingLeft: '4px' }}>Essential</span>
                  <span className="badge badge-info" style={{ whiteSpace: 'nowrap' }}>{formatPercent(essentialVsDiscretionary.essential.percent)}</span>
                </div>
                <div className="stat-chiclet-value" style={{ paddingLeft: '4px' }}>{formatCurrency(essentialVsDiscretionary.essential.total)}</div>
              </div>

              <div className="stat-chiclet stat-chiclet-warning" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <div className="stat-chiclet-header">
                  <span className="stat-chiclet-title text-warning" style={{ paddingLeft: '4px' }}>Discretionary</span>
                  <span className="badge badge-warning" style={{ whiteSpace: 'nowrap' }}>{formatPercent(essentialVsDiscretionary.discretionary.percent)}</span>
                </div>
                <div className="stat-chiclet-value" style={{ paddingLeft: '4px' }}>{formatCurrency(essentialVsDiscretionary.discretionary.total)}</div>
              </div>
            </div>
          </div>

          <div className="card chart-card">
            <h4 className="card-title">
              <PieChart size={18} className="text-accent" />
              Fixed vs Variable
            </h4>
            <div className="chart-container chart-container-pie">
              <Doughnut data={fvvData} options={pieOptions} />
            </div>

            <div className="stat-chiclet-grid">
              <div className="stat-chiclet stat-chiclet-purple" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <div className="stat-chiclet-header">
                  <span className="stat-chiclet-title text-accent" style={{ paddingLeft: '4px' }}>Fixed</span>
                  <span className="badge badge-info" style={{ whiteSpace: 'nowrap' }}>{formatPercent(fixedVsVariable.fixed.percent)}</span>
                </div>
                <div className="stat-chiclet-value" style={{ paddingLeft: '4px' }}>{formatCurrency(fixedVsVariable.fixed.total)}</div>
              </div>

              <div className="stat-chiclet stat-chiclet-success" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <div className="stat-chiclet-header">
                  <span className="stat-chiclet-title text-success" style={{ paddingLeft: '4px' }}>Variable</span>
                  <span className="badge badge-success" style={{ whiteSpace: 'nowrap' }}>{formatPercent(fixedVsVariable.variable.percent)}</span>
                </div>
                <div className="stat-chiclet-value" style={{ paddingLeft: '4px' }}>{formatCurrency(fixedVsVariable.variable.total)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Categories & Daily Burn Section */}
      {activeTab === 'top' && (
        <>
          {/* Pie chart + category progress from dashboard */}
          <div className="dashboard-bottom-grid">
            <SpendingPieChart categoryTotals={categoryTotals} />
            <CategoryProgressList categoryTotals={categoryTotals} />
          </div>

          <div className="card chart-card">
            <h4 className="card-title">
              <BarChart3 size={18} />
              Top 5 Spending Categories
            </h4>
            <div className="grid-2 gap-4">
              <div className="chart-container chart-container-bar">
                <Bar data={topSpendingData} options={topSpendingOptions} />
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Category</th>
                      <th className="text-right">Spent</th>
                      <th className="text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCategories.map((cat, idx) => (
                      <tr key={cat.id || cat.name}>
                        <td className="text-tertiary">#{idx + 1}</td>
                        <td className="font-medium">{cat.name}</td>
                        <td className="text-right font-semibold">{formatCurrency(cat.actualSpent)}</td>
                        <td className="text-right text-tertiary">
                          {formatPercent((cat.actualSpent / (overallMetrics.totalSpent || 1)) * 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'velocity' && (
        <div className="card chart-card">
          <h4 className="card-title">
            <Calendar size={18} />
            Daily Spending Velocity &amp; Average Threshold
          </h4>
          <div className="chart-container" style={{ height: 320 }}>
            {dailySpending.length > 0 ? (
              <Chart type="bar" data={dailyData} options={dailyOptions} />
            ) : (
              <div className="chart-empty">No spending data yet for this month</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
