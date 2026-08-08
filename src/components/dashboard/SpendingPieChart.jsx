import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SpendingPieChart({ categoryTotals = [] }) {
  const spent = categoryTotals.filter(c => c.actualSpent > 0 && c.priority !== 'Savings' && c.priority !== 'Investment');
  
  if (spent.length === 0) {
    return (
      <div className="chart-card card">
        <h4 className="card-title">Spending by Category</h4>
        <div className="chart-empty">No spending data yet</div>
      </div>
    );
  }

  const data = {
    labels: spent.map(c => c.name),
    datasets: [{
      data: spent.map(c => c.actualSpent),
      backgroundColor: CHART_COLORS.slice(0, spent.length),
      borderColor: '#1a1a20',
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverBorderColor: '#fff',
      hoverOffset: 8,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 12,
          font: { size: 12, family: 'Inter' }
        }
      },
      tooltip: {
        backgroundColor: '#1a1a20',
        titleColor: '#f0f0f3',
        bodyColor: '#9ca3af',
        borderColor: '#2a2a32',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
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
