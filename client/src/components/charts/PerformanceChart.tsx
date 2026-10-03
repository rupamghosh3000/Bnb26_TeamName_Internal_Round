import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';

interface PerformanceChartProps {
  data: any[];
  startingCash?: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  startingCash = 100000,
}) => {
  const { currency, rate, formatAmount } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No performance history available yet.
      </div>
    );
  }

  const multiplier = currency === 'INR' ? rate : 1;
  const displayData = data.map((d) => ({
    ...d,
    displayTotalValue: d.totalValue * multiplier,
  }));
  const displayStartingCash = startingCash * multiplier;

  const values = displayData.map((d) => d.displayTotalValue);
  const minVal = Math.min(...values, displayStartingCash) * 0.99;
  const maxVal = Math.max(...values, displayStartingCash) * 1.01;
  const latest = data[data.length - 1]?.totalValue || startingCash;
  const isUp = latest >= startingCash;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
          <defs>
            <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isUp ? '#10B981' : '#6736C7'} stopOpacity={0.35} />
              <stop offset="95%" stopColor={isUp ? '#10B981' : '#6736C7'} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[minVal, maxVal]}
            tick={{ fontSize: 11, fill: '#64748B' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              if (currency === 'INR') {
                if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                return `₹${Math.round(val).toLocaleString('en-IN')}`;
              }
              return `$${(val / 1000).toFixed(0)}k`;
            }}
          />
          <ReferenceLine
            y={displayStartingCash}
            stroke="#94A3B8"
            strokeDasharray="4 4"
            label={{ value: 'Baseline', fill: '#94A3B8', fontSize: 10, position: 'right' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                const pnl = d.totalValue - startingCash;
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs">
                    <div className="text-slate-400 mb-1">{d.date}</div>
                    <div className="font-mono text-base font-extrabold">
                      {formatAmount(d.totalValue)}
                    </div>
                    <div className={`mt-1 font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pnl >= 0 ? '+' : '-'}{formatAmount(Math.abs(pnl))} ({((pnl / startingCash) * 100).toFixed(2)}%)
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="displayTotalValue"
            stroke={isUp ? '#10B981' : '#6736C7'}
            strokeWidth={2.5}
            fill="url(#perfGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
