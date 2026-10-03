import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface StockChartProps {
  symbol: string;
  defaultRange?: string;
}

export const StockChart: React.FC<StockChartProps> = ({ symbol, defaultRange = '1mo' }) => {
  const [range, setRange] = useState(defaultRange);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const intervalMap: Record<string, string> = {
      '1d': '5m',
      '5d': '15m',
      '1mo': '1d',
      '6mo': '1d',
      '1y': '1d',
      '5y': '1wk',
    };

    api.markets
      .getHistory(symbol, range, intervalMap[range] || '1d')
      .then((bars) => {
        if (isMounted) {
          const formatted = bars.map((b) => ({
            date: range === '1d' ? new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : b.date.split('T')[0],
            close: b.close,
            open: b.open,
            high: b.high,
            low: b.low,
            volume: b.volume,
          }));
          setData(formatted);
        }
      })
      .catch(() => {
        if (isMounted) setData([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [symbol, range]);

  const ranges = [
    { label: '1D', value: '1d' },
    { label: '5D', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
  ];

  const minPrice = data.length > 0 ? Math.min(...data.map((d) => d.low || d.close)) * 0.995 : 0;
  const maxPrice = data.length > 0 ? Math.max(...data.map((d) => d.high || d.close)) * 1.005 : 100;
  const isUp = data.length > 1 ? data[data.length - 1].close >= data[0].close : true;

  const strokeColor = isUp ? '#10B981' : '#6736C7';
  const fillColor = isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(103, 54, 199, 0.15)';

  return (
    <div className="w-full">
      {/* Range Selector Bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Historical Price (OHLCV)
        </span>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                range === r.value
                  ? 'bg-white text-brand-deep shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-xs rounded-2xl z-10">
            <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            No historical price data available for the selected range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient_${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val.toFixed(val < 10 ? 2 : 0)}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900/90 text-white p-3 rounded-2xl shadow-xl text-xs backdrop-blur-sm border border-slate-700">
                        <div className="font-semibold text-slate-300 mb-1">{d.date}</div>
                        <div className="font-mono text-base font-extrabold text-white">
                          ${d.close.toFixed(2)}
                        </div>
                        {d.open && (
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2 text-[10px] text-slate-400 font-mono">
                            <span>Open: ${d.open.toFixed(2)}</span>
                            <span>High: ${d.high.toFixed(2)}</span>
                            <span>Low: ${d.low.toFixed(2)}</span>
                            <span>Vol: {d.volume?.toLocaleString() || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#gradient_${symbol})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
