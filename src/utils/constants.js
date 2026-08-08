export const DEFAULT_MONTHLY_INCOME = 26000;

export const DEFAULT_CATEGORIES = [
  { id: 'cat-rent', name: 'Rent', planned: 12500, expenseType: 'Fixed', priority: 'Essential', notes: 'Monthly rent (Non-negotiable)' },
  { id: 'cat-cook', name: 'Cook', planned: 1000, expenseType: 'Fixed', priority: 'Essential', notes: 'Monthly cook' },
  { id: 'cat-maid', name: 'Maid', planned: 425, expenseType: 'Fixed', priority: 'Essential', notes: 'Monthly maid' },
  { id: 'cat-wifi', name: 'WiFi', planned: 235, expenseType: 'Fixed', priority: 'Essential', notes: 'Internet connection' },
  { id: 'cat-electricity', name: 'Electricity', planned: 700, expenseType: 'Fixed', priority: 'Essential', notes: 'Electricity bill (approx ₹400-700)' },
  { id: 'cat-groceries', name: 'Groceries', planned: 2500, expenseType: 'Fixed', priority: 'Essential', notes: 'Groceries & provisions (approx ₹2000-2500)' },
  { id: 'cat-subscriptions', name: 'Subscriptions', planned: 148, expenseType: 'Fixed', priority: 'Discretionary', notes: 'Apple Music/TV (₹59) + YT Premium (₹89)' },
  { id: 'cat-shopping', name: 'Shopping & Personal Indulgence', planned: 2000, expenseType: 'Variable', priority: 'Discretionary', notes: 'Clothes, footwear, bags, makeup, jewellery, etc.', weeklyLimit: 500 },
  { id: 'cat-plans', name: 'Plans', planned: 2400, expenseType: 'Variable', priority: 'Discretionary', notes: 'Cabs, transport, dining out, drinking, clubbing, movies, gigs', weeklyLimit: 600 },
  { id: 'cat-food-deliveries', name: 'Food & Deliveries', planned: 1000, expenseType: 'Variable', priority: 'Discretionary', notes: 'Canteen, snacks, Swiggy food deliveries', weeklyLimit: 250 },
  { id: 'cat-restocking', name: 'Restocking Essentials', planned: 800, expenseType: 'Variable', priority: 'Essential', notes: 'Skincare, beauty products, toiletries, pads, etc.', weeklyLimit: 200 },
  { id: 'cat-misc', name: 'Misc', planned: 800, expenseType: 'Variable', priority: 'Discretionary', notes: 'Sutta money, gifts for friends, miscellaneous', weeklyLimit: 200 },
  { id: 'cat-savings', name: 'Savings', planned: 1500, expenseType: 'Fixed', priority: 'Savings', notes: 'Travel & emergency fund' }
];

export const DEFAULT_WEEKLY_GUIDE = [
  { category: 'Food & Munchies', categoryName: 'Food & Deliveries', weeklyLimit: 250, monthlyBudget: 1000, notes: 'Canteen, snacks, Swiggy deliveries' },
  { category: 'Plans', categoryName: 'Plans', weeklyLimit: 600, monthlyBudget: 2400, notes: 'Cabs, drinking, dining out, outings, clubbing, movies' },
  { category: 'Shopping', categoryName: 'Shopping & Personal Indulgence', weeklyLimit: 500, monthlyBudget: 2000, notes: 'Clothes, footwear, bags, makeup, jewellery' },
  { category: 'Essentials Restock', categoryName: 'Restocking Essentials', weeklyLimit: 200, monthlyBudget: 800, notes: 'Skincare, toiletries, beauty, pads' },
  { category: 'Misc', categoryName: 'Misc', weeklyLimit: 200, monthlyBudget: 800, notes: 'Including suttas, gifts for friends' }
];

export const DEFAULT_SETTINGS = {
  thresholds: { onTrack: 50, monitor: 75, nearLimit: 90, critical: 100 },
  paymentMethods: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'],
  currency: '₹'
};

export const STATUS_CONFIG = {
  onTrack: { label: 'On Track', emoji: '🟢', color: '#34d399', bgColor: 'rgba(52, 211, 153, 0.1)', minPercent: 0, maxPercent: 49 },
  monitor: { label: 'Monitor', emoji: '🟡', color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.1)', minPercent: 50, maxPercent: 74 },
  nearLimit: { label: 'Near Limit', emoji: '🟠', color: '#fb923c', bgColor: 'rgba(251, 146, 60, 0.1)', minPercent: 75, maxPercent: 89 },
  critical: { label: 'Critical', emoji: '🔴', color: '#f87171', bgColor: 'rgba(248, 113, 113, 0.1)', minPercent: 90, maxPercent: 99 },
  overBudget: { label: 'Over Budget', emoji: '🔴', color: '#ef4444', bgColor: 'rgba(220, 38, 38, 0.1)', minPercent: 100, maxPercent: Infinity }
};

export const CHART_COLORS = [
  '#2dd4bf', '#14b8a6', '#0d9488', '#60a5fa', '#3b82f6', '#a78bfa',
  '#f472b6', '#fb923c', '#fbbf24', '#34d399', '#6ee7b7', '#93c5fd',
  '#c4b5fd', '#f9a8d4', '#fdba74', '#86efac'
];

export const CATEGORY_ICONS = {
  'Rent': 'Home',
  'Cook': 'Utensils',
  'Maid': 'UserCheck',
  'WiFi': 'Wifi',
  'Electricity': 'Zap',
  'Groceries': 'ShoppingCart',
  'Subscriptions': 'Tv',
  'Shopping & Personal Indulgence': 'ShoppingBag',
  'Plans': 'Compass',
  'Food & Deliveries': 'Coffee',
  'Restocking Essentials': 'Heart',
  'Misc': 'Box',
  'Savings': 'PiggyBank'
};

