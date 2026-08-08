import { format, parseISO, getDaysInMonth as dateFnsGetDaysInMonth, differenceInDays } from 'date-fns';

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatCurrencyShort = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
};

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  try { return format(d, formatStr); } catch { return ''; }
};

export const formatDateShort = (date) => {
  return formatDate(date, 'dd MMM');
};

export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const getMonthName = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, 'MMMM yyyy');
};

export const getMonthShort = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, 'MMM yyyy');
};

export const getDaysInMonth = (monthStr) => {
  if (!monthStr) return 30;
  const [year, month] = monthStr.split('-');
  return dateFnsGetDaysInMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
};

export const getDaysElapsed = (monthStr) => {
  if (!monthStr) return 0;
  const [year, month] = monthStr.split('-');
  const targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const now = new Date();
  if (now.getFullYear() === targetDate.getFullYear() && now.getMonth() === targetDate.getMonth()) {
    return now.getDate();
  } else if (now > targetDate) {
    return dateFnsGetDaysInMonth(targetDate);
  }
  return 0;
};

export const getCurrentMonthStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const generateId = () => {
  return `id-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};
