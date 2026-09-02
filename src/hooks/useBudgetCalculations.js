import { useMemo, useState, useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import {
  calculateCategoryTotals,
  calculateOverallMetrics,
  calculateWeeklySpending,
  calculateDailySpending,
  calculateSpendingPace,
  calculateEssentialVsDiscretionary,
  calculateFixedVsVariable,
  getCumulativeSpending,
  getWeeklyGuideMetrics
} from '../utils/calculations';

// Returns today's date string 'YYYY-MM-DD' — stable within a day, changes at midnight
function useTodayKey() {
  const getTodayKey = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  };
  const [todayKey, setTodayKey] = useState(getTodayKey);

  useEffect(() => {
    // Schedule a state update at the next local midnight so memos re-run
    const msUntilMidnight = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
    };
    let dailyInterval;
    const t = setTimeout(() => {
      setTodayKey(getTodayKey());
      dailyInterval = setInterval(() => setTodayKey(getTodayKey()), 24 * 60 * 60 * 1000);
    }, msUntilMidnight());
    return () => { clearTimeout(t); clearInterval(dailyInterval); };
  }, []);

  return todayKey;
}

export function useBudgetCalculations() {
  const { state } = useBudget();
  const { currentMonth } = state;
  const monthData = state.months[currentMonth] || { budget: { totalIncome: 0, categories: [] }, expenses: [] };
  const categories = monthData.budget?.categories || [];
  const expenses = monthData.expenses || [];

  // Changes at midnight — ensures time-sensitive memos (weekly window, daily counts) re-run
  const todayKey = useTodayKey();

  const categoryTotals = useMemo(() => 
    calculateCategoryTotals(expenses, categories), 
  [expenses, categories]);

  const overallMetrics = useMemo(() => 
    calculateOverallMetrics(expenses, categories, currentMonth), 
  [expenses, categories, currentMonth, todayKey]);

  const weeklySpending = useMemo(() => 
    calculateWeeklySpending(expenses, currentMonth), 
  [expenses, currentMonth]);

  const dailySpending = useMemo(() => 
    calculateDailySpending(expenses, currentMonth), 
  [expenses, currentMonth, todayKey]);

  const spendingPace = useMemo(() => 
    calculateSpendingPace(expenses, categories, currentMonth), 
  [expenses, categories, currentMonth, todayKey]);

  const essentialVsDiscretionary = useMemo(() => 
    calculateEssentialVsDiscretionary(expenses, categories), 
  [expenses, categories]);

  const fixedVsVariable = useMemo(() => 
    calculateFixedVsVariable(expenses, categories), 
  [expenses, categories]);

  const cumulativeSpending = useMemo(() => 
    getCumulativeSpending(expenses, currentMonth, categories), 
  [expenses, currentMonth, categories, todayKey]);

  const weeklyGuideMetrics = useMemo(() => 
    getWeeklyGuideMetrics(expenses, categories, currentMonth), 
  [expenses, categories, currentMonth, todayKey]);

  return {
    categoryTotals,
    overallMetrics,
    weeklySpending,
    dailySpending,
    spendingPace,
    essentialVsDiscretionary,
    fixedVsVariable,
    cumulativeSpending,
    weeklyGuideMetrics
  };
}

