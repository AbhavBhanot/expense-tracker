import React, { useState } from 'react';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, 
  CategoryScale, LinearScale, PointElement, LineElement, LineController, BarController 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { useBudget } from '../../contexts/BudgetContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Header from '../layout/Header';
import { CHART_COLORS } from '../../utils/constants';
import { 
  AlertCircle, TrendingUp, TrendingDown, DollarSign, 
  PieChart, BarChart3, Calendar, Layers, Activity 
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

  const [activeTab, setActiveTab] = useState('all');

  const tooltipOptions = {
    backgroundColor: '#1a1a20',
    titleColor: '#f8fafc',
    bodyColor: '#94a3b8',
    borderColor: '#2a2a32',
    borderWidth: 1,
    cornerRadius: 10,
    padding: 12,
    titleFont: { family: 'inherit', weight: '600' },
    bodyFont: { family: 'inherit' }
  };

  // Essential vs Discretionary Chart Data
  const evdData = {
    labels: ['Essential', 'Discretionary'],
    datasets: [{
      data: [essentialVsDiscretionary.essential.total, essentialVsDiscretionary.discretionary.total],
      backgroundColor: ['#3b82f6', '#f59e0b'],
      borderColor: 'var(--bg-secondary)',
      borderWidth: 3,
      hoverOffset: 6
    }]
  };
  
  // Fixed vs Variable Chart Data
  const fvvData = {
    labels: ['Fixed', 'Variable'],
    datasets: [{
      data: [fixedVsVariable.fixed.total, fixedVsVariable.variable.total],
      backgroundColor: ['#14b8a6', '#10b981'],
      borderColor: 'var(--bg-secondary)',
      borderWidth: 3,
      hoverOffset: 6
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: '#94a3b8', 
          usePointStyle: true, 
          padding: 16,
          font: { family: 'inherit', size: 12 } 
        } 
      },
      tooltip: tooltipOptions
    }
  };

  // Top Spending Categories
  const topCategories = [...categoryTotals]
    .filter(c => c.actualSpent > 0 && c.priority !== 'Savings' && c.priority !== 'Investment')
    .sort((a, b) => b.actualSpent - a.actualSpent)
    .slice(0, 5);

  const topSpendingData = {
    labels: topCategories.map(c => c.name),
    datasets: [{
      label: 'Spent',
      data: topCategories.map(c => c.actualSpent),
      backgroundColor: CHART_COLORS.slice(0, 5),
      borderRadius: 6,
      barPercentage: 0.6
    }]
  };

  const topSpendingOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: tooltipOptions
    },
    scales: {
      x: { 
        grid: { color: '#2a2a32' }, 
        ticks: { 
          color: '#94a3b8',
          font: { family: 'inherit' },
          callback: (v) => `₹${(v / 1000).toFixed(0)}K`
        } 
      },
      y: { grid: { display: false }, ticks: { color: '#f8fafc', font: { family: 'inherit', weight: '600' } } }
    }
  };

  // Daily Spending Chart
  const avgDaily = overallMetrics.avgDailySpending;
  const dailyData = {
    labels: dailySpending.map(d => d.date.split('-')[2]),
    datasets: [
      {
        type: 'line',
        label: 'Daily Average',
        data: dailySpending.map(() => avgDaily),
        borderColor: 'rgba(239, 68, 68, 0.7)',
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
        borderWidth: 2
      },
      {
        type: 'bar',
        label: 'Daily Spending',
        data: dailySpending.map(d => d.total),
        backgroundColor: '#14b8a6',
        borderRadius: 4
      }
    ]
  };

  const dailyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true, font: { family: 'inherit' } } },
      tooltip: tooltipOptions
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'inherit' } } },
      y: { 
        grid: { color: '#2a2a32' }, 
        ticks: { color: '#94a3b8', font: { family: 'inherit' }, callback: (v) => `₹${v.toLocaleString('en-IN')}` } 
      }
    }
  };
  
  // Most Frequent Category calculation
  const categoryFreq = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + 1;
    return acc;
  }, {});
  let mostFreqCategory = '';
  let mostFreqCount = 0;
  for (const [cat, count] of Object.entries(categoryFreq)) {
    if (count > mostFreqCount) {
      mostFreqCategory = cat;
      mostFreqCount = count;
    }
  }
  
  // Highest Variance calculation
  let highestVariance = null;
  if (categoryTotals.length > 0) {
    highestVariance = [...categoryTotals].reduce((prev, curr) => {
      const prevVar = Math.abs(prev.difference);
      const currVar = Math.abs(curr.difference);
      return currVar > prevVar ? curr : prev;
    }, categoryTotals[0]);
  }

  return (
    <div className="analysis-page animate-fadeIn">
      <Header title="Spending Analysis" subtitle="Deep financial insights, category proportions, and spending velocity" />

      {/* Filter Tabs */}
      <div className="card p-2 flex-between gap-2" style={{ overflowX: 'auto' }}>
        <div className="flex gap-2">
          <button 
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('all')}
          >
            <Layers size={16} /> Overview
          </button>
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
      {(activeTab === 'all' || activeTab === 'proportions') && (
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
      {(activeTab === 'all' || activeTab === 'top') && (
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
      )}

      {(activeTab === 'all' || activeTab === 'velocity') && (
        <div className="card chart-card">
          <h4 className="card-title">
            <Calendar size={18} />
            Daily Spending Velocity & Average Threshold
          </h4>
          <div className="chart-container" style={{ height: 320 }}>
            <Bar data={dailyData} options={dailyOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
