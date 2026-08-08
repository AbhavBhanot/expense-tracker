import { useMemo } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import {
  calculateCategoryTotals,
  calculateOverallMetrics,
  calculateWeeklySpending,
  calculateDailySpending,
  calculateSpendingPace,
  calculateEssentialVsDiscretionary,
  calculateFixedVsVariable,
  getCumulativeSpending
} from '../utils/calculations';

export function useBudgetCalculations() {
  const { state } = useBudget();
  const { currentMonth } = state;
  const monthData = state.months[currentMonth] || { budget: { totalIncome: 0, categories: [] }, expenses: [] };
  const categories = monthData.budget?.categories || [];
  const expenses = monthData.expenses || [];

  const categoryTotals = useMemo(() => 
    calculateCategoryTotals(expenses, categories), 
  [expenses, categories]);

  const overallMetrics = useMemo(() => 
    calculateOverallMetrics(expenses, categories, currentMonth), 
  [expenses, categories, currentMonth]);

  const weeklySpending = useMemo(() => 
    calculateWeeklySpending(expenses, currentMonth), 
  [expenses, currentMonth]);

  const dailySpending = useMemo(() => 
    calculateDailySpending(expenses, currentMonth), 
  [expenses, currentMonth]);

  const spendingPace = useMemo(() => 
    calculateSpendingPace(expenses, categories, currentMonth), 
  [expenses, categories, currentMonth]);

  const essentialVsDiscretionary = useMemo(() => 
    calculateEssentialVsDiscretionary(expenses, categories), 
  [expenses, categories]);

  const fixedVsVariable = useMemo(() => 
    calculateFixedVsVariable(expenses, categories), 
  [expenses, categories]);

  const cumulativeSpending = useMemo(() => 
    getCumulativeSpending(expenses, currentMonth, categories), 
  [expenses, currentMonth, categories]);

  return {
    categoryTotals,
    overallMetrics,
    weeklySpending,
    dailySpending,
    spendingPace,
    essentialVsDiscretionary,
    fixedVsVariable,
    cumulativeSpending
  };
}
