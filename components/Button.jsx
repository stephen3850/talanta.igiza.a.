import React from 'react';
import { cn } from '../lib/utils';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';

  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 focus:ring-emerald-400',
    amber: 'bg-amber-400/90 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20 focus:ring-amber-400',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-500',
    navy: 'bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 focus:ring-navy-500',
    outline: 'border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 focus:ring-emerald-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 focus:ring-red-500',
    ghost: 'hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
