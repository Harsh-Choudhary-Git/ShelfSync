import React from 'react';

interface BadgeProps {
  status?: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, size = 'sm' }) => {
  let computedVariant = variant;

  if (!computedVariant && status) {
    const s = status.toUpperCase();
    if (['ACTIVE', 'RETURNED', 'PAID', 'FULFILLED', 'AVAILABLE', 'ROLE_MEMBER'].includes(s)) {
      computedVariant = s === 'OVERDUE' ? 'error' : s === 'ACTIVE' ? 'success' : s === 'PAID' || s === 'RETURNED' || s === 'FULFILLED' ? 'info' : 'success';
    } else if (['OVERDUE', 'UNPAID', 'CANCELLED', 'INACTIVE'].includes(s)) {
      computedVariant = 'error';
    } else if (['EXPIRED', 'PENDING'].includes(s)) {
      computedVariant = 'warning';
    } else if (s === 'ROLE_ADMIN') {
      computedVariant = 'purple';
    } else if (s === 'ROLE_LIBRARIAN') {
      computedVariant = 'info';
    } else {
      computedVariant = 'neutral';
    }
  }

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    error: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-sm font-medium',
  };

  const displayText = children || status?.replace('ROLE_', '');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors ${
        variantStyles[computedVariant || 'neutral']
      } ${sizeStyles[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {displayText}
    </span>
  );
};
