import { useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { generateAlerts } from '../utils/calculations';

export function useAlerts() {
  const { state } = useBudget();
  const { currentMonth, settings } = state;
  const monthData = state.months[currentMonth] || { budget: { totalIncome: 0, categories: [] }, expenses: [] };
  const categories = monthData.budget?.categories || [];
  const expenses = monthData.expenses || [];

  const alerts = useMemo(() => {
    // Generates smart alerts based on current state and user settings
    return generateAlerts(expenses, categories, currentMonth, settings?.thresholds);
  }, [expenses, categories, currentMonth, settings]);

  return alerts;
}
