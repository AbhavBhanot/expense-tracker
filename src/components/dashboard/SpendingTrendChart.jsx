import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

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
        label: 'Actual Spending',
        data: cumulativeSpending.map(d => d.cumulative),
        borderColor: '#2dd4bf',
        backgroundColor: '#2dd4bf1a',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#2dd4bf',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
      },
      {
        label: 'Expected Pace',
        data: cumulativeSpending.map(d => d.expected),
        borderColor: '#3f3f46',
        borderDash: [6, 4],
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
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: { 
          color: '#2a2a32',
          drawBorder: false 
        },
        ticks: {
          color: '#9ca3af',
          font: { family: 'Inter', size: 11 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
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
      <h4 className="card-title">Spending Over Time</h4>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
