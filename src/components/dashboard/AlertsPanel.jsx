import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Zap } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, className: 'alert-danger' },
  warning: { icon: AlertCircle, className: 'alert-warning' },
  info: { icon: Info, className: 'alert-info' },
  success: { icon: CheckCircle, className: 'alert-success' },
};

export default function AlertsPanel({ alerts = [] }) {
  if (alerts.length === 0) {
    return (
      <div className="card alerts-panel">
        <h4 className="card-title">
          <Zap size={18} />
          Smart Alerts
        </h4>
        <div className="alerts-empty">
          <CheckCircle size={32} className="text-success" />
          <p>All good! No budget concerns right now.</p>
        </div>
      </div>
    );
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { critical: 0, warning: 1, info: 2, success: 3 };
    return (priority[a.severity] ?? 4) - (priority[b.severity] ?? 4);
  });

  return (
    <div className="card alerts-panel">
      <div className="card-header-row">
        <h4 className="card-title">
          <Zap size={18} />
          Smart Alerts
        </h4>
        <span className="badge badge-neutral">{alerts.length}</span>
      </div>
      <div className="alerts-list">
        {sortedAlerts.slice(0, 8).map((alert, idx) => {
          const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
          const Icon = config.icon;
          return (
            <div 
              key={alert.id || idx} 
              className={`alert-item ${config.className} animate-slideUp`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <Icon size={18} className="alert-icon" />
              <div className="alert-content">
                <span className="alert-message">{alert.message}</span>
                {alert.category && (
                  <span className="alert-category">{alert.category}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
