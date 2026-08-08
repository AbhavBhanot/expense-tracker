import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Settings2, 
  PieChart, 
  TrendingUp,
  FileText,
  Wallet,
  Menu,
  X,
  ChevronLeft,
  Sun,
  Moon
} from 'lucide-react';
import { useBudget } from '../../contexts/BudgetContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expense Log', icon: Receipt },
  { id: 'budget', label: 'Budget Setup', icon: Wallet },
  { id: 'summary', label: 'Category Summary', icon: PieChart },
  { id: 'analysis', label: 'Spending Analysis', icon: TrendingUp },
  { id: 'review', label: 'Monthly Review', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, toggleTheme } = useBudget();
  const isDark = (state.settings?.theme || 'dark') === 'dark';

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}>
              <Wallet size={24} />
            </div>
            {!collapsed && (
              <div className="sidebar-logo-text">
                <h1 className="sidebar-title" style={{ fontFamily: 'inherit' }}>BudgetTrack</h1>
                <span className="sidebar-subtitle" style={{ fontFamily: 'inherit' }}>Smart Expense Tracker</span>
              </div>
            )}
          </div>
          <button 
            className="btn btn-ghost btn-icon sidebar-collapse-btn hidden-mobile"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={18} className={collapsed ? 'rotate-180' : ''} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
                title={collapsed ? item.label : undefined}
                style={{ fontFamily: 'inherit' }}
              >
                <Icon size={20} className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item theme-switch-nav-item"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{ fontFamily: 'inherit' }}
          >
            {isDark ? <Sun size={20} className="nav-icon text-warning" /> : <Moon size={20} className="nav-icon text-info" />}
            {!collapsed && <span className="nav-label">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          {!collapsed && (
            <div className="sidebar-footer-text mt-2">
              <span className="text-tertiary text-xs" style={{ fontFamily: 'inherit' }}>BudgetTracker v1.0</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
