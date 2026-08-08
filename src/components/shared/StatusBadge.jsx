import React from 'react';
import { STATUS_CONFIG } from '../../utils/constants';
import { CheckCircle, AlertCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

const STATUS_CLASSES = {
  onTrack: 'badge-success',
  monitor: 'badge-warning',
  nearLimit: 'badge-orange',
  critical: 'badge-danger',
  overBudget: 'badge-danger',
  noExpenses: 'badge-neutral',
};

const ICONS = {
  onTrack: <CheckCircle size={14} />,
  monitor: <AlertCircle size={14} />,
  nearLimit: <AlertTriangle size={14} />,
  critical: <XCircle size={14} />,
  overBudget: <XCircle size={14} />,
  noExpenses: <HelpCircle size={14} />
};

const FALLBACK_NO_EXPENSES = { label: 'No Activity', emoji: '⚪' };

export default function StatusBadge({ status, showEmoji = true, showLabel = true, size = 'md' }) {
  const config = STATUS_CONFIG[status] || FALLBACK_NO_EXPENSES;
  const className = STATUS_CLASSES[status] || 'badge-success';
  const Icon = ICONS[status] || ICONS.noExpenses;

  return (
    <span 
      className={`badge ${className} badge-${size}`} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
    >
      {showEmoji && <span className="badge-icon" style={{ display: 'flex', alignItems: 'center' }}>{Icon}</span>}
      {showLabel && <span className="badge-label">{config.label}</span>}
    </span>
  );
}
