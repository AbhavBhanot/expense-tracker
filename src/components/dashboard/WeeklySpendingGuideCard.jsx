import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import ProgressBar from '../shared/ProgressBar';
import { tooltipDefaults, CHART_THEME, tickFont } from '../../utils/chartTheme';
import { Calendar, Compass, ShoppingBag, Coffee, Heart, Box, BarChart3 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ICON_MAP = {
  'Food & Munchies': Coffee,
  'Plans': Compass,
  'Shopping': ShoppingBag,
  'Essentials Restock': Heart,
  'Misc': Box
};

export default function WeeklySpendingGuideCard() {
  const { weeklyGuideMetrics } = useBudgetCalculations();
  const {
    categoryMetrics = [],
    dailyBreakdown = [],
    totalWeeklySpent = 0,
    totalWeeklyLimit = 1700,
    hasExpensesThisWeek = false,
    weekLabel = ''
  } = weeklyGuideMetrics || {};

  const dailyChartData = {
    labels: dailyBreakdown.map(d => d.dayLabel),
    datasets: [{
      label: 'Daily Spent',
      data: dailyBreakdown.map(d => d.total),
      backgroundColor: dailyBreakdown.map(d =>
        d.total > 0 ? 'rgba(129, 140, 248, 0.65)' : 'rgba(129, 140, 248, 0.15)'
      ),
      borderColor: 'rgba(129, 140, 248, 0.9)',
      borderWidth: 1,
      borderRadius: 5,
      barPercentage: 0.65,
    }]
  };

  const dailyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults(),
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const day = dailyBreakdown[items[0].dataIndex];
            return `${day.dayLabel} (${day.dateFormatted})`;
          },
          label: (context) => {
            const day = dailyBreakdown[context.dataIndex];
            return ` Spent: ${formatCurrency(context.raw)} (${day.count} txn${day.count === 1 ? '' : 's'})`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: CHART_THEME.tickColor, font: tickFont(11) },
      },
      y: {
        grid: { color: CHART_THEME.gridColor, drawBorder: false },
        ticks: {
          color: CHART_THEME.tickColor,
          font: tickFont(10),
          callback: (v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`,
        },
        beginAtZero: true,
      }
    }
  };

  const catVsLimitChartData = {
    labels: categoryMetrics.map(c => c.category),
    datasets: [
      {
        label: 'Weekly Limit',
        data: categoryMetrics.map(c => c.weeklyLimit),
        backgroundColor: 'rgba(96, 165, 250, 0.18)',
        borderColor: 'rgba(96, 165, 250, 0.7)',
        borderWidth: 1,
        borderRadius: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.75,
      },
      {
        label: 'Actual Spent',
        data: categoryMetrics.map(c => c.weeklySpent),
        backgroundColor: categoryMetrics.map(c => {
          if (c.isOverBudget)    return 'rgba(248, 113, 113, 0.65)';
          if (c.percentUsed >= 75) return 'rgba(251, 191, 36,  0.65)';
          return 'rgba(129, 140, 248, 0.65)';
        }),
        borderColor: categoryMetrics.map(c => {
          if (c.isOverBudget)    return 'rgba(248, 113, 113, 1)';
          if (c.percentUsed >= 75) return 'rgba(251, 191, 36,  1)';
          return 'rgba(129, 140, 248, 1)';
        }),
        borderWidth: 1,
        borderRadius: 3,
        barPercentage: 0.7,
        categoryPercentage: 0.75,
      }
    ]
  };

  const catVsLimitChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    clip: false,
    layout: { padding: { right: 8 } },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: CHART_THEME.tickColor,
          boxWidth: 8,
          boxHeight: 8,
          padding: 10,
          font: { family: CHART_THEME.fontFamily, size: 11 },
        }
      },
      tooltip: {
        ...tooltipDefaults(),
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.raw)}`,
        }
      }
    },
    scales: {
      x: {
        grid: { color: CHART_THEME.gridColor, drawBorder: false },
        ticks: {
          color: CHART_THEME.tickColor,
          font: tickFont(10),
          callback: (v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`,
          maxTicksLimit: 5,
        },
        beginAtZero: true,
        min: 0,
      },
      y: {
        grid: { display: false },
        ticks: { color: CHART_THEME.tickColorBold, font: tickFont(10) },
      }
    }
  };

  return (
    <div className="card weekly-guide-card">
      <div className="card-body">
        {/* Header */}
        <div className="flex-between mb-3 flex-wrap gap-2">
          <div>
            <h4 className="card-title flex items-center gap-2">
              <Calendar size={16} className="text-info" />
              Weekly Spending Guide
            </h4>
            <p className="text-secondary text-xs">
              Target weekly limits &amp; live progress {weekLabel ? `(${weekLabel})` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${totalWeeklySpent > totalWeeklyLimit ? 'badge-danger' : 'badge-info'}`}>
              {formatCurrency(totalWeeklySpent)} / {formatCurrency(totalWeeklyLimit)} wk
            </span>
          </div>
        </div>

        {/* Category Progress Cards Grid */}
        <div className="weekly-guide-grid">
          {categoryMetrics.map((item) => {
            const IconComponent = ICON_MAP[item.category] || Box;
            const isOver    = item.isOverBudget;
            const isWarning = !isOver && item.percentUsed >= 75;

            const chicletVariantClass = isOver
              ? 'stat-chiclet-danger'
              : isWarning
              ? 'stat-chiclet-warning'
              : 'stat-chiclet-info';

            const badgeVariantClass = isOver
              ? 'badge-danger'
              : isWarning
              ? 'badge-warning'
              : 'badge-neutral';

            return (
              <div key={item.category} className={`stat-chiclet ${chicletVariantClass} weekly-guide-item`}>
                <div className="weekly-guide-item-header" style={{ marginBottom: 'var(--space-1-5)' }}>
                  <span className="font-semibold text-sm weekly-guide-title">
                    <IconComponent size={14} className={isOver ? 'text-danger' : 'text-accent'} />
                    {item.category}
                  </span>
                  <span className={`badge ${badgeVariantClass} text-xs font-mono weekly-guide-badge`}>
                    {formatCurrency(item.weeklySpent)} / {formatCurrency(item.weeklyLimit)}
                  </span>
                </div>

                <div className="weekly-guide-progress-container my-2">
                  <ProgressBar
                    value={item.weeklySpent}
                    max={item.weeklyLimit}
                    size="sm"
                    showPercent={false}
                    variant={isOver ? 'danger' : isWarning ? 'warning' : 'info'}
                  />
                  <div className="flex-between text-xs mt-1 font-mono">
                    <span className={isOver ? 'text-danger font-semibold' : 'text-secondary'}>
                      {formatPercent(item.percentUsed, 0)}
                    </span>
                    <span className={isOver ? 'text-danger font-semibold' : 'text-tertiary'}>
                      {isOver
                        ? `₹${Math.round(item.overAmount).toLocaleString('en-IN')} over`
                        : `${formatCurrency(item.remaining)} left`}
                    </span>
                  </div>
                </div>

                <div className="text-tertiary text-xs weekly-guide-notes mb-1">{item.notes}</div>
                <div className="flex-between text-xs text-secondary border-top weekly-guide-footer" style={{ paddingTop: 'var(--space-1-5)' }}>
                  <span>Monthly Budget</span>
                  <span className="font-medium">{formatCurrency(item.monthlyBudget)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts / Empty State */}
        <div className="weekly-guide-charts-section pt-4 border-top mt-4">
          {!hasExpensesThisWeek ? (
            <div className="weekly-guide-empty-state">
              <div className="weekly-empty-icon-box mb-2">
                <BarChart3 size={24} className="text-secondary" />
              </div>
              <h5 className="font-semibold text-sm text-primary mb-1">No spending recorded this week.</h5>
              <p className="text-xs text-tertiary">Add an expense to start tracking your weekly spending.</p>
            </div>
          ) : (
            <div className="weekly-guide-charts-grid">
              <div className="weekly-chart-box">
                <div className="flex-between mb-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-secondary flex items-center gap-2">
                    <BarChart3 size={13} className="text-info" />
                    Daily Spending
                  </h5>
                  <span className="text-xs text-tertiary font-mono">{formatCurrency(totalWeeklySpent)} total</span>
                </div>
                <div className="weekly-chart-container">
                  <Bar data={dailyChartData} options={dailyChartOptions} />
                </div>
              </div>

              <div className="weekly-chart-box">
                <div className="flex-between mb-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-secondary flex items-center gap-2">
                    <Calendar size={13} className="text-accent" />
                    Category vs Limit
                  </h5>
                  <span className="text-xs text-tertiary font-mono">Limit: {formatCurrency(totalWeeklyLimit)}</span>
                </div>
                <div className="weekly-chart-container">
                  <Bar data={catVsLimitChartData} options={catVsLimitChartOptions} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

