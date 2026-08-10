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
  Moon,
  LogOut
} from 'lucide-react';
import { useBudget } from '../../contexts/BudgetContext';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expense Log', icon: Receipt },
  { id: 'budget', label: 'Budget Setup', icon: Wallet },
  { id: 'summary', label: 'Category Summary', icon: PieChart },
  { id: 'analysis', label: 'Spending Analysis', icon: TrendingUp },
  { id: 'review', label: 'Monthly Review', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export default function Sidebar({ activePage, onNavigate, collapsed = false, onToggleCollapse }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, toggleTheme } = useBudget();
  const { user, logout } = useAuth();
  const isDark = (state.settings?.theme || 'dark') === 'dark';

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar hidden-desktop">
        <div className="mobile-top-bar-left">
          <button 
            className="sidebar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="mobile-logo">
            <div className="sidebar-logo-icon" style={{ width: '26px', height: '26px' }}>
              <Wallet size={14} />
            </div>
            <span className="mobile-logo-title">BudgetTrack</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="btn btn-ghost btn-icon"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user && (
            <button 
              className="btn btn-ghost btn-icon"
              onClick={logout}
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut size={18} className="text-danger" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Wallet size={18} />
            </div>
            {!collapsed && (
              <div className="sidebar-logo-text">
                <h1 className="sidebar-title">BudgetTrack</h1>
                <span className="sidebar-subtitle">Expense Tracker</span>
              </div>
            )}
          </div>
          <button 
            className="btn btn-ghost btn-icon sidebar-collapse-btn hidden-mobile"
            onClick={handleToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={16} className={collapsed ? 'rotate-180' : ''} />
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
              >
                <Icon size={18} className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className={`sidebar-user-badge ${collapsed ? 'collapsed' : ''}`}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="sidebar-user-avatar" />
              ) : (
                <div className="sidebar-user-initials">
                  {getUserInitials(user.name)}
                </div>
              )}
              {!collapsed && (
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name" title={user.name}>{user.name}</span>
                  <span className="sidebar-user-email" title={user.email}>{user.email}</span>
                </div>
              )}
            </div>
          )}

          <button 
            className="nav-item"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark
              ? <Sun size={18} className="nav-icon" />
              : <Moon size={18} className="nav-icon" />
            }
            {!collapsed && (
              <span className="nav-label">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            )}
          </button>

          {user && (
            <button 
              className="nav-item logout-nav-item"
              onClick={logout}
              title="Log Out"
            >
              <LogOut size={18} className="nav-icon text-danger" />
              {!collapsed && <span className="nav-label text-danger">Log Out</span>}
            </button>
          )}

          {!collapsed && (
            <div className="sidebar-footer-text mt-2">
              <span className="text-tertiary text-xs">BudgetTracker v1.0</span>
              <span className="text-tertiary text-xs" style={{ display: 'block', marginTop: '2px' }}>Built for My Love ♡</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

