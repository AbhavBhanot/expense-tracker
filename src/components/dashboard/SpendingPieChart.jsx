import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart } from 'lucide-react';
import { CHART_COLORS } from '../../utils/constants';
import { tooltipDefaults, CHART_THEME } from '../../utils/chartTheme';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SpendingPieChart({ categoryTotals = [] }) {
  const spent = categoryTotals.filter(c => c.actualSpent > 0 && c.priority !== 'Savings' && c.priority !== 'Investment');

  if (spent.length === 0) {
    return (
      <div className="chart-card card">
        <h4 className="card-title">Spending by Category</h4>
        <div className="chart-empty">
          <PieChart size={20} className="text-tertiary" />
          <span>No category spending logged for this month</span>
        </div>
      </div>
    );
  }

  const data = {
    labels: spent.map(c => c.name),
    datasets: [{
      data: spent.map(c => c.actualSpent),
      backgroundColor: CHART_COLORS.slice(0, spent.length),
      borderColor: CHART_THEME.tooltipBg,
      borderWidth: 2,
      hoverBorderWidth: 0,
      hoverOffset: 6,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: CHART_THEME.tickColor,
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 11, family: CHART_THEME.fontFamily },
        }
      },
      tooltip: {
        ...tooltipDefaults(),
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percent = ((context.raw / total) * 100).toFixed(1);
            return ` ₹${context.raw.toLocaleString('en-IN')} (${percent}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="chart-card card">
      <h4 className="card-title">Spending by Category</h4>
      <div className="chart-container chart-container-pie">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
