import { DEFAULT_WEEKLY_GUIDE } from './constants';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';

export const getStatusForPercent = (percent, thresholds) => {
  if (percent < thresholds.onTrack) return 'onTrack';
  if (percent < thresholds.monitor) return 'monitor';
  if (percent < thresholds.nearLimit) return 'nearLimit';
  if (percent < thresholds.critical) return 'critical';
  return 'overBudget';
};

export const getWeeklyGuideMetrics = (expenses = [], categories = [], monthStr) => {
  const now = new Date();
  let refDate = now;

  if (monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && (now.getFullYear() !== y || (now.getMonth() + 1) !== m)) {
      refDate = new Date(y, m - 1, 1);
    }
  }

  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(refDate, { weekStartsOn: 1 });

  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);

  const currentWeekExpenses = expenses.filter(exp => {
    if (!exp || !exp.date) return false;
    try {
      const expDate = typeof exp.date === 'string' ? parseISO(exp.date) : new Date(exp.date);
      return expDate >= weekStart && expDate <= weekEnd;
    } catch {
      return false;
    }
  });

  const categoryMetrics = DEFAULT_WEEKLY_GUIDE.map(guideItem => {
    const budgetCat = categories.find(c => 
      c.name === guideItem.categoryName || 
      c.name === guideItem.category
    );

    const weeklyLimit = Number(budgetCat?.weeklyLimit || guideItem.weeklyLimit || 0);
    const monthlyBudget = Number(budgetCat?.planned || guideItem.monthlyBudget || 0);

    const catExpenses = currentWeekExpenses.filter(e => 
      e.category === guideItem.categoryName || 
      e.category === guideItem.category || 
      (budgetCat && e.category === budgetCat.name)
    );

    const weeklySpent = catExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const percentUsed = weeklyLimit > 0 ? (weeklySpent / weeklyLimit) * 100 : (weeklySpent > 0 ? 100 : 0);
    const remaining = weeklyLimit - weeklySpent;
    const isOverBudget = weeklySpent > weeklyLimit;
    const overAmount = isOverBudget ? weeklySpent - weeklyLimit : 0;

    return {
      category: guideItem.category,
      categoryName: guideItem.categoryName,
      weeklyLimit,
      monthlyBudget,
      weeklySpent,
      percentUsed,
      remaining,
      isOverBudget,
      overAmount,
      notes: guideItem.notes,
      count: catExpenses.length
    };
  });

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyBreakdown = dayNames.map((dayName, idx) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + idx);
    const dateStr = format(d, 'yyyy-MM-dd');

    const dayExpenses = currentWeekExpenses.filter(e => {
      try {
        const eStr = format(typeof e.date === 'string' ? parseISO(e.date) : new Date(e.date), 'yyyy-MM-dd');
        return eStr === dateStr;
      } catch {
        return false;
      }
    });

    const total = dayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return {
      dayLabel: dayName,
      dateStr,
      dateFormatted: format(d, 'dd MMM'),
      total,
      count: dayExpenses.length
    };
  });

  const totalWeeklySpent = currentWeekExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalWeeklyLimit = categoryMetrics.reduce((sum, c) => sum + c.weeklyLimit, 0);
  const hasExpensesThisWeek = currentWeekExpenses.length > 0 && totalWeeklySpent > 0;

  return {
    weekStart,
    weekEnd,
    weekLabel: `${format(weekStart, 'dd MMM')} - ${format(weekEnd, 'dd MMM yyyy')}`,
    categoryMetrics,
    dailyBreakdown,
    totalWeeklySpent,
    totalWeeklyLimit,
    hasExpensesThisWeek
  };
};

