import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeText?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  isCurrency?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeText,
  icon,
  subtitle,
}) => {
  const isPositive = change != null && change > 0;
  const isNegative = change != null && change < 0;

  return (
    <div className="glass-panel rounded-3xl p-6 transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <div className="w-10 h-10 rounded-2xl bg-brand-glow flex items-center justify-center text-brand-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mb-2">
        {value}
      </div>

      <div className="flex items-center justify-between">
        {change != null ? (
          <div
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
              isPositive
                ? 'bg-emerald-50 text-emerald-600'
                : isNegative
                ? 'bg-rose-50 text-rose-600'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
            {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
            <span>
              {isPositive ? '+' : ''}
              {change.toFixed(2)}%
            </span>
          </div>
        ) : (
          <div />
        )}

        {(changeText || subtitle) && (
          <span className="text-xs text-slate-600">{changeText || subtitle}</span>
        )}
      </div>
    </div>
  );
};
