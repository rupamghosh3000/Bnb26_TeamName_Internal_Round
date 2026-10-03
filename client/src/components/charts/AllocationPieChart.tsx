import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface AllocationPieChartProps {
  positions: any[];
  cashBalance: number;
}

const COLORS = ['#6736C7', '#9A78E8', '#4B1FA8', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1'];

export const AllocationPieChart: React.FC<AllocationPieChartProps> = ({
  positions = [],
  cashBalance = 100000,
}) => {
  const data = [
    ...positions.map((p, i) => ({
      name: p.symbol,
      value: p.currentValue,
      color: COLORS[i % COLORS.length],
    })),
    {
      name: 'Virtual Cash',
      value: cashBalance,
      color: '#CBD5E1',
    },
  ].filter((d) => d.value > 0);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return (
                  <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg">
                    <span className="font-bold">{item.name}: </span>
                    <span className="font-mono">${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-slate-400 block mt-0.5">({pct}% of portfolio)</span>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
