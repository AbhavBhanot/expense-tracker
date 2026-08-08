import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Plus, 
  TrendingUp, 
  Settings2,
  PieChart,
  FileText,
  Wallet
} from 'lucide-react';
import QuickExpenseEntry from '../dashboard/QuickExpenseEntry';
import Modal from '../shared/Modal';

export default function MobileTabBar({ activePage, onNavigate }) {
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);

  return (
    <>
      <div className="mobile-tab-bar hidden-desktop" style={{ fontFamily: 'inherit' }}>
        <button 
          className={`mobile-tab-item ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>

        <button 
          className={`mobile-tab-item ${activePage === 'expenses' ? 'active' : ''}`}
          onClick={() => onNavigate('expenses')}
        >
          <Receipt size={20} />
          <span>Expenses</span>
        </button>

        <button 
          className="mobile-tab-fab"
          onClick={() => setIsQuickAddModalOpen(true)}
          aria-label="Add expense"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
        >
          <Plus size={24} />
        </button>

        <button 
          className={`mobile-tab-item ${activePage === 'analysis' || activePage === 'summary' ? 'active' : ''}`}
          onClick={() => onNavigate('analysis')}
        >
          <TrendingUp size={20} />
          <span>Analysis</span>
        </button>

        <button 
          className={`mobile-tab-item ${activePage === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <Settings2 size={20} />
          <span>Settings</span>
        </button>
      </div>

      {/* Quick Add Modal on Mobile */}
      {isQuickAddModalOpen && (
        <Modal 
          isOpen={isQuickAddModalOpen} 
          onClose={() => setIsQuickAddModalOpen(false)}
          title="Quick Expense Entry"
        >
          <QuickExpenseEntry />
        </Modal>
      )}
    </>
  );
}
