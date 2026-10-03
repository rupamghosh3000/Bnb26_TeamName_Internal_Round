import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { AllocationPieChart } from '../components/charts/AllocationPieChart';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

export const PortfolioPage: React.FC<{ onOpenQuickTrade: (symbol: string, side: 'BUY' | 'SELL') => void }> = ({
  onOpenQuickTrade,
}) => {
  const { formatAmount } = useCurrency();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const [sum, perf] = await Promise.all([
        api.portfolio.getSummary(),
        api.portfolio.getPerformance(),
      ]);
      setPortfolio(sum);
      setPerformance(perf);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const totalValue = portfolio?.totalValue || 100000;
  const startingCash = portfolio?.startingCash || 100000;
  const unrealized = portfolio?.unrealizedPnL || 0;
  const realized = portfolio?.realizedPnL || 0;
  const totalPnL = portfolio?.totalPnL || 0;
  const returnPercent = portfolio?.returnPercent || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Portfolio & Holdings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time mark-to-market valuation, asset allocation, and double-entry transaction P&L.
          </p>
        </div>

        <button
          onClick={fetchPortfolio}
          className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Prices</span>
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Valuation"
          value={formatAmount(totalValue)}
          change={returnPercent}
          changeText={`Base: ${formatAmount(startingCash)}`}
          icon={<Wallet className="w-5 h-5" />}
        />
        <StatCard
          title="Unrealized P&L"
          value={`${unrealized >= 0 ? '+' : '-'}${formatAmount(Math.abs(unrealized))}`}
          changeText="Mark-to-market open"
          icon={unrealized >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="Realized P&L"
          value={`${realized >= 0 ? '+' : '-'}${formatAmount(Math.abs(realized))}`}
          changeText="From closed positions"
          icon={<Layers className="w-5 h-5 text-brand-primary" />}
        />
        <StatCard
          title="Virtual Cash Buffer"
          value={formatAmount(portfolio?.cashBalance || 100000)}
          changeText={`${portfolio?.cashExposurePercent?.toFixed(1) || 100}% of portfolio`}
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>

      {/* Equity Performance Chart & Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Historical Portfolio Equity Curve</h3>
          <PerformanceChart data={performance} startingCash={startingCash} />
        </div>

        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Asset Allocation</h3>
          <AllocationPieChart
            positions={portfolio?.positions || []}
            cashBalance={portfolio?.cashBalance || 100000}
          />
        </div>
      </div>

      {/* Active Holdings Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Current Holdings</h3>
            <p className="text-xs text-slate-500">
              {portfolio?.positions?.length || 0} active securities held
            </p>
          </div>
          <Link
            to="/trade"
            className="px-4 py-2 rounded-2xl bg-brand-primary text-white text-xs font-bold shadow-md shadow-brand-primary/20"
          >
            Open Trade Terminal
          </Link>
        </div>

        {portfolio?.positions && portfolio.positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Security</th>
                  <th className="pb-3 text-right">Shares</th>
                  <th className="pb-3 text-right">Avg Entry</th>
                  <th className="pb-3 text-right">Live Price</th>
                  <th className="pb-3 text-right">Cost Basis</th>
                  <th className="pb-3 text-right">Market Value</th>
                  <th className="pb-3 text-right">Unrealized P&L</th>
                  <th className="pb-3 text-right">Weight</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-mono">
                {portfolio.positions.map((pos: any) => (
                  <tr key={pos.symbol} className="hover:bg-slate-50/60">
                    <td className="py-4">
                      <Link
                        to={`/markets/${pos.symbol}`}
                        className="font-bold text-slate-900 text-sm hover:text-brand-primary"
                      >
                        {pos.symbol}
                      </Link>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[140px] font-sans">
                        {pos.name}
                      </span>
                    </td>
                    <td className="py-4 text-right font-bold text-slate-900">{pos.quantity}</td>
                    <td className="py-4 text-right text-slate-600">{formatAmount(pos.averagePrice)}</td>
                    <td className="py-4 text-right font-bold text-slate-900">{formatAmount(pos.currentPrice)}</td>
                    <td className="py-4 text-right text-slate-600">{formatAmount(pos.investedValue)}</td>
                    <td className="py-4 text-right font-extrabold text-slate-900">{formatAmount(pos.currentValue)}</td>
                    <td className="py-4 text-right font-bold">
                      <span className={pos.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {pos.unrealizedPnL >= 0 ? '+' : '-'}{formatAmount(Math.abs(pos.unrealizedPnL))}
                        <span className="text-[10px] block font-sans">({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)</span>
                      </span>
                    </td>
                    <td className="py-4 text-right font-bold text-brand-deep">
                      {pos.allocationPercent}%
                    </td>
                    <td className="py-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenQuickTrade(pos.symbol, 'BUY')}
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100"
                        >
                          Buy More
                        </button>
                        <button
                          onClick={() => onOpenQuickTrade(pos.symbol, 'SELL')}
                          className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold hover:bg-rose-100"
                        >
                          Close / Sell
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            No active positions held in your portfolio.
          </div>
        )}
      </div>
    </div>
  );
};
