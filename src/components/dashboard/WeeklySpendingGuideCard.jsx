import React from 'react';
import { DEFAULT_WEEKLY_GUIDE } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { Calendar, Compass, ShoppingBag, Coffee, Heart, Box } from 'lucide-react';

const ICON_MAP = {
  'Food & Munchies': Coffee,
  'Plans': Compass,
  'Shopping': ShoppingBag,
  'Essentials Restock': Heart,
  'Misc': Box
};

export default function WeeklySpendingGuideCard() {
  return (
    <div className="card weekly-guide-card">
      <div className="flex-between mb-3">
        <div>
          <h4 className="card-title flex items-center gap-2">
            <Calendar size={18} className="text-info" />
            Weekly Spending Guide
          </h4>
          <p className="text-secondary text-xs">Target weekly spending limits for variable categories</p>
        </div>
        <span className="badge badge-info">₹1,700 / wk total</span>
      </div>

      <div className="weekly-guide-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
        {DEFAULT_WEEKLY_GUIDE.map((item) => {
          const IconComponent = ICON_MAP[item.category] || Box;
          return (
            <div key={item.category} className="stat-chiclet stat-chiclet-info" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: 'var(--space-4) var(--space-5)' }}>
              <div className="flex-between mb-2" style={{ paddingLeft: '0px' }}>
                <span className="font-semibold text-sm flex items-center gap-1.5" style={{ color: 'var(--text-primary)', paddingLeft: '4px' }}>
                  <IconComponent size={15} className="text-accent" style={{ flexShrink: 0 }} />
                  {item.category}
                </span>
                <span className="badge badge-neutral text-xs font-mono">
                  {formatCurrency(item.weeklyLimit)}/wk
                </span>
              </div>
              <div className="text-tertiary text-xs truncate mb-1" style={{ paddingLeft: '4px' }}>
                {item.notes}
              </div>
              <div className="flex-between text-xs text-secondary pt-1.5 border-top" style={{ borderTop: '1px solid var(--border-subtle)', paddingLeft: '4px', paddingRight: '4px' }}>
                <span>Monthly Budget</span>
                <span className="font-medium">{formatCurrency(item.monthlyBudget)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}