export const calculateCategoryTotals = (expenses = [], categories = []) => {
  const spendMap = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + (Number(exp.amount) || 0);
    return acc;
  }, {});

  return categories.map(cat => {
    const actualSpent = spendMap[cat.name] || 0;
    const remaining = cat.planned - actualSpent;
    const percentUsed = cat.planned > 0 ? (actualSpent / cat.planned) * 100 : (actualSpent > 0 ? 100 : 0);
    const difference = cat.planned - actualSpent;
    const status = getStatusForPercent(percentUsed, { onTrack: 50, monitor: 75, nearLimit: 90, critical: 100 });
    return { ...cat, actualSpent, remaining, percentUsed, difference, status };
  });
};

export const calculateOverallMetrics = (expenses = [], categories = [], monthStr) => {
  let totalBudget = 0;
  let savingsTarget = 0;
  
  categories.forEach(c => {
    if (c.priority === 'Savings' || c.priority === 'Investment') {
      savingsTarget += c.planned;
    } else {
      totalBudget += c.planned;
    }
  });

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : (totalSpent > 0 ? 100 : 0);
  const totalTransactions = expenses.length;
  const avgTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0;
  
  // Month-aware daysElapsed: use real date for current month, full month for past months
  let daysElapsed = 1;
  if (monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    const now = new Date();
    const totalDaysInMonth = new Date(y, m, 0).getDate();
    if (now.getFullYear() === y && now.getMonth() + 1 === m) {
      daysElapsed = now.getDate();
    } else if (new Date(y, m - 1, 1) < now) {
      // Past month — all days elapsed
      daysElapsed = totalDaysInMonth;
    } else {
      // Future month — 0 days
      daysElapsed = 0;
    }
  } else {
    daysElapsed = new Date().getDate();
  }
  const avgDailySpending = daysElapsed > 0 ? totalSpent / daysElapsed : 0;

  const categoryTotals = calculateCategoryTotals(expenses, categories).filter(c => c.priority !== 'Savings' && c.priority !== 'Investment');
  
  let highestCategory = null;
  let lowestCategory = null;
  if (categoryTotals.length > 0) {
    const sorted = [...categoryTotals].sort((a, b) => b.actualSpent - a.actualSpent);
    highestCategory = sorted[0];
    const nonZero = sorted.filter(c => c.actualSpent > 0);
    lowestCategory = nonZero.length > 0 ? nonZero[nonZero.length - 1] : sorted[sorted.length - 1];
  }

  let largestExpense = null;
  if (expenses.length > 0) {
    largestExpense = [...expenses].sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
  }

  let essentialSpending = 0;
  let discretionarySpending = 0;
  let fixedSpending = 0;
  let variableSpending = 0;

  expenses.forEach(e => {
    const cat = categories.find(c => c.name === e.category);
    if (cat) {
      if (cat.priority === 'Essential') essentialSpending += Number(e.amount);
      if (cat.priority === 'Discretionary') discretionarySpending += Number(e.amount);
      if (cat.expenseType === 'Fixed') fixedSpending += Number(e.amount);
      if (cat.expenseType === 'Variable') variableSpending += Number(e.amount);
    }
  });

  return {
    totalBudget, totalSpent, totalRemaining, percentUsed,
    totalTransactions, avgTransaction, avgDailySpending,
    highestCategory, lowestCategory, largestExpense,
    essentialSpending, discretionarySpending, fixedSpending, variableSpending,
    savingsTarget, actualSavings: 0, savingsRemaining: savingsTarget, savingsPercent: 0
  };
};

