import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          'w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all',
          maxWidth
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-slate-300">{children}</div>
      </div>
    </div>
  );
}
