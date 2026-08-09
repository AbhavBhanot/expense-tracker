import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { tooltipDefaults, CHART_THEME, tickFont } from '../../utils/chartTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Indigo-tinted bar shades for weekly bars
const BAR_SHADES = [
  'rgba(129, 140, 248, 0.65)',
  'rgba(99,  102, 241, 0.65)',
  'rgba(79,  70,  229, 0.65)',
  'rgba(109, 119, 247, 0.65)',
  'rgba(139, 148, 254, 0.65)',
];
const BAR_BORDERS = [
  'rgba(129, 140, 248, 0.9)',
  'rgba(99,  102, 241, 0.9)',
  'rgba(79,  70,  229, 0.9)',
  'rgba(109, 119, 247, 0.9)',
  'rgba(139, 148, 254, 0.9)',
];

export default function WeeklySpendingChart({ weeklySpending = [] }) {
  if (weeklySpending.length === 0) {
    return (
      <div className="chart-card card">
        <h4 className="card-title">Weekly Spending</h4>
        <div className="chart-empty">No spending data yet</div>
      </div>
    );
  }

  const data = {
    labels: weeklySpending.map(w => `Week ${w.week}`),
    datasets: [{
      label: 'Spending',
      data: weeklySpending.map(w => w.total),
      backgroundColor: weeklySpending.map((_, i) => BAR_SHADES[i % BAR_SHADES.length]),
      borderColor:     weeklySpending.map((_, i) => BAR_BORDERS[i % BAR_BORDERS.length]),
      borderWidth: 1,
      borderRadius: 5,
      barPercentage: 0.6,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: CHART_THEME.tickColorBold, font: tickFont(12) },
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
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults(),
        callbacks: {
          label: (context) => {
            const week = weeklySpending[context.dataIndex];
            return [
              ` Total: ₹${context.raw.toLocaleString('en-IN')}`,
              ` Transactions: ${week.count || 0}`,
            ];
          }
        }
      }
    }
  };

  return (
    <div className="chart-card card">
      <h4 className="card-title">Weekly Spending</h4>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
