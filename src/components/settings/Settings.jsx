import React, { useState, useRef } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import { exportToJSON, exportToCSV, importFromJSON } from '../../utils/exportImport';
import { generateSampleExpenses } from '../../utils/sampleData';
import Header from '../layout/Header';
import Modal from '../shared/Modal';
import { Save, Plus, Trash2, Download, Upload, Database, Info, RefreshCw, X } from 'lucide-react';

export default function Settings() {
  const { state, dispatch, getExpenses, getCategories } = useBudget();
  const { settings, currentMonth } = state;
  const fileInputRef = useRef(null);
  
  const [thresholds, setThresholds] = useState({ ...settings.thresholds });
  const [newMethod, setNewMethod] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleThresholdChange = (key, value) => {
    setThresholds(prev => ({ ...prev, [key]: Number(value) }));
  };

  const saveThresholds = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { thresholds } });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const addPaymentMethod = (e) => {
    e.preventDefault();
    const trimmed = newMethod.trim();
    if (trimmed && !settings.paymentMethods.includes(trimmed)) {
      const updated = [...settings.paymentMethods, trimmed];
      dispatch({ type: 'UPDATE_SETTINGS', payload: { paymentMethods: updated } });
      setNewMethod('');
    }
  };

  const removePaymentMethod = (method) => {
    const updated = settings.paymentMethods.filter(m => m !== method);
    dispatch({ type: 'UPDATE_SETTINGS', payload: { paymentMethods: updated } });
  };

  const handleExportJSON = () => {
    exportToJSON(state);
  };

  const handleExportCSV = () => {
    exportToCSV(getExpenses(), getCategories());
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setImportStatus('Loading...');
      const data = await importFromJSON(file);
      dispatch({ type: 'IMPORT_DATA', payload: data });
      setImportStatus('Import successful!');
      setTimeout(() => { setShowImportModal(false); setImportStatus(null); }, 1500);
    } catch (err) {
      setImportStatus(`Error: ${err.message}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLoadSampleData = () => {
    const categories = getCategories();
    const expenses = generateSampleExpenses(categories, currentMonth);
    dispatch({ type: 'LOAD_SAMPLE_DATA', payload: { expenses } });
  };

  const handleClearExpenses = () => {
    dispatch({ type: 'CLEAR_EXPENSES' });
    setShowClearModal(false);
  };

  return (
    <div className="settings-page animate-fadeIn">
      <Header title="Settings" subtitle="Manage your preferences and data" />

      {/* Alert Thresholds */}
      <div className="card settings-section">
        <h3 className="settings-section-title">
          <Info size={20} />
          Alert Thresholds
        </h3>
        <p className="text-secondary mb-2" style={{ fontSize: 'var(--text-sm)' }}>
          Set percentage limits for budget status indicators.
        </p>

        <div className="threshold-grid">
          <div className="threshold-item">
            <label className="threshold-label" style={{ color: 'var(--color-success)' }}>🟢 On Track (below)</label>
            <input 
              type="number" className="form-input" 
              value={thresholds.onTrack} 
              onChange={(e) => handleThresholdChange('onTrack', e.target.value)}
              min="0" max="100"
            />
          </div>
          <div className="threshold-item">
            <label className="threshold-label" style={{ color: 'var(--color-warning)' }}>🟡 Monitor (below)</label>
            <input 
              type="number" className="form-input" 
              value={thresholds.monitor} 
              onChange={(e) => handleThresholdChange('monitor', e.target.value)}
              min="0" max="100"
            />
          </div>
          <div className="threshold-item">
            <label className="threshold-label" style={{ color: '#fb923c' }}>🟠 Near Limit (below)</label>
            <input 
              type="number" className="form-input" 
              value={thresholds.nearLimit} 
              onChange={(e) => handleThresholdChange('nearLimit', e.target.value)}
              min="0" max="100"
            />
          </div>
          <div className="threshold-item">
            <label className="threshold-label" style={{ color: 'var(--color-danger)' }}>🔴 Critical (at or above)</label>
            <input 
              type="number" className="form-input" 
              value={thresholds.critical} 
              onChange={(e) => handleThresholdChange('critical', e.target.value)}
              min="0" max="150"
            />
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={saveThresholds}>
            <Save size={16} />
            {saveSuccess ? 'Saved!' : 'Save Thresholds'}
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card settings-section">
        <h3 className="settings-section-title">
          Payment Methods
        </h3>
        
        <div className="payment-list">
          {settings.paymentMethods.map(method => (
            <div key={method} className="payment-tag">
              <span>{method}</span>
              <button onClick={() => removePaymentMethod(method)} title="Remove">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={addPaymentMethod} style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <input 
            type="text" className="form-input" 
            placeholder="New payment method..."
            value={newMethod}
            onChange={(e) => setNewMethod(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-secondary" disabled={!newMethod.trim()}>
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      {/* Data Management */}
      <div className="card settings-section">
        <h3 className="settings-section-title">
          <Database size={20} />
          Data Management
        </h3>

        <div className="data-actions">
          <button className="btn btn-secondary" onClick={handleExportJSON}>
            <Download size={16} /> Export Backup (JSON)
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export Expenses (CSV)
          </button>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            <Upload size={16} /> Import Data
          </button>
          <button className="btn btn-primary" onClick={handleLoadSampleData}>
            <RefreshCw size={16} /> Load Sample Data
          </button>
          <button className="btn btn-danger" onClick={() => setShowClearModal(true)}>
            <Trash2 size={16} /> Clear Month Expenses
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card settings-section">
        <h3 className="settings-section-title">
          <Info size={20} />
          About
        </h3>
        <div className="about-section">
          <p><strong>BudgetTrack</strong> — Smart Expense Tracker v1.0</p>
          <p>All data is stored locally in your browser's localStorage. Your financial information never leaves your device.</p>
          <p>Tip: Export backups regularly if you rely on this tracker for important financial decisions.</p>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal 
        isOpen={showClearModal} 
        onClose={() => setShowClearModal(false)}
        title="Clear Expenses"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowClearModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleClearExpenses}>Yes, Clear All</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          This will permanently delete <strong>all expenses</strong> for {currentMonth}. 
          Your budget categories and settings will remain intact. This cannot be undone.
        </p>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => { setShowImportModal(false); setImportStatus(null); }}
        title="Import Data"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
          Select a JSON backup file. <strong style={{ color: 'var(--color-warning)' }}>Warning:</strong> This will overwrite all current data.
        </p>
        <input 
          type="file" 
          accept=".json,application/json" 
          className="form-input"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        {importStatus && (
          <div className={`alert-item ${importStatus.includes('Error') ? 'alert-danger' : 'alert-success'}`} style={{ marginTop: 'var(--space-md)' }}>
            {importStatus}
          </div>
        )}
      </Modal>
    </div>
  );
}
