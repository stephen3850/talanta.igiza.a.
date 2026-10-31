import React from 'react';
import { cn } from '../lib/utils';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border';

  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    pending: 'bg-gold-500/10 text-gold-400 border-gold-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    navy: 'bg-navy-800 text-slate-200 border-navy-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
