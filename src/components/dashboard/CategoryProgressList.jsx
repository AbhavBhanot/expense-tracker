import React from 'react';
import ProgressBar from '../shared/ProgressBar';
import StatusBadge from '../shared/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export default function CategoryProgressList({ categoryTotals = [] }) {
  const sorted = [...categoryTotals]
    .filter(c => c.priority !== 'Savings' && c.priority !== 'Investment')
    .sort((a, b) => b.percentUsed - a.percentUsed);

  if (sorted.length === 0) {
    return null;
  }

  return (
    <div className="card category-progress-card">
      <h4 className="card-title">Category Status</h4>
      <div className="category-progress-list">
        {sorted.map((cat, idx) => (
          <div 
            key={cat.id || cat.name} 
            className={`category-progress-item animate-slideUp`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="category-progress-header">
              <div className="category-progress-info">
                <span className="category-progress-name">{cat.name}</span>
                <StatusBadge status={cat.status} size="sm" showLabel={false} />
              </div>
              <div className="category-progress-amounts">
                <span className="category-spent">{formatCurrency(cat.actualSpent)}</span>
                <span className="category-separator">/</span>
                <span className="category-budget">{formatCurrency(cat.planned)}</span>
              </div>
            </div>
            <ProgressBar 
              value={cat.actualSpent} 
              max={cat.planned} 
              showPercent={false}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
