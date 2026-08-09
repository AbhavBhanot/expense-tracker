import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { tooltipDefaults, CHART_THEME, tickFont } from '../../utils/chartTheme';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function SpendingTrendChart({ cumulativeSpending = [] }) {
  if (cumulativeSpending.length === 0) {
    return (
      <div className="chart-card card">
        <h4 className="card-title">Spending Over Time</h4>
        <div className="chart-empty">No spending data yet</div>
      </div>
    );
  }

  const data = {
    labels: cumulativeSpending.map(d => d.dateLabel),
    datasets: [
      {
        label: 'Actual',
        data: cumulativeSpending.map(d => d.cumulative),
        borderColor: CHART_THEME.accent,
        backgroundColor: CHART_THEME.accentMuted,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: CHART_THEME.accent,
        pointBorderColor: CHART_THEME.tooltipBg,
        pointBorderWidth: 2,
        borderWidth: 2,
      },
      {
        label: 'Expected',
        data: cumulativeSpending.map(d => d.expected),
        borderColor: CHART_THEME.accentDash,
        borderDash: [5, 4],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 1.5,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { color: CHART_THEME.gridColor, drawBorder: false },
        ticks: {
          color: CHART_THEME.tickColor,
          font: tickFont(11),
          autoSkip: true,
          maxTicksLimit: 10,
        }
      },
      y: {
        grid: { color: CHART_THEME.gridColor, drawBorder: false },
        ticks: {
          color: CHART_THEME.tickColor,
          font: tickFont(11),
          callback: (v) => `₹${(v / 1000).toFixed(0)}K`,
        },
        beginAtZero: true,
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
      <h4 className="card-title">Spending Over Time</h4>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
