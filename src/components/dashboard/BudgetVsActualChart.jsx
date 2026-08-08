import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

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
        backgroundColor: '#2dd4bf33',
        borderColor: '#2dd4bf',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Actual',
        data: cats.map(c => c.actualSpent),
        backgroundColor: cats.map(c => {
          if (c.percentUsed >= 100) return 'rgba(239, 68, 68, 0.6)';
          if (c.percentUsed >= 75) return 'rgba(245, 158, 11, 0.6)';
          return 'rgba(16, 185, 129, 0.6)';
        }),
        borderColor: cats.map(c => {
          if (c.percentUsed >= 100) return 'rgba(239, 68, 68, 0.9)';
          if (c.percentUsed >= 75) return 'rgba(245, 158, 11, 0.9)';
          return 'rgba(16, 185, 129, 0.9)';
        }),
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        grid: {
          color: '#2a2a32',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: { family: 'Inter', size: 11 },
          callback: (v) => `₹${(v / 1000).toFixed(0)}K`
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#f0f0f3',
          font: { family: 'Inter', size: 12 }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#9ca3af',
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
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
            return ` ${context.dataset.label}: ₹${context.raw.toLocaleString('en-IN')}`;
          }
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
