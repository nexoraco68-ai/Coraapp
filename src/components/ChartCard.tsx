import { type ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, action, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
