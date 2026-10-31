import React from 'react';
import { cn } from '../lib/utils';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'up', // up, down, neutral
  accentColor = 'emerald', // emerald, gold, sky, red
  className = '',
}) {
  const borderAccents = {
    emerald: 'border-l-emerald-500',
    gold: 'border-l-gold-500',
    sky: 'border-l-sky-500',
    red: 'border-l-red-500',
  };

  const iconColors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    gold: 'bg-gold-500/10 text-gold-400 border-gold-500/20',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div
      className={cn(
        'bg-slate-900/90 border border-slate-800 border-l-4 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700',
        borderAccents[accentColor] || borderAccents.emerald,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={cn('p-3 rounded-xl border', iconColors[accentColor] || iconColors.emerald)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center text-xs">
          <span
            className={cn(
              'font-semibold mr-1.5',
              trendType === 'up' ? 'text-emerald-400' : trendType === 'down' ? 'text-red-400' : 'text-slate-400'
            )}
          >
            {trend}
          </span>
          <span className="text-slate-500">vs last matchday</span>
        </div>
      )}
    </div>
  );
}
