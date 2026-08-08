import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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
      backgroundColor: weeklySpending.map((_, i) => {
        const colors = [
          'rgba(45, 212, 191, 0.6)',
          'rgba(20, 184, 166, 0.6)',
          'rgba(15, 118, 110, 0.6)',
          'rgba(13, 148, 136, 0.6)',
          'rgba(94, 234, 212, 0.6)',
        ];
        return colors[i % colors.length];
      }),
      borderColor: weeklySpending.map((_, i) => {
        const colors = [
          'rgba(45, 212, 191, 0.9)',
          'rgba(20, 184, 166, 0.9)',
          'rgba(15, 118, 110, 0.9)',
          'rgba(13, 148, 136, 0.9)',
          'rgba(94, 234, 212, 0.9)',
        ];
        return colors[i % colors.length];
      }),
      borderWidth: 1,
      borderRadius: 8,
      barPercentage: 0.6,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#f0f0f3',
          font: { family: 'Inter', size: 12, weight: '500' }
        }
      },
      y: {
        grid: { 
          color: '#2a2a32',
          drawBorder: false 
        },
        ticks: {
          color: '#9ca3af',
          font: { family: 'Inter', size: 11 },
          callback: (v) => `₹${(v / 1000).toFixed(0)}K`
        },
        beginAtZero: true,
      }
    },
    plugins: {
      legend: { display: false },
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
            const week = weeklySpending[context.dataIndex];
            return [
              ` Total: ₹${context.raw.toLocaleString('en-IN')}`,
              ` Transactions: ${week.count || 0}`
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