export const calculateWeeklySpending = (expenses = [], monthStr) => {
  if (!monthStr) {
    // Fallback: simple day÷7 bucketing when no month context
    const weeks = Array(5).fill(0).map((_, i) => ({ week: i + 1, total: 0, count: 0, expenses: [], label: `Week ${i + 1}` }));
    expenses.forEach(e => {
      const d = new Date(e.date).getDate();
      const weekIdx = Math.min(Math.floor((d - 1) / 7), 4);
      weeks[weekIdx].total += Number(e.amount);
      weeks[weekIdx].count += 1;
      weeks[weekIdx].expenses.push(e);
    });
    return weeks.filter(w => w.total > 0 || w.count > 0);
  }

  const [y, m] = monthStr.split('-').map(Number);
  // Build Mon-anchored week buckets that span the whole month
  const monthStart = new Date(y, m - 1, 1);
  const monthEnd   = new Date(y, m, 0); // last day of month

  // Find the Monday on or before monthStart
  const firstMonday = new Date(monthStart);
  const dow = firstMonday.getDay(); // 0=Sun
  const diffToMonday = (dow === 0 ? -6 : 1 - dow);
  firstMonday.setDate(firstMonday.getDate() + diffToMonday);
  firstMonday.setHours(0, 0, 0, 0);

  const weeks = [];
  let cursor = new Date(firstMonday);
  let weekNum = 1;
  while (cursor <= monthEnd) {
    const weekStartLocal = new Date(cursor);
    const weekEndLocal = new Date(cursor);
    weekEndLocal.setDate(weekEndLocal.getDate() + 6);
    weekEndLocal.setHours(23, 59, 59, 999);

    const displayStart = new Date(Math.max(weekStartLocal, monthStart));
    const displayEnd   = new Date(Math.min(weekEndLocal, monthEnd));

    weeks.push({
      week: weekNum,
      label: `${format(displayStart, 'd MMM')}–${format(displayEnd, 'd MMM')}`,
      total: 0,
      count: 0,
      expenses: [],
      weekStart: weekStartLocal,
      weekEnd: weekEndLocal,
    });

    cursor.setDate(cursor.getDate() + 7);
    weekNum++;
  }

  expenses.forEach(e => {
    if (!e.date) return;
    try {
      const expDate = typeof e.date === 'string' ? parseISO(e.date) : new Date(e.date);
      const bucket = weeks.find(w => expDate >= w.weekStart && expDate <= w.weekEnd);
      if (bucket) {
        bucket.total += Number(e.amount) || 0;
        bucket.count += 1;
        bucket.expenses.push(e);
      }
    } catch { /* skip malformed dates */ }
  });

  return weeks.filter(w => w.total > 0 || w.count > 0);
};

export const calculateDailySpending = (expenses = [], monthStr) => {
  if (!monthStr) return [];
  const [y, m] = monthStr.split('-');
  const totalDays = new Date(y, m, 0).getDate();
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === Number(y) && now.getMonth() + 1 === Number(m);
  // For current month only show days up to today; for past months show the full month
  const daysToShow = isCurrentMonth ? now.getDate() : totalDays;

  const daily = Array(daysToShow).fill(0).map((_, i) => ({
    date: `${y}-${m}-${String(i + 1).padStart(2, '0')}`,
    total: 0,
    cumulative: 0
  }));

  expenses.forEach(e => {
    const d = (e.date || '').split('T')[0];
    const dayMatch = daily.find(day => day.date === d);
    if (dayMatch) dayMatch.total += Number(e.amount) || 0;
  });

  let cumulative = 0;
  daily.forEach(d => {
    cumulative += d.total;
    d.cumulative = cumulative;
  });

  return daily;
};

