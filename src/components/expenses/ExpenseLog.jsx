import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { validateExpense, sanitizeAmount } from '../../utils/validators';
import { CHART_COLORS } from '../../utils/constants';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import Header from '../layout/Header';
import { Plus, Edit2, Trash2, Search, Filter, ChevronDown, ChevronUp, AlertCircle, Calendar, CreditCard, Tag } from 'lucide-react';

export default function ExpenseLog() {
  const { state, addExpense, editExpense, deleteExpense, getCategories, getExpenses } = useBudget();
  const categories = getCategories();
  const expenses = getExpenses();
  const { paymentMethods } = state.settings;

  // Add Expense Form State
  const [isAddFormOpen, setIsAddFormOpen] = useState(true);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: '',
    paymentMethod: 'UPI',
    notes: ''
  });
  const [addErrors, setAddErrors] = useState({});
  const [addSuccess, setAddSuccess] = useState(false);
  const descInputRef = useRef(null);

  // Filters & Sort State
  const [filters, setFilters] = useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    paymentMethod: ''
  });
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, amount-desc, category-asc

  // Edit/Delete Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // --- Filtering & Sorting Logic ---
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (filters.category) {
      result = result.filter(e => e.category === filters.category);
    }
    if (filters.paymentMethod) {
      result = result.filter(e => e.paymentMethod === filters.paymentMethod);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => e.description.toLowerCase().includes(q) || (e.notes && e.notes.toLowerCase().includes(q)));
    }
    if (filters.dateFrom) {
      result = result.filter(e => e.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter(e => e.date <= filters.dateTo);
    }

    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'category-asc') {
        const catA = categories.find(c => c.id === a.category)?.name || '';
        const catB = categories.find(c => c.id === b.category)?.name || '';
        return catA.localeCompare(catB);
      }
      return 0;
    });

    return result;
  }, [expenses, filters, sortBy, categories]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getCategoryColor = (catId) => {
    const idx = categories.findIndex(c => c.id === catId);
    return CHART_COLORS[idx % CHART_COLORS.length] || '#ccc';
  };

  const getCategoryName = (catId) => {
    return categories.find(c => c.id === catId)?.name || 'Unknown';
  };

  // --- Add Form Logic ---
  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    const expenseToValidate = {
      ...newExpense,
      amount: sanitizeAmount(newExpense.amount)
    };

    const { valid, errors } = validateExpense(expenseToValidate);
    if (!valid) {
      setAddErrors(errors);
      return;
    }

    addExpense(expenseToValidate);
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2000);
    
    // Reset form but keep date
    setNewExpense({
      ...newExpense,
      description: '',
      category: '',
      amount: '',
      notes: ''
    });
    setAddErrors({});
    if (descInputRef.current) descInputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAddSubmit();
    }
  };

  // --- Edit Logic ---
  const handleEditStart = (exp) => {
    setEditForm({ ...exp });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const expenseToValidate = {
      ...editForm,
      amount: sanitizeAmount(editForm.amount)
    };

    const { valid, errors } = validateExpense(expenseToValidate);
    if (!valid) {
      setEditErrors(errors);
      return;
    }

    editExpense(editForm.id, expenseToValidate);
    setEditModalOpen(false);
  };

  const clearFilters = () => {
    setFilters({ category: '', dateFrom: '', dateTo: '', search: '', paymentMethod: '' });
  };

  return (
    <div className="expense-log-page">
      <Header title="Expense Log" subtitle="Track and manage your daily transactions" />

      {/* Add Expense Section */}
      <div className="card expense-card">
        <div 
          className="expense-form-header"
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
        >
          <h3 className="expense-form-title">
            <Plus size={20} className="text-primary" /> Record New Expense
          </h3>
          <button className="btn btn-ghost btn-icon" type="button" aria-label="Toggle expense form">
            {isAddFormOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {isAddFormOpen && (
          <form className="expense-form" onSubmit={handleAddSubmit} onKeyDown={handleKeyDown} style={{ paddingTop: 'var(--space-5)' }}>
            <div className="expense-form-grid">
              <div className="form-group expense-field-date">
                <label className="form-label">Date *</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input 
                    type="date" 
                    className={`form-input ${addErrors.date ? 'error' : ''}`}
                    value={newExpense.date}
                    onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
                {addErrors.date && <span className="form-error">{addErrors.date}</span>}
              </div>

              <div className="form-group expense-field-desc">
                <label className="form-label">Description *</label>
                <input 
                  type="text" 
                  ref={descInputRef}
                  className={`form-input ${addErrors.description ? 'error' : ''}`}
                  placeholder="What did you spend on?"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
                {addErrors.description && <span className="form-error">{addErrors.description}</span>}
              </div>

              <div className="form-group expense-field-category">
                <label className="form-label">Category *</label>
                <select 
                  className={`form-select ${addErrors.category ? 'error' : ''}`}
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {addErrors.category && <span className="form-error">{addErrors.category}</span>}
              </div>

              <div className="form-group expense-field-amount">
                <label className="form-label">Amount (₹) *</label>
                <input 
                  type="number" 
                  className={`form-input ${addErrors.amount ? 'error' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                />
                {addErrors.amount && <span className="form-error">{addErrors.amount}</span>}
              </div>

              <div className="form-group expense-field-payment">
                <label className="form-label">Payment Method</label>
                <div className="select-with-icon">
                  <CreditCard size={16} className="select-icon" />
                  <select
                    className="form-select select-with-icon-input"
                    value={newExpense.paymentMethod}
                    onChange={e => setNewExpense({...newExpense, paymentMethod: e.target.value})}
                  >
                    {paymentMethods.map(pm => (
                      <option key={pm} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group expense-field-notes">
                <label className="form-label">Notes</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Optional details"
                  value={newExpense.notes}
                  onChange={e => setNewExpense({...newExpense, notes: e.target.value})}
                />
              </div>
            </div>
            
            <div className="expense-form-footer">
              <span className="expense-form-tip hidden-mobile">Tip: Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to submit</span>
              <div className="expense-form-actions">
                {addSuccess && <span className="text-success expense-success-msg">Expense added successfully!</span>}
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Filters Bar */}
      <div className="card expense-filters-card">
        <div className="expense-filters-toolbar">
          <div className="form-group filter-field-search">
            <div className="input-with-icon">
              <Search size={16} className="input-icon" />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search descriptions..."
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group filter-field-category">
            <select 
              className="form-select"
              value={filters.category}
              onChange={e => setFilters({...filters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group filter-field-payment">
            <select 
              className="form-select"
              value={filters.paymentMethod}
              onChange={e => setFilters({...filters, paymentMethod: e.target.value})}
            >
              <option value="">All Payment Methods</option>
              {paymentMethods.map(pm => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          <div className="filter-date-group">
            <div className="form-group filter-field-date">
              <input 
                type="date" 
                className="form-input" 
                value={filters.dateFrom}
                onChange={e => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>
            <span className="filter-date-separator">to</span>
            <div className="form-group filter-field-date">
              <input 
                type="date" 
                className="form-input" 
                value={filters.dateTo}
                onChange={e => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group filter-field-sort">
            <select 
              className="form-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="date-desc">Newest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="category-asc">Category: A-Z</option>
            </select>
          </div>

          <button type="button" className="btn btn-ghost filter-clear-btn" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card expense-results-card">
        {filteredExpenses.length === 0 ? (
          <div className="expense-empty-state-wrapper">
            <EmptyState 
              icon={Filter} 
              title="No expenses found" 
              description={expenses.length === 0 ? "Your recorded expenses will appear here." : "No expenses match your current filters."}
              action={expenses.length > 0 ? clearFilters : () => setIsAddFormOpen(true)}
              actionLabel={expenses.length > 0 ? "Clear Filters" : "Add Expense"}
            />
          </div>
        ) : (
          <div className="expense-table-wrapper">
            <table className="data-table expense-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Payment Method</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="table-row-hover">
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(exp.date)}</td>
                    <td>
                      <div><strong>{exp.description}</strong></div>
                      {exp.notes && <div className="text-secondary text-xs" style={{ marginTop: '2px' }}>{exp.notes}</div>}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: getCategoryColor(exp.category), flexShrink: 0 }}></div>
                        <span>{getCategoryName(exp.category)}</span>
                      </div>
                    </td>
                    <td className="text-right font-bold">{formatCurrency(exp.amount)}</td>
                    <td><span className="badge badge-secondary" style={{ whiteSpace: 'nowrap' }}>{exp.paymentMethod}</span></td>
                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleEditStart(exp)} title="Edit"><Edit2 size={16} /></button>
                      <button className="btn btn-ghost btn-sm btn-icon text-danger" onClick={() => setDeleteConfirmId(exp.id)} title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Summary Footer */}
        {filteredExpenses.length > 0 && (
          <div className="expense-summary-bar">
            <span className="expense-summary-count">
              Showing {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
            </span>
            <span className="expense-summary-total">
              Total: <strong>{formatCurrency(totalFilteredAmount)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editForm && (
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Expense">
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input 
                type="date" 
                className={`form-input ${editErrors.date ? 'error' : ''}`}
                value={editForm.date}
                onChange={e => setEditForm({...editForm, date: e.target.value})}
              />
              {editErrors.date && <span className="form-error">{editErrors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <input 
                type="text" 
                className={`form-input ${editErrors.description ? 'error' : ''}`}
                value={editForm.description}
                onChange={e => setEditForm({...editForm, description: e.target.value})}
              />
              {editErrors.description && <span className="form-error">{editErrors.description}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select 
                className={`form-select ${editErrors.category ? 'error' : ''}`}
                value={editForm.category}
                onChange={e => setEditForm({...editForm, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {editErrors.category && <span className="form-error">{editErrors.category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input 
                type="number" 
                className={`form-input ${editErrors.amount ? 'error' : ''}`}
                step="0.01"
                value={editForm.amount}
                onChange={e => setEditForm({...editForm, amount: e.target.value})}
              />
              {editErrors.amount && <span className="form-error">{editErrors.amount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select 
                className="form-select"
                value={editForm.paymentMethod}
                onChange={e => setEditForm({...editForm, paymentMethod: e.target.value})}
              >
                {paymentMethods.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <input 
                type="text" 
                className="form-input"
                value={editForm.notes || ''}
                onChange={e => setEditForm({...editForm, notes: e.target.value})}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Delete Expense" size="sm">
        <div className="flex-center flex-col" style={{ padding: 'var(--space-4) 0', gap: 'var(--space-4)', textAlign: 'center' }}>
          <AlertCircle size={44} className="text-danger" />
          <p className="text-secondary text-sm">Are you sure you want to delete this expense? This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => {
            deleteExpense(deleteConfirmId);
            setDeleteConfirmId(null);
          }}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
