import React, { useState, useMemo, useCallback } from 'react';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import ProgressBar from '../shared/ProgressBar';
import StatusBadge from '../shared/StatusBadge';
import Header from '../layout/Header';
import { useBudget } from '../../contexts/BudgetContext';
import { calculateCategoryPace } from '../../utils/calculations';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, TrendingUp, Info } from 'lucide-react';
import SpendingPieChart from '../dashboard/SpendingPieChart';
import CategoryProgressList from '../dashboard/CategoryProgressList';

export default function CategorySummary() {
  const { categoryTotals } = useBudgetCalculations();
  const { state } = useBudget();
  const currentMonthData = state.months[state.currentMonth] || { expenses: [], budget: { categories: [] } };
  const { expenses } = currentMonthData;
  const categories = currentMonthData.budget?.categories || [];

  const [sortConfig, setSortConfig] = useState({ key: 'actualSpent', direction: 'desc' });
  const [expandedCategory, setExpandedCategory] = useState(null);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  const sortedCategories = useMemo(() => {
    const statusOrder = { critical: 5, overBudget: 4, nearLimit: 3, monitor: 2, onTrack: 1 };
    return [...categoryTotals].sort((a, b) => {
      let aValue = sortConfig.key === 'status' ? (statusOrder[a.status] || 0) : a[sortConfig.key];
      let bValue = sortConfig.key === 'status' ? (statusOrder[b.status] || 0) : b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [categoryTotals, sortConfig]);

  // Memoize KPI counts so they don't recompute on every render
  const { onTrackCount, nearLimitCount, overBudgetCount } = useMemo(() => ({
    onTrackCount:   categoryTotals.filter(c => c.status === 'onTrack').length,
    nearLimitCount: categoryTotals.filter(c => c.status === 'nearLimit' || c.status === 'monitor').length,
    overBudgetCount: categoryTotals.filter(c => c.status === 'critical' || c.status === 'overBudget').length,
  }), [categoryTotals]);

  // Compute pace for all categories in one pass — keyed by category name
  const paceMap = useMemo(() => {
    const map = {};
    for (const cat of categoryTotals) {
      const pace = calculateCategoryPace(cat.name, expenses, categories, state.currentMonth);
      if (!pace) { map[cat.name] = { icon: '🚶', label: 'Normal Pace' }; continue; }
      if (pace.paceStatus === 'highPace') { map[cat.name] = { icon: '🏃', label: 'Fast Burn' }; continue; }
      if (pace.paceStatus === 'lowPace')  { map[cat.name] = { icon: '🐢', label: 'Slow Burn' }; continue; }
      map[cat.name] = { icon: '🚶', label: 'Normal Pace' };
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryTotals, expenses, categories, state.currentMonth]);

  // Pre-group expenses by category so row expansion doesn't re-filter the full list
  const expensesByCategory = useMemo(() => {
    const map = {};
    for (const exp of expenses) {
      if (!map[exp.category]) map[exp.category] = [];
      map[exp.category].push(exp);
    }
    return map;
  }, [expenses]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <span className="text-xs">▲</span> : <span className="text-xs">▼</span>;
  };

  return (
    <div className="category-summary-page animate-fadeIn">
      <Header title="Category Summary" subtitle="Detailed category breakdown, variances, and pace metrics" />

      <div className="kpi-grid mb-3">
        <div className="card kpi-card kpi-success">
          <div className="kpi-content">
            <span className="kpi-label">On Track</span>
            <span className="kpi-value text-success">{onTrackCount}</span>
            <span className="kpi-subtitle">Healthy categories</span>
          </div>
          <div className="kpi-icon kpi-icon-success">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="card kpi-card kpi-warning">
          <div className="kpi-content">
            <span className="kpi-label">Near Limit</span>
            <span className="kpi-value text-warning">{nearLimitCount}</span>
            <span className="kpi-subtitle">Require monitoring</span>
          </div>
          <div className="kpi-icon kpi-icon-warning">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="card kpi-card kpi-danger">
          <div className="kpi-content">
            <span className="kpi-label">Over Budget</span>
            <span className="kpi-value text-danger">{overBudgetCount}</span>
            <span className="kpi-subtitle">Critical attention</span>
          </div>
          <div className="kpi-icon kpi-icon-danger">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Spending by Category chart + Category Status progress list */}
      <div className="dashboard-bottom-grid">
        <SpendingPieChart categoryTotals={categoryTotals} />
        <CategoryProgressList categoryTotals={categoryTotals} />
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Category {getSortIcon('name')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('planned')}>
                  Budget {getSortIcon('planned')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('actualSpent')}>
                  Spent {getSortIcon('actualSpent')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('remaining')}>
                  Remaining {getSortIcon('remaining')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('percentUsed')}>
                  % Used {getSortIcon('percentUsed')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                  Status {getSortIcon('status')}
                </th>
                <th>Pace</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map(category => {
                const isExpanded = expandedCategory === category.name;
                const pace = paceMap[category.name] || { icon: '🚶', label: 'Normal Pace' };
                const catExpenses = expensesByCategory[category.name] || [];
                const isWarning = category.status === 'critical' || category.status === 'overBudget';
                
                return (
                  <React.Fragment key={category.id || category.name}>
                    <tr 
                      className={`category-row-expandable ${isWarning ? 'bg-danger-light' : ''}`}
                      onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                    >
                      <td className="font-medium">
                        <div className="td-flex-inner">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>{category.name}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{formatCurrency(category.planned)}</td>
                      <td className="font-semibold">{formatCurrency(category.actualSpent)}</td>
                      <td className={category.remaining < 0 ? 'text-danger font-bold' : 'text-secondary'}>
                        {formatCurrency(category.remaining)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', minWidth: 120 }}>
                          <span style={{ fontSize: 'var(--text-xs)', width: '36px' }}>{formatPercent(category.percentUsed, 0)}</span>
                          <div style={{ flex: 1 }}>
                            <ProgressBar 
                              value={category.actualSpent} 
                              max={category.planned} 
                              showPercent={false}
                              size="sm"
                            />
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={category.status} /></td>
                      <td title={pace.label}>
                        <span className="pace-indicator">{pace.icon} <span className="text-xs text-tertiary hidden-mobile">{pace.label}</span></span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" className="expanded-transactions">
                          <h4 style={{ margin: '0 0 var(--space-xs) 0', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                            Transactions in {category.name} ({catExpenses.length})
                          </h4>
                          {catExpenses.length > 0 ? (
                            <div className="flex-col gap-1">
                              {catExpenses.map(exp => (
                                <div key={exp.id} className="flex-between py-1 border-bottom" style={{ borderBottom: '1px solid var(--border-color)', fontSize: 'var(--text-xs)' }}>
                                  <div>
                                    <div className="font-medium">{exp.description}</div>
                                    <div className="text-tertiary">{(exp.date || '').split('T')[0]} &bull; {exp.paymentMethod || 'Default'}</div>
                                  </div>
                                  <div className="font-bold">{formatCurrency(exp.amount)}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-tertiary text-xs italic">No transactions recorded for this category.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {sortedCategories.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-tertiary">
                    <Info size={24} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
                    No categories set up yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
