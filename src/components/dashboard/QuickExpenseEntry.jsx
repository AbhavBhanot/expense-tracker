import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Tag, DollarSign, FileText, CreditCard, X, Check } from 'lucide-react';
import { useBudget } from '../../contexts/BudgetContext';
import { validateExpense, sanitizeAmount } from '../../utils/validators';
import { formatCurrency } from '../../utils/formatters';

export default function QuickExpenseEntry() {
  const { addExpense, getCategories } = useBudget();
  const categories = getCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const descRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  
  const [form, setForm] = useState({
    date: today,
    description: '',
    category: categories[0]?.name || '',
    amount: '',
    paymentMethod: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && descRef.current) {
      descRef.current.focus();
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const expense = {
      ...form,
      amount: sanitizeAmount(form.amount),
    };
    
    const validation = validateExpense(expense);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    addExpense(expense);
    setForm({
      date: today,
      description: '',
      category: categories[0]?.name || '',
      amount: '',
      paymentMethod: '',
      notes: ''
    });
    setErrors({});
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    
    if (descRef.current) descRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="quick-entry-toggle"
        onClick={() => setIsOpen(true)}
      >
        <Plus size={20} />
        <span>Quick Add Expense</span>
      </button>
    );
  }

  return (
    <div className="quick-entry card animate-slideUp">
      <div className="quick-entry-header">
        <h3 className="quick-entry-title">
          <Plus size={18} />
          Quick Add Expense
        </h3>
        <button className="btn btn-ghost btn-icon" onClick={() => setIsOpen(false)}>
          <X size={18} />
        </button>
      </div>
      <form className="quick-entry-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="quick-entry-fields">
          <div className="form-group quick-field">
            <label className="form-label" htmlFor="qe-date">
              <Calendar size={14} />
              Date
            </label>
            <input
              id="qe-date"
              type="date"
              className={`form-input ${errors.date ? 'form-input-error' : ''}`}
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <div className="form-group quick-field quick-field-grow">
            <label className="form-label" htmlFor="qe-desc">
              <FileText size={14} />
              Description
            </label>
            <input
              ref={descRef}
              id="qe-desc"
              type="text"
              className={`form-input ${errors.description ? 'form-input-error' : ''}`}
              placeholder="What did you spend on?"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              autoComplete="off"
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group quick-field">
            <label className="form-label" htmlFor="qe-category">
              <Tag size={14} />
              Category
            </label>
            <select
              id="qe-category"
              className={`form-select ${errors.category ? 'form-input-error' : ''}`}
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">Select...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          <div className="form-group quick-field">
            <label className="form-label" htmlFor="qe-amount">
              <DollarSign size={14} />
              Amount (₹)
            </label>
            <input
              id="qe-amount"
              type="number"
              step="0.01"
              min="0"
              className={`form-input ${errors.amount ? 'form-input-error' : ''}`}
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
            {errors.amount && <span className="form-error">{errors.amount}</span>}
          </div>

          <div className="form-group quick-field quick-field-optional">
            <label className="form-label" htmlFor="qe-payment">
              <CreditCard size={14} />
              Payment
            </label>
            <select
              id="qe-payment"
              className="form-select"
              value={form.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
            >
              <option value="">Optional</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>
        </div>

        <div className="quick-entry-actions">
          <button type="submit" className="btn btn-primary">
            {showSuccess ? (
              <>
                <Check size={18} />
                Added!
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Expense
              </>
            )}
          </button>
          <span className="quick-entry-hint">Ctrl+Enter to save</span>
        </div>
      </form>
    </div>
  );
}
