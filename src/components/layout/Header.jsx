import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { useBudget } from '../../contexts/BudgetContext';
import { getMonthName } from '../../utils/formatters';

export default function Header({ title, subtitle }) {
  const { state, switchMonth, createMonth, toggleTheme } = useBudget();
  const { currentMonth, settings } = state;
  const isDark = (settings?.theme || 'dark') === 'dark';

  const navigateMonth = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newMonth, newYear;
    
    if (direction === 'prev') {
      newMonth = month === 1 ? 12 : month - 1;
      newYear = month === 1 ? year - 1 : year;
    } else {
      newMonth = month === 12 ? 1 : month + 1;
      newYear = month === 12 ? year + 1 : year;
    }
    
    const monthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    
    if (!state.months[monthStr]) {
      createMonth(monthStr, currentMonth);
    }
    switchMonth(monthStr);
  };

  return (
    <header className="page-header" style={{ fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="page-header-left" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        <h2 className="page-title" style={{ margin: 0 }}>{title}</h2>
        {subtitle && <p className="page-subtitle" style={{ margin: 0, color: 'var(--text-tertiary)' }}>{subtitle}</p>}
      </div>
      <div className="page-header-right" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button 
          className="theme-toggle-btn btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} className="text-warning" /> : <Moon size={20} className="text-info" />}
        </button>
        <div className="month-selector" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', background: 'var(--bg-secondary)', padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-md)' }}>
          <button 
            className="btn btn-ghost btn-icon"
            onClick={() => navigateMonth('prev')}
            aria-label="Previous month"
            style={{ padding: 'var(--space-xs)' }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="month-display" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontWeight: 500 }}>
            <Calendar size={16} className="text-tertiary" />
            <span className="month-label">{getMonthName(currentMonth)}</span>
          </div>
          <button 
            className="btn btn-ghost btn-icon"
            onClick={() => navigateMonth('next')}
            aria-label="Next month"
            style={{ padding: 'var(--space-xs)' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
