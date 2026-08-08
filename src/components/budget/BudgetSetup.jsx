import React, { useState, useMemo } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import { validateCategory, sanitizeAmount } from '../../utils/validators';
import Modal from '../shared/Modal';
import Header from '../layout/Header';
import ProgressBar from '../shared/ProgressBar';
import EmptyState from '../shared/EmptyState';
import WeeklySpendingGuideCard from '../dashboard/WeeklySpendingGuideCard';
import { Plus, Edit2, Trash2, PieChart, IndianRupee, Save, X, Target, Tag, RotateCcw } from 'lucide-react';

export default function BudgetSetup() {
  const { dispatch, addCategory, updateCategory, deleteCategory, getCategories, getCurrentMonthData, resetToDefaults } = useBudget();
  const categories = getCategories();
  const currentData = getCurrentMonthData();
  const totalIncome = currentData.budget.totalIncome || 0;

  // Add Category Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', planned: '', expenseType: 'Fixed', priority: 'Essential', notes: '' });
  const [addErrors, setAddErrors] = useState({});

  // Editing Category State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Income Input State
  const [incomeInput, setIncomeInput] = useState(totalIncome.toString());

  const handleIncomeUpdate = (e) => {
    e.preventDefault();
    const amount = sanitizeAmount(incomeInput);
    dispatch({ type: 'UPDATE_TOTAL_INCOME', payload: { totalIncome: amount } });
  };

  const handleIncomeBlur = () => {
    const amount = sanitizeAmount(incomeInput);
    setIncomeInput(amount.toString());
    dispatch({ type: 'UPDATE_TOTAL_INCOME', payload: { totalIncome: amount } });
  };

  // Calculations
  const calculations = useMemo(() => {
    let totalBudget = 0;
    let fixedTotal = 0;
    let variableTotal = 0;
    let savingsTotal = 0;

    categories.forEach(cat => {
      const planned = Number(cat.planned) || 0;
      totalBudget += planned;
      if (cat.expenseType === 'Fixed') fixedTotal += planned;
      else if (cat.expenseType === 'Variable') variableTotal += planned;
      if (cat.priority === 'Savings' || cat.priority === 'Investment') savingsTotal += planned;
    });

    return {
      totalBudget,
      fixedTotal,
      variableTotal,
      savingsTotal,
      unallocated: totalIncome - totalBudget,
      allocationPercent: totalIncome > 0 ? (totalBudget / totalIncome) * 100 : 0
    };
  }, [categories, totalIncome]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const catToValidate = {
      ...newCategory,
      planned: sanitizeAmount(newCategory.planned)
    };
    
    const { valid, errors } = validateCategory(catToValidate);
    if (!valid) {
      setAddErrors(errors);
      return;
    }
    
    addCategory(catToValidate);
    setIsAddModalOpen(false);
    setNewCategory({ name: '', planned: '', expenseType: 'Fixed', priority: 'Essential', notes: '' });
    setAddErrors({});
  };

  const handleEditStart = (category) => {
    setEditingId(category.id);
    setEditForm({ ...category });
  };

  const handleEditSave = () => {
    const catToValidate = {
      ...editForm,
      planned: sanitizeAmount(editForm.planned)
    };
    const { valid } = validateCategory(catToValidate);
    if (!valid) return;

    updateCategory(editingId, catToValidate);
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleDeleteConfirm = (id) => {
    deleteCategory(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="budget-setup-page animate-fadeIn">
      <Header title="Budget Setup" subtitle="Manage category allocations, monthly income, and priority rules" />

      {/* Overview Cards */}
      <div className="kpi-grid">
        <div className="card kpi-card kpi-info">
          <div className="kpi-content">
            <span className="kpi-label">Total Allocated</span>
            <span className="kpi-value">{formatCurrency(calculations.totalBudget)}</span>
            <span className="kpi-subtitle">{categories.length} categories planned</span>
          </div>
          <div className="kpi-icon kpi-icon-info">
            <PieChart size={22} />
          </div>
        </div>

        <div className="card kpi-card kpi-purple">
          <div className="kpi-content">
            <span className="kpi-label">Fixed Expenses</span>
            <span className="kpi-value">{formatCurrency(calculations.fixedTotal)}</span>
            <span className="kpi-subtitle">Recurring monthly commitments</span>
          </div>
          <div className="kpi-icon kpi-icon-purple">
            <Target size={22} />
          </div>
        </div>

        <div className="card kpi-card kpi-warning">
          <div className="kpi-content">
            <span className="kpi-label">Variable Expenses</span>
            <span className="kpi-value">{formatCurrency(calculations.variableTotal)}</span>
            <span className="kpi-subtitle">Flexible spending budget</span>
          </div>
          <div className="kpi-icon kpi-icon-warning">
            <Tag size={22} />
          </div>
        </div>

        <div className="card kpi-card kpi-success">
          <div className="kpi-content">
            <span className="kpi-label">Savings Target</span>
            <span className="kpi-value">{formatCurrency(calculations.savingsTotal)}</span>
            <span className="kpi-subtitle">Allocated for future</span>
          </div>
          <div className="kpi-icon kpi-icon-success">
            <IndianRupee size={22} />
          </div>
        </div>
      </div>

      {/* Income & Allocation Section */}
      <div className="card p-4">
        <h3 className="card-title mb-3">Monthly Income & Allocation</h3>
        
        <div
          className="grid-2 align-items-center"
          style={{
            columnGap: '24px',
            rowGap: '20px',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)'
          }}
        >
          <form
            onSubmit={handleIncomeUpdate}
            className="flex align-items-end"
            style={{ gap: '12px', width: '100%', minWidth: 0 }}
          >
            <div className="form-group mb-0 flex-1">
              <label className="form-label" htmlFor="total-income-input" style={{ paddingLeft: '4px' }}>Total Monthly Income (₹)</label>
              <input
                id="total-income-input"
                type="number"
                className="form-input"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                onBlur={handleIncomeBlur}
                placeholder="Enter income amount"
                min="0"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                paddingInline: '24px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxSizing: 'border-box',
                height: 'auto',
                minHeight: '48px',
                alignSelf: 'flex-end'
              }}
            >
              Update Income
            </button>
          </form>

          <div
            className="stat-chiclet stat-chiclet-info"
            style={{
              minWidth: 0,
              padding: '20px 24px',
              boxSizing: 'border-box'
            }}
          >
            <div className="stat-chiclet-header">
              <span className="stat-chiclet-title" style={{ paddingLeft: '4px' }}>Unallocated Balance</span>
              <span className={`badge ${calculations.unallocated < 0 ? 'badge-danger' : 'badge-success'}`} style={{ whiteSpace: 'nowrap' }}>
                {calculations.unallocated < 0 ? 'Over Allocated' : 'Available'}
              </span>
            </div>
            <div className={`stat-chiclet-value ${calculations.unallocated < 0 ? 'text-danger' : 'text-success'}`} style={{ paddingLeft: '4px' }}>
              {formatCurrency(calculations.unallocated)}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-top" style={{ borderTop: '1px solid var(--border-color)', paddingLeft: '4px', paddingRight: '4px' }}>
          <ProgressBar 
            value={calculations.totalBudget} 
            max={totalIncome > 0 ? totalIncome : 1} 
            label="Total Allocation Progress"
            showPercent={true}
            variant={calculations.totalBudget > totalIncome ? 'danger' : 'success'}
          />
        </div>
      </div>

      {/* Categories Table Section */}
      <div className="card p-4">
        <div className="flex-between mb-4">
          <h3 className="card-title">Budget Categories</h3>
          <div className="flex gap-2" style={{ gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={resetToDefaults} title="Reset to ₹26,000 budget plan defaults" style={{ paddingInline: '16px', whiteSpace: 'nowrap', flexShrink: 0, boxSizing: 'border-box' }}>
              <RotateCcw size={16} /> Reset Defaults
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)} style={{ paddingInline: '16px', whiteSpace: 'nowrap', flexShrink: 0, boxSizing: 'border-box' }}>
              <Plus size={16} /> Add Category
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <EmptyState 
            icon={Target} 
            title="No categories yet" 
            description="Start planning your budget by adding your first category." 
            action={() => setIsAddModalOpen(true)} 
            actionLabel="Add Category" 
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Planned Allocation (₹)</th>
                  <th>Expense Type</th>
                  <th>Priority</th>
                  <th>Notes</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id || cat.name} onDoubleClick={() => handleEditStart(cat)}>
                    {editingId === cat.id ? (
                      <>
                        <td>
                          <input 
                            type="text" 
                            className="form-input btn-sm" 
                            value={editForm.name} 
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-input btn-sm" 
                            value={editForm.planned} 
                            onChange={e => setEditForm({...editForm, planned: e.target.value})}
                          />
                        </td>
                        <td>
                          <select className="form-select btn-sm" value={editForm.expenseType} onChange={e => setEditForm({...editForm, expenseType: e.target.value})}>
                            <option value="Fixed">Fixed</option>
                            <option value="Variable">Variable</option>
                          </select>
                        </td>
                        <td>
                          <select className="form-select btn-sm" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}>
                            <option value="Essential">Essential</option>
                            <option value="Discretionary">Discretionary</option>
                            <option value="Savings">Savings</option>
                            <option value="Investment">Investment</option>
                          </select>
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-input btn-sm" 
                            value={editForm.notes || ''} 
                            onChange={e => setEditForm({...editForm, notes: e.target.value})}
                          />
                        </td>
                        <td className="text-right">
                          <div className="expense-actions" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary btn-sm btn-icon" onClick={handleEditSave} title="Save">
                              <Save size={14} />
                            </button>
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={handleEditCancel} title="Cancel">
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="font-medium">{cat.name}</td>
                        <td className="font-semibold">{formatCurrency(cat.planned)}</td>
                        <td>
                          <span className={`badge ${cat.expenseType === 'Fixed' ? 'badge-info' : 'badge-neutral'}`} style={{ whiteSpace: 'nowrap' }}>
                            {cat.expenseType}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            cat.priority === 'Essential' ? 'badge-info' : 
                            cat.priority === 'Savings' || cat.priority === 'Investment' ? 'badge-success' : 'badge-warning'
                          }`} style={{ whiteSpace: 'nowrap' }}>
                            {cat.priority}
                          </span>
                        </td>
                        <td className="text-secondary text-xs">{cat.notes || '-'}</td>
                        <td className="text-right">
                          <div className="expense-actions" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleEditStart(cat)} title="Edit Category">
                              <Edit2 size={14} />
                            </button>
                            <button className="btn btn-ghost btn-sm btn-icon text-danger" onClick={() => setDeleteConfirmId(cat.id)} title="Delete Category">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total Budget</td>
                  <td>{formatCurrency(calculations.totalBudget)}</td>
                  <td colSpan="4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <Modal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Category"
        >
          <form onSubmit={handleAddSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-cat-name">Category Name</label>
              <input 
                id="new-cat-name"
                type="text" 
                className={`form-input ${addErrors.name ? 'form-input-error' : ''}`}
                placeholder="e.g. Groceries, Rent, Subscriptions"
                value={newCategory.name}
                onChange={e => setNewCategory({...newCategory, name: e.target.value})}
              />
              {addErrors.name && <span className="form-error">{addErrors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-cat-planned">Planned Budget (₹)</label>
              <input 
                id="new-cat-planned"
                type="number" 
                min="0"
                step="0.01"
                className={`form-input ${addErrors.planned ? 'form-input-error' : ''}`}
                placeholder="0.00"
                value={newCategory.planned}
                onChange={e => setNewCategory({...newCategory, planned: e.target.value})}
              />
              {addErrors.planned && <span className="form-error">{addErrors.planned}</span>}
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="new-cat-type">Expense Type</label>
                <select 
                  id="new-cat-type"
                  className="form-select"
                  value={newCategory.expenseType}
                  onChange={e => setNewCategory({...newCategory, expenseType: e.target.value})}
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Variable">Variable</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="new-cat-priority">Priority / Goal</label>
                <select 
                  id="new-cat-priority"
                  className="form-select"
                  value={newCategory.priority}
                  onChange={e => setNewCategory({...newCategory, priority: e.target.value})}
                >
                  <option value="Essential">Essential</option>
                  <option value="Discretionary">Discretionary</option>
                  <option value="Savings">Savings</option>
                  <option value="Investment">Investment</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-cat-notes">Notes (Optional)</label>
              <input 
                id="new-cat-notes"
                type="text" 
                className="form-input"
                placeholder="Additional info or payment terms"
                value={newCategory.notes}
                onChange={e => setNewCategory({...newCategory, notes: e.target.value})}
              />
            </div>

            <div className="modal-footer" style={{ padding: 0, marginTop: 'var(--space-lg)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)} style={{ paddingInline: '20px', whiteSpace: 'nowrap', flexShrink: 0, boxSizing: 'border-box' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ paddingInline: '20px', whiteSpace: 'nowrap', flexShrink: 0, boxSizing: 'border-box' }}>Add Category</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Category"
        >
          <p className="text-secondary text-sm mb-4">
            Are you sure you want to delete this category? Existing expenses in this category will remain, but the category budget allocation will be removed.
          </p>
          <div className="modal-footer" style={{ padding: 0 }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)} style={{ paddingInline: '20px', whiteSpace: 'nowrap', flexShrink: 0, boxSizing: 'border-box' }}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDeleteConfirm(deleteConfirmId)} style={{ paddingInline: '20px', whiteSpace: 'nowrap', flexShrink: 0, boxSizing: 'border-box' }}>Yes, Delete</button>
          </div>
        </Modal>
      )}

      {/* Weekly Spending Guide Section */}
      <div className="mt-4" style={{ marginTop: '24px', minWidth: 0 }}>
        <WeeklySpendingGuideCard />
      </div>
    </div>
  );
}