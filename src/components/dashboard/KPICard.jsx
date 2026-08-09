import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, MoveRight } from 'lucide-react';

export default function KPICard({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default',
  className = '',
  animateValue = false
}) {
  const [displayValue, setDisplayValue] = useState(animateValue ? '0' : value);
  const cardRef = useRef(null);

  useEffect(() => {
    if (animateValue && typeof value === 'string') {
      const numericPart = value.replace(/[^0-9.]/g, '');
      const targetNum = parseFloat(numericPart);
      
      if (!isNaN(targetNum) && targetNum > 0) {
        const prefix = value.match(/^[^0-9]*/)?.[0] || '';
        const suffix = value.match(/[^0-9.]*$/)?.[0] || '';
        const duration = 800;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(targetNum * eased);
          
          setDisplayValue(`${prefix}${current.toLocaleString('en-IN')}${suffix}`);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setDisplayValue(value);
          }
        };
        
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    } else {
      setDisplayValue(value);
    }
  }, [value, animateValue]);

  const getTrendClass = () => {
    if (!trend) return '';
    if (trend === 'up') return 'kpi-trend-up';
    if (trend === 'down') return 'kpi-trend-down';
    return 'kpi-trend-neutral';
  };

  return (
    <div className={`kpi-card card kpi-${variant} ${className}`} ref={cardRef}>
      <div className="kpi-card-inner">
        <div className="kpi-content">
          <span className="kpi-label">{title}</span>
          <span className="kpi-value">{displayValue}</span>
          {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
          {trendLabel && (
            <span className={`kpi-trend ${getTrendClass()}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <MoveRight size={14} />} {trendLabel}
            </span>
          )}
        </div>
        {Icon && (
          <div className={`kpi-icon kpi-icon-${variant}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
