import React from 'react';

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  label, 
  showPercent = true, 
  size = 'md',
  variant = 'auto',
  animated = true,
  className = '' 
}) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const actualPercent = max > 0 ? (value / max) * 100 : 0;
  
  const getVariantClass = () => {
    if (variant !== 'auto') return variant;
    if (actualPercent >= 100) return 'danger';
    if (actualPercent >= 90) return 'danger';
    if (actualPercent >= 75) return 'warning';
    if (actualPercent >= 50) return 'info';
    return 'success';
  };

  const variantClass = getVariantClass();

  return (
    <div className={`progress-wrapper ${className}`}>
      {label && (
        <div className="progress-header">
          <span className="progress-label-text">{label}</span>
          {showPercent && (
            <span className={`progress-percent text-${variantClass}`}>
              {actualPercent.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className={`progress-bar progress-${size}`}>
        <div 
          className={`progress-fill progress-fill-${variantClass} ${animated ? 'progress-animated' : ''}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
