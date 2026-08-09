import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { tooltipDefaults, CHART_THEME, tickFont } from '../../utils/chartTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BudgetVsActualChart({ categoryTotals = [] }) {
  const cats = categoryTotals.filter(c => c.priority !== 'Savings' && c.priority !== 'Investment');

  if (cats.length === 0) {
    return (
      <div className="chart-card card">
        <h4 className="card-title">Budget vs Actual</h4>
        <div className="chart-empty">No budget data yet</div>
      </div>
    );
  }

  const data = {
    labels: cats.map(c => c.name),
    datasets: [
      {
        label: 'Budget',
        data: cats.map(c => c.planned),
        backgroundColor: CHART_THEME.accentMuted,
        borderColor: CHART_THEME.accent,
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Actual',
        data: cats.map(c => c.actualSpent),
        backgroundColor: cats.map(c => {
          if (c.percentUsed >= 100) return 'rgba(248, 113, 113, 0.55)';
          if (c.percentUsed >= 75)  return 'rgba(251, 191, 36, 0.55)';
          return 'rgba(52, 211, 153, 0.55)';
        }),
        borderColor: cats.map(c => {
          if (c.percentUsed >= 100) return 'rgba(248, 113, 113, 0.9)';
          if (c.percentUsed >= 75)  return 'rgba(251, 191, 36, 0.9)';
          return 'rgba(52, 211, 153, 0.9)';
        }),
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    clip: false,
    scales: {
      x: {
        grid: { color: CHART_THEME.gridColor, drawBorder: false },
        ticks: {
          color: CHART_THEME.tickColor,
          font: tickFont(11),
          callback: (v) => `₹${(v / 1000).toFixed(0)}K`,
        },
        grace: '10%',
      },
      y: {
        grid: { display: false },
        ticks: { color: CHART_THEME.tickColorBold, font: tickFont(12) },
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: CHART_THEME.tickColor,
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { size: 11, family: CHART_THEME.fontFamily },
        }
      },
      tooltip: {
        ...tooltipDefaults(),
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ₹${context.raw.toLocaleString('en-IN')}`,
        }
      }
    }
  };

  return (
    <div className="chart-card card">
      <h4 className="card-title">Budget vs Actual</h4>
      <div className="chart-container chart-container-bar">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