export const calculateSpendingPace = (expenses = [], categories = [], monthStr) => {
  const totalBudget = categories.filter(c => c.priority !== 'Savings').reduce((sum, c) => sum + c.planned, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  if (!monthStr) return { expectedPercent: 0, actualPercent: 0, paceStatus: 'onTrack', daysElapsed: 0, daysTotal: 30 };
  
  const [y, m] = monthStr.split('-');
  const totalDays = new Date(y, m, 0).getDate();
  
  const now = new Date();
  let daysElapsed = totalDays;
  if (now.getFullYear() === Number(y) && now.getMonth() + 1 === Number(m)) {
    daysElapsed = now.getDate();
  } else if (now < new Date(y, m - 1, 1)) {
    daysElapsed = 0;
  }

  const expectedPercent = daysElapsed > 0 ? (daysElapsed / totalDays) * 100 : 0;
  const actualPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  let paceStatus = 'onTrack';
  if (actualPercent > expectedPercent + 10) paceStatus = 'highPace';
  else if (actualPercent < expectedPercent - 10) paceStatus = 'lowPace';

  return { expectedPercent, actualPercent, paceStatus, daysElapsed, daysTotal: totalDays };
};

export const calculateCategoryPace = (categoryName, expenses = [], categories = [], monthStr) => {
  const cat = categories.find(c => c.name === categoryName);
  if (!cat) return null;
  const catExpenses = expenses.filter(e => e.category === categoryName);
  return calculateSpendingPace(catExpenses, [cat], monthStr);
};

export const generateAlerts = (expenses = [], categories = [], monthStr, thresholds = { onTrack: 50, monitor: 75, nearLimit: 90, critical: 100 }) => {
  const alerts = [];
  const catTotals = calculateCategoryTotals(expenses, categories);
  
  catTotals.forEach(c => {
    if (c.percentUsed >= 100) {
      alerts.push({ type: 'overBudget', severity: 'critical', category: c.name, message: `Over budget by ₹${c.actualSpent - c.planned}`, value: c.percentUsed });
    } else if (c.percentUsed >= thresholds.nearLimit) {
      alerts.push({ type: 'nearLimit', severity: 'warning', category: c.name, message: `Near limit (${c.percentUsed.toFixed(1)}%)`, value: c.percentUsed });
    }
  });
  
  const pace = calculateSpendingPace(expenses, categories, monthStr);
  if (pace.paceStatus === 'highPace') {
    alerts.push({ type: 'highPace', severity: 'warning', category: 'Overall', message: `Spending faster than expected (${pace.actualPercent.toFixed(1)}% vs ${pace.expectedPercent.toFixed(1)}%)`, value: pace.actualPercent });
  }

  return alerts;
};

export const generateRecommendations = (expenses = [], categories = [], monthStr) => {
  const recommendations = [];
  const metrics = calculateOverallMetrics(expenses, categories, monthStr);
  const catTotals = calculateCategoryTotals(expenses, categories);
  const pace = calculateSpendingPace(expenses, categories, monthStr);
  
  // Overspending alerts
  const overBudget = catTotals.filter(c => c.percentUsed >= 100 && c.priority !== 'Savings');
  if (overBudget.length > 0) {
    recommendations.push({ type: 'warning', text: `Reduce spending in ${overBudget.map(c => c.name).join(', ')} — ${overBudget.length === 1 ? 'this category has' : 'these categories have'} exceeded the budget.` });
  }

  // Near limit categories
  const nearLimit = catTotals.filter(c => c.percentUsed >= 75 && c.percentUsed < 100 && c.priority !== 'Savings');
  if (nearLimit.length > 0) {
    recommendations.push({ type: 'caution', text: `Watch spending in ${nearLimit.map(c => c.name).join(', ')} — approaching budget limits.` });
  }

  // Underused categories
  const underused = catTotals.filter(c => c.percentUsed < 20 && c.planned > 0 && c.priority !== 'Savings' && c.priority !== 'Investment');
  if (underused.length > 0 && pace.daysElapsed > 15) {
    recommendations.push({ type: 'info', text: `Consider reallocating budget from ${underused.map(c => c.name).join(', ')} — consistently underused.` });
  }

  // Spending pace
  if (pace.paceStatus === 'highPace') {
    recommendations.push({ type: 'warning', text: `You\'re spending faster than expected — ${pace.actualPercent.toFixed(0)}% used with only ${pace.expectedPercent.toFixed(0)}% of the month elapsed.` });
  }

  // Essential vs discretionary
  if (metrics.discretionarySpending > metrics.essentialSpending && metrics.totalTransactions > 5) {
    recommendations.push({ type: 'caution', text: 'Discretionary spending exceeds essential spending. Review lifestyle expenses.' });
  }

  // Overall budget usage
  if (metrics.percentUsed > 90) {
    recommendations.push({ type: 'warning', text: 'Over 90% of budget used. Prioritize essential expenses only for the remaining month.' });
  } else if (metrics.percentUsed > 75) {
    recommendations.push({ type: 'caution', text: 'Budget is 75%+ used. Consider limiting discretionary spending.' });
  }

  // Savings protection
  if (metrics.savingsTarget > 0 && metrics.actualSavings < metrics.savingsTarget * 0.5 && pace.daysElapsed > 15) {
    recommendations.push({ type: 'warning', text: 'Savings target is less than 50% met. Protect your savings before increasing discretionary spending.' });
  }

  // Large expense detection
  if (metrics.largestExpense && metrics.avgTransaction > 0) {
    const ratio = metrics.largestExpense.amount / metrics.avgTransaction;
    if (ratio > 5) {
      recommendations.push({ type: 'info', text: `Your largest expense (₹${metrics.largestExpense.amount.toLocaleString('en-IN')}) is ${ratio.toFixed(0)}x your average. Review if this was necessary.` });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({ type: 'success', text: 'Great job! Your spending is well balanced and within budget.' });
  }

  return recommendations;
};

export const calculateEssentialVsDiscretionary = (expenses = [], categories = []) => {
  let essential = { total: 0, categories: {} };
  let discretionary = { total: 0, categories: {} };

  expenses.forEach(e => {
    const cat = categories.find(c => c.name === e.category);
    if (cat) {
      if (cat.priority === 'Essential') {
        essential.total += Number(e.amount);
        essential.categories[cat.name] = (essential.categories[cat.name] || 0) + Number(e.amount);
      } else if (cat.priority === 'Discretionary') {
        discretionary.total += Number(e.amount);
        discretionary.categories[cat.name] = (discretionary.categories[cat.name] || 0) + Number(e.amount);
      }
    }
  });

  const total = essential.total + discretionary.total;
  essential.percent = total > 0 ? (essential.total / total) * 100 : 0;
  discretionary.percent = total > 0 ? (discretionary.total / total) * 100 : 0;

  return { essential, discretionary };
};

export const calculateFixedVsVariable = (expenses = [], categories = []) => {
  let fixed = { total: 0, categories: {} };
  let variable = { total: 0, categories: {} };

  expenses.forEach(e => {
    const cat = categories.find(c => c.name === e.category);
    if (cat) {
      if (cat.expenseType === 'Fixed') {
        fixed.total += Number(e.amount);
        fixed.categories[cat.name] = (fixed.categories[cat.name] || 0) + Number(e.amount);
      } else if (cat.expenseType === 'Variable') {
        variable.total += Number(e.amount);
        variable.categories[cat.name] = (variable.categories[cat.name] || 0) + Number(e.amount);
      }
    }
  });

  const total = fixed.total + variable.total;
  fixed.percent = total > 0 ? (fixed.total / total) * 100 : 0;
  variable.percent = total > 0 ? (variable.total / total) * 100 : 0;

  return { fixed, variable };
};

export const getCumulativeSpending = (expenses = [], monthStr, categories = []) => {
  const totalBudget = categories
    .filter(c => c.priority !== 'Savings' && c.priority !== 'Investment')
    .reduce((sum, c) => sum + c.planned, 0);
  const daily = calculateDailySpending(expenses, monthStr);

  if (!monthStr || daily.length === 0) return daily;
  const [y, m] = monthStr.split('-');
  const totalDays = new Date(y, m, 0).getDate(); // full month for expected line
  const dailyExpected = totalBudget / totalDays;
  
  return daily.map((d, i) => {
    const day = parseInt(d.date.split('-')[2]);
    return {
      date: d.date,
      dateLabel: `${day}`,
      cumulative: d.cumulative,
      expected: Math.round(dailyExpected * (i + 1)),
      dailySpent: d.total
    };
  });
};
