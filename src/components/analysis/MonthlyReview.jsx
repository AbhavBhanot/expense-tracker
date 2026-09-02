import React, { useMemo } from 'react';
import { useBudgetCalculations } from '../../hooks/useBudgetCalculations';
import { useBudget } from '../../contexts/BudgetContext';
import { formatCurrency, formatPercent, getMonthName } from '../../utils/formatters';
import { generateRecommendations, calculateCategoryTotals } from '../../utils/calculations';
import Header from '../layout/Header';
import ProgressBar from '../shared/ProgressBar';
import StatusBadge from '../shared/StatusBadge';
import { Printer, TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle, Lightbulb, ShieldCheck, Target, FileText } from 'lucide-react';

export default function MonthlyReview() {
  const { overallMetrics, essentialVsDiscretionary, fixedVsVariable, categoryTotals } = useBudgetCalculations();
  const { state } = useBudget();
  const { currentMonth } = state;
  const currentMonthData = state.months[currentMonth] || { expenses: [], budget: { categories: [], totalIncome: 0 } };
  const { expenses } = currentMonthData;
  const categories = currentMonthData.budget?.categories || [];

  const handlePrint = () => window.print();

  // Memoize all derived data so the report doesn't recompute on every unrelated render
  const rawRecommendations = useMemo(
    () => generateRecommendations(expenses, categories, currentMonth),
    [expenses, categories, currentMonth]
  );

  const topExpenses = useMemo(
    () => [...expenses].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 5),
    [expenses]
  );

  const { underBudget, nearLimit, overBudget, bestPerforming, worstPerforming } = useMemo(() => {
    const under  = categoryTotals.filter(c => c.status === 'onTrack' && c.actualSpent > 0);
    const near   = categoryTotals.filter(c => c.status === 'nearLimit' || c.status === 'monitor');
    const over   = categoryTotals.filter(c => c.status === 'critical'  || c.status === 'overBudget');
    const best   = [...under].sort((a, b) => b.difference - a.difference)[0];
    const worst  = [...over].sort((a, b) => a.difference - b.difference)[0];
    return { underBudget: under, nearLimit: near, overBudget: over, bestPerforming: best, worstPerforming: worst };
  }, [categoryTotals]);

  // Income and Savings Calculations
  const { totalIncome, totalSaved, savingsRate, savingsGoal } = useMemo(() => {
    const income = currentMonthData.budget.totalIncome || 0;
    const savingsGoal = overallMetrics.savingsTarget || 0;

    // Actual savings = what was genuinely saved in Savings/Investment categories
    // (i.e. expenses recorded against those categories represent money set aside)
    const savingsCategoryTotals = calculateCategoryTotals(expenses, categories)
      .filter(c => c.priority === 'Savings' || c.priority === 'Investment');
    const actualSavingsSpent = savingsCategoryTotals.reduce((sum, c) => sum + c.actualSpent, 0);

    // Non-savings spending = total spent minus what went into savings categories
    const nonSavingsSpent = overallMetrics.totalSpent - actualSavingsSpent;
    const retained = income > 0 ? Math.max(0, income - nonSavingsSpent) : 0;
    const rate = income > 0 ? (retained / income) * 100 : 0;

    return { totalIncome: income, totalSaved: retained, savingsRate: rate, savingsGoal };
  }, [currentMonthData.budget.totalIncome, overallMetrics.totalSpent, overallMetrics.savingsTarget, expenses, categories]);
  
  return (
    <div className="review-page animate-fadeIn">
      <div className="review-header-row hidden-print">
        <Header title="Monthly Review" subtitle={`Automated report & financial summary for ${getMonthName(currentMonth)}`} />
        <button className="btn btn-secondary review-print-btn" onClick={handlePrint}>
          <Printer size={16} /> Print / Export PDF
        </button>
      </div>

      {/* Printable Header */}
      <div className="only-print text-center mb-4">
        <h1>Monthly Financial Report</h1>
        <h2>{getMonthName(currentMonth)}</h2>
      </div>

      {/* Top Level Summary Grid */}
      <div className="kpi-grid">
        <div className="card kpi-card kpi-default">
          <div className="kpi-content">
            <span className="kpi-label">Total Income</span>
            <span className="kpi-value">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="kpi-icon kpi-icon-default">
            <TrendingUp size={22} />
          </div>
        </div>
        <div className="card kpi-card kpi-danger">
          <div className="kpi-content">
            <span className="kpi-label">Total Spent</span>
            <span className="kpi-value text-danger">{formatCurrency(overallMetrics.totalSpent)}</span>
          </div>
          <div className="kpi-icon kpi-icon-danger">
            <TrendingDown size={22} />
          </div>
        </div>
        <div className="card kpi-card kpi-success">
          <div className="kpi-content">
            <span className="kpi-label">Budget Remaining</span>
            <span className={`kpi-value ${overallMetrics.totalRemaining >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(overallMetrics.totalRemaining)}
            </span>
          </div>
          <div className="kpi-icon kpi-icon-success">
            <Target size={22} />
          </div>
        </div>
        <div className="card kpi-card kpi-info">
          <div className="kpi-content">
            <span className="kpi-label">Savings Rate</span>
            <span className="kpi-value text-info">{formatPercent(savingsRate)}</span>
          </div>
          <div className="kpi-icon kpi-icon-info">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Spending Structure Breakdown */}
        <div className="card review-section">
          <h3 className="review-section-title">
            <Target size={18} /> Spending Proportions
          </h3>
          
          <div className="mb-4">
            <div className="flex-between mb-1">
              <span className="text-info font-medium text-xs">Essential ({formatPercent(essentialVsDiscretionary.essential.percent)})</span>
              <span className="text-warning font-medium text-xs">Discretionary ({formatPercent(essentialVsDiscretionary.discretionary.percent)})</span>
            </div>
            <div className="progress-bar progress-lg">
              <div 
                className="progress-fill progress-fill-info" 
                style={{ width: `${essentialVsDiscretionary.essential.percent}%` }}
              />
            </div>
            <div className="flex-between mt-1 text-xs text-tertiary">
              <span>{formatCurrency(essentialVsDiscretionary.essential.total)}</span>
              <span>{formatCurrency(essentialVsDiscretionary.discretionary.total)}</span>
            </div>
          </div>

          <div>
            <div className="flex-between mb-1">
              <span className="text-accent font-medium text-xs">Fixed ({formatPercent(fixedVsVariable.fixed.percent)})</span>
              <span className="text-success font-medium text-xs">Variable ({formatPercent(fixedVsVariable.variable.percent)})</span>
            </div>
            <div className="progress-bar progress-lg">
              <div 
                className="progress-fill progress-fill-info" 
                style={{ width: `${Math.min(fixedVsVariable.fixed.percent, 100)}%` }}
              />
            </div>
            <div className="flex-between mt-1 text-xs text-tertiary">
              <span>{formatCurrency(fixedVsVariable.fixed.total)}</span>
              <span>{formatCurrency(fixedVsVariable.variable.total)}</span>
            </div>
          </div>
        </div>

        {/* Savings Performance */}
        <div className="card review-section">
          <h3 className="review-section-title">
            <ShieldCheck size={18} /> Savings Target vs Actual
          </h3>
          
          <div className="flex-between mb-3">
            <div>
              <span className="text-tertiary text-xs block">Target Savings</span>
              <span className="text-lg font-bold">{formatCurrency(savingsGoal)}</span>
            </div>
            <div className="text-right">
              <span className="text-tertiary text-xs block">Actual Retained</span>
              <span className={`text-lg font-bold ${totalSaved >= savingsGoal ? 'text-success' : 'text-warning'}`}>
                {formatCurrency(totalSaved)}
              </span>
            </div>
          </div>

          <ProgressBar 
            value={totalSaved} 
            max={savingsGoal > 0 ? savingsGoal : 1} 
            label="Savings Goal Progress"
            showPercent={true}
          />

          {savingsGoal > totalSaved && (
            <div className="alert-item alert-warning mt-3">
              <AlertTriangle size={16} className="alert-icon" />
              <div className="alert-content">
                <span className="alert-message">
                  Savings gap of <strong>{formatCurrency(savingsGoal - totalSaved)}</strong> this month.
                </span>
              </div>
            </div>
          )}

          {totalSaved >= savingsGoal && savingsGoal > 0 && (
            <div className="alert-item alert-success mt-3">
              <CheckCircle size={16} className="alert-icon" />
              <div className="alert-content">
                <span className="alert-message">
                  Exceeded savings target by <strong>{formatCurrency(totalSaved - savingsGoal)}</strong>!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Performance */}
      <div className="card review-section">
        <h3 className="review-section-title">
          <FileText size={18} /> Category Budget Performance
        </h3>
        
        <div className="grid-3 mb-4">
          <div>
            <h4 className="flex items-center gap-1 text-success text-sm font-medium mb-2">
              <CheckCircle size={16} /> Under Budget ({underBudget.length})
            </h4>
            <div className="performance-list">
              {underBudget.slice(0, 5).map(c => (
                <div key={c.id || c.name} className="performance-item">
                  <span className="performance-name">{c.name}</span>
                  <span className="performance-value text-success">-{formatCurrency(c.difference)}</span>
                </div>
              ))}
              {underBudget.length === 0 && <span className="text-tertiary text-xs italic">None</span>}
            </div>
          </div>

          <div>
            <h4 className="flex items-center gap-1 text-warning text-sm font-medium mb-2">
              <Info size={16} /> Approaching Limit ({nearLimit.length})
            </h4>
            <div className="performance-list">
              {nearLimit.slice(0, 5).map(c => (
                <div key={c.id || c.name} className="performance-item">
                  <span className="performance-name">{c.name}</span>
                  <span className="performance-value text-warning">{formatPercent(c.percentUsed)}</span>
                </div>
              ))}
              {nearLimit.length === 0 && <span className="text-tertiary text-xs italic">None</span>}
            </div>
          </div>

          <div>
            <h4 className="flex items-center gap-1 text-danger text-sm font-medium mb-2">
              <AlertTriangle size={16} /> Over Budget ({overBudget.length})
            </h4>
            <div className="performance-list">
              {overBudget.slice(0, 5).map(c => (
                <div key={c.id || c.name} className="performance-item">
                  <span className="performance-name">{c.name}</span>
                  <span className="performance-value text-danger">+{formatCurrency(Math.abs(c.difference))}</span>
                </div>
              ))}
              {overBudget.length === 0 && <span className="text-tertiary text-xs italic">None</span>}
            </div>
          </div>
        </div>

        <div className="flex-between gap-3 p-4 card" style={{ background: 'var(--bg-tertiary)', flexWrap: 'wrap' }}>
          <div>
            <span className="text-tertiary text-xs block">Largest Positive Variance</span>
            <span className="text-success font-medium text-sm">
              {bestPerforming ? `${bestPerforming.name} (${formatCurrency(bestPerforming.difference)} saved)` : 'N/A'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-tertiary text-xs block">Largest Overrun</span>
            <span className="text-danger font-medium text-sm">
              {worstPerforming ? `${worstPerforming.name} (${formatCurrency(Math.abs(worstPerforming.difference))} over)` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Top 5 Expenses */}
        <div className="card review-section">
          <h3 className="review-section-title">
            Top 5 Individual Expenses
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="text-tertiary text-xs">{exp.date.split('T')[0]}</td>
                    <td className="font-medium">{exp.description}</td>
                    <td><span className="badge badge-neutral" style={{ whiteSpace: 'nowrap' }}>{exp.category}</span></td>
                    <td className="text-right font-bold">{formatCurrency(exp.amount)}</td>
                  </tr>
                ))}
                {topExpenses.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-tertiary italic">No expenses logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="card review-section">
          <h3 className="review-section-title">
            <Lightbulb size={18} className="text-warning" /> Smart Financial Advice
          </h3>
          <div className="recommendation-list">
            {rawRecommendations.map((rec, idx) => {
              const text = typeof rec === 'object' ? rec.text : rec;
              const type = typeof rec === 'object' ? rec.type : 'info';
              const variantClass = type === 'warning' ? 'rec-warning' : type === 'caution' ? 'rec-caution' : type === 'success' ? 'rec-success' : 'rec-info';
              return (
                <div key={idx} className={`recommendation-card ${variantClass}`}>
                  <Lightbulb size={18} className="alert-icon text-warning" />
                  <span className="recommendation-text">{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
