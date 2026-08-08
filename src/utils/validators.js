export const validateExpense = (expense) => {
  const errors = {};
  if (!expense.date || isNaN(new Date(expense.date).getTime())) {
    errors.date = 'Valid date is required';
  }
  if (!expense.description || typeof expense.description !== 'string' || expense.description.trim() === '') {
    errors.description = 'Description is required';
  }
  if (!expense.category || typeof expense.category !== 'string' || expense.category.trim() === '') {
    errors.category = 'Category is required';
  }
  if (expense.amount === undefined || expense.amount === null || isNaN(expense.amount) || expense.amount <= 0) {
    errors.amount = 'Valid positive amount is required';
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateCategory = (category) => {
  const errors = {};
  if (!category.name || typeof category.name !== 'string' || category.name.trim() === '') {
    errors.name = 'Name is required';
  }
  if (category.planned === undefined || category.planned === null || isNaN(category.planned) || category.planned < 0) {
    errors.planned = 'Valid planned amount is required';
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateAmount = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const validateDate = (value) => {
  return !isNaN(new Date(value).getTime());
};

export const sanitizeAmount = (value) => {
  if (typeof value === 'number') return Math.max(0, value);
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
};
