export const generateSampleExpenses = (categories, monthStr) => {
  const expenses = [];
  const [y, m] = monthStr.split('-');
  const daysInMonth = new Date(y, m, 0).getDate();
  
  const getRandomDate = (dayNumber) => {
    const day = dayNumber || Math.floor(Math.random() * daysInMonth) + 1;
    return `${y}-${m}-${String(day).padStart(2, '0')}T10:00:00.000Z`;
  };
  
  const addExpense = (amount, category, description, paymentMethod = 'UPI', dayNumber) => {
    expenses.push({ id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, date: getRandomDate(dayNumber), amount, category, description, paymentMethod });
  };

  // Fixed Monthly Bills (Beginning of month)
  addExpense(12500, 'Rent', 'Monthly rent', 'Net Banking', 1);
  addExpense(1000, 'Cook', 'Cook monthly salary', 'UPI', 2);
  addExpense(425, 'Maid', 'Maid monthly salary', 'UPI', 2);
  addExpense(235, 'WiFi', 'WiFi bill payment', 'UPI', 3);
  addExpense(580, 'Electricity', 'Electricity bill', 'UPI', 5);
  addExpense(148, 'Subscriptions', 'Apple Music/TV + YT Premium', 'Credit Card', 1);

  // Groceries & Essentials
  addExpense(1200, 'Groceries', 'Weekly supermarket restocking', 'UPI', 4);
  addExpense(950, 'Groceries', 'Groceries & dairy supplies', 'UPI', 12);
  addExpense(450, 'Restocking Essentials', 'Skincare & toiletries', 'UPI', 7);
  addExpense(220, 'Restocking Essentials', 'Beauty items & pads', 'UPI', 16);

  // Shopping & Lifestyle
  addExpense(1250, 'Shopping & Personal Indulgence', 'Clothing & accessories', 'Credit Card', 8);
  addExpense(600, 'Shopping & Personal Indulgence', 'Makeup item', 'UPI', 14);

  // Plans & Outings
  addExpense(650, 'Plans', 'Dining out with friends', 'UPI', 6);
  addExpense(420, 'Plans', 'Cab rides & transport', 'UPI', 10);
  addExpense(850, 'Plans', 'Weekend movie & clubbing', 'UPI', 15);

  // Food & Deliveries
  addExpense(280, 'Food & Deliveries', 'Swiggy food order', 'UPI', 3);
  addExpense(320, 'Food & Deliveries', 'Canteen snacks', 'Cash', 9);
  addExpense(240, 'Food & Deliveries', 'Evening coffee & snacks', 'UPI', 13);

  // Misc
  addExpense(250, 'Misc', 'Friend gift contribution', 'UPI', 11);
  addExpense(180, 'Misc', 'Suttas & minor daily expenses', 'Cash', 17);

  return expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
};
