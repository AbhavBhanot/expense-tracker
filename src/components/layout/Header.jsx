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
    <header className="page-header">
      <div className="page-header-left">
        <h2 className="page-title">{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="page-header-right">
        <button 
          className="btn btn-ghost btn-icon hidden-mobile"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="month-selector">
          <button 
            className="btn btn-ghost btn-icon"
            onClick={() => navigateMonth('prev')}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="month-display">
            <Calendar size={14} className="text-tertiary" />
            <span className="month-label">{getMonthName(currentMonth)}</span>
          </div>
          <button 
            className="btn btn-ghost btn-icon"
            onClick={() => navigateMonth('next')}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
