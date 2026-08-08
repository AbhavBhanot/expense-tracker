export const getStatusForPercent = (percent, thresholds) => {
  if (percent < thresholds.onTrack) return 'onTrack';
  if (percent < thresholds.monitor) return 'monitor';
  if (percent < thresholds.nearLimit) return 'nearLimit';
  if (percent < thresholds.critical) return 'critical';
  return 'overBudget';
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
  
  const daysElapsed = new Date().getDate(); // Simplified
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
  const weeks = Array(5).fill(0).map((_, i) => ({ week: i + 1, total: 0, count: 0, expenses: [] }));
  expenses.forEach(e => {
    const d = new Date(e.date).getDate();
    const weekIdx = Math.min(Math.floor((d - 1) / 7), 4);
    weeks[weekIdx].total += Number(e.amount);
    weeks[weekIdx].count += 1;
    weeks[weekIdx].expenses.push(e);
  });
  return weeks.filter(w => w.total > 0 || w.count > 0);
};

export const calculateDailySpending = (expenses = [], monthStr) => {
  if (!monthStr) return [];
  const [y, m] = monthStr.split('-');
  const days = new Date(y, m, 0).getDate();
  const daily = Array(days).fill(0).map((_, i) => ({
    date: `${y}-${m}-${String(i + 1).padStart(2, '0')}`,
    total: 0,
    cumulative: 0
  }));

  expenses.forEach(e => {
    const d = e.date.split('T')[0];
    const dayMatch = daily.find(day => day.date === d);
    if (dayMatch) dayMatch.total += Number(e.amount);
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
  const totalDays = daily.length || 30;
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
