import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Layers,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { AllocationPieChart } from '../components/charts/AllocationPieChart';
import { FreshnessBadge } from '../components/common/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC<{ onOpenQuickTrade: (symbol?: string) => void }> = ({
  onOpenQuickTrade,
}) => {
  const { account, refreshAccount } = useAuth();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [marketOverview, setMarketOverview] = useState<any>(null);
  const [marketBrief, setMarketBrief] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [port, perf, overview, brief, tr, wl] = await Promise.all([
        api.portfolio.getSummary(),
        api.portfolio.getPerformance(),
        api.markets.getOverview(),
        api.ai.getMarketBrief(),
        api.trades.getAll(5),
        api.watchlists.get(),
      ]);

      setPortfolio(port);
      setPerformance(perf);
      setMarketOverview(overview);
      setMarketBrief(brief);
      setTrades(tr.trades || []);
      setWatchlist(wl);
      await refreshAccount();
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  const totalValue = portfolio?.totalValue || account?.cashBalance || 100000;
  const startingCash = portfolio?.startingCash || 100000;
  const totalPnL = portfolio?.totalPnL || 0;
  const returnPercent = portfolio?.returnPercent || 0;
  const cashBalance = portfolio?.cashBalance || account?.cashBalance || 100000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* 1. TOP WELCOME & METRIC CARDS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Portfolio Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time market values, double-entry paper transactions, and AI-grounded observations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onOpenQuickTrade()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white text-xs font-extrabold shadow-md shadow-brand-primary/25 transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>New Paper Trade</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={returnPercent}
          changeText={`Base: $${startingCash.toLocaleString()}`}
          icon={<Wallet className="w-5 h-5" />}
        />
        <StatCard
          title="Total Net P&L"
          value={`${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={returnPercent}
          changeText={`${returnPercent >= 0 ? '+' : ''}${returnPercent.toFixed(2)}% net`}
          icon={totalPnL >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="Virtual Cash Buffer"
          value={`$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          changeText={`${portfolio?.cashExposurePercent?.toFixed(1) || 100}% allocation`}
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          title="Invested Capital"
          value={`$${(portfolio?.investedValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          changeText={`${portfolio?.positionsCount || 0} active positions`}
          icon={<Layers className="w-5 h-5" />}
        />
      </div>

      {/* 2. MAIN CHARTS & MARKET BRIEF ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Equity Curve Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Portfolio Equity Curve</h3>
              <p className="text-xs text-slate-500">Historical performance vs $100k starting capital baseline</p>
            </div>
            <Link
              to="/portfolio"
              className="text-xs font-bold text-brand-primary hover:text-brand-deep flex items-center gap-1"
            >
              <span>Portfolio Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PerformanceChart data={performance} startingCash={startingCash} />
        </div>

        {/* AI Market Brief Card (1 col) */}
        <div className="glass-panel-elevated rounded-3xl p-6 space-y-4 border border-brand-lavender/50 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">AI Market Brief</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live Analysis
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {marketBrief?.answer || 'Loading verified market intelligence...'}
            </p>

            {marketBrief?.observations && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Key Observations
                </span>
                {marketBrief.observations.slice(0, 2).map((obs: string, i: number) => (
                  <div key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-brand-primary font-bold">•</span>
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              to="/ai"
              className="w-full py-2.5 rounded-2xl bg-brand-glow text-brand-deep font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-brand-lavender/50 transition-colors"
            >
              <span>Open AI Intelligence Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE POSITIONS TABLE & ALLOCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Positions Table (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Positions</h3>
              <p className="text-xs text-slate-500">
                {portfolio?.positions?.length || 0} securities held with real-time mark-to-market valuation
              </p>
            </div>
            <Link
              to="/trade"
              className="text-xs font-bold text-brand-primary hover:text-brand-deep flex items-center gap-1"
            >
              <span>Trade Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {portfolio?.positions && portfolio.positions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3 text-right">Shares</th>
                    <th className="pb-3 text-right">Avg Entry</th>
                    <th className="pb-3 text-right">Current Price</th>
                    <th className="pb-3 text-right">Market Value</th>
                    <th className="pb-3 text-right">Unrealized P&L</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {portfolio.positions.map((pos: any) => (
                    <tr key={pos.symbol} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3">
                        <Link
                          to={`/markets/${pos.symbol}`}
                          className="font-mono font-bold text-slate-900 hover:text-brand-primary"
                        >
                          {pos.symbol}
                        </Link>
                        <span className="text-[11px] text-slate-600 block truncate max-w-[120px]">
                          {pos.name}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-semibold">{pos.quantity}</td>
                      <td className="py-3 text-right font-mono">${pos.averagePrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono font-bold">${pos.currentPrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono font-bold">
                        ${pos.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono font-bold">
                        <span className={pos.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                          <span className="text-[10px] block">({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)</span>
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onOpenQuickTrade(pos.symbol)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-600 text-xs space-y-3">
              <p>You don't currently hold any positions in your paper trading account.</p>
              <button
                onClick={() => onOpenQuickTrade('AAPL')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-primary text-white text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Place Your First Paper Trade</span>
              </button>
            </div>
          )}
        </div>

        {/* Allocation Donut (1 col) */}
        <div className="glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Asset Allocation</h3>
            <p className="text-xs text-slate-500">Distribution between cash and equities</p>
          </div>

          <AllocationPieChart
            positions={portfolio?.positions || []}
            cashBalance={cashBalance}
          />

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Largest Exposure:</span>
            <span className="font-mono font-bold text-slate-900">
              {portfolio?.largestPosition ? `${portfolio.largestPosition.symbol} (${portfolio.largestPosition.allocationPercent}%)` : 'Cash (100%)'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. WATCHLIST & RECENT TRADES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Watchlist Stream</h3>
              <p className="text-xs text-slate-500">Tracked securities with live pricing</p>
            </div>
            <Link
              to="/markets"
              className="text-xs font-bold text-brand-primary hover:text-brand-deep flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {watchlist?.items?.map((item: any) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 hover:bg-slate-100/80 transition-all border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-glow text-brand-deep font-mono font-bold text-xs flex items-center justify-center">
                    {item.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <Link
                      to={`/markets/${item.symbol}`}
                      className="font-mono font-bold text-slate-900 hover:text-brand-primary text-sm"
                    >
                      {item.symbol}
                    </Link>
                    <span className="text-[11px] text-slate-600 block truncate max-w-[140px]">
                      {item.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      ${item.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        item.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <FreshnessBadge freshness={item.freshness} />
                  <button
                    onClick={() => onOpenQuickTrade(item.symbol)}
                    className="p-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand-primary text-slate-600 text-xs font-bold"
                  >
                    Trade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trades History */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Executions</h3>
              <p className="text-xs text-slate-500">Immutable ledger of paper trades</p>
            </div>
            <Link
              to="/journal"
              className="text-xs font-bold text-brand-primary hover:text-brand-deep flex items-center gap-1"
            >
              <span>Trade Journal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {trades.length > 0 ? (
            <div className="space-y-2">
              {trades.map((t: any) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
                        t.side === 'BUY'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {t.side}
                    </span>
                    <div>
                      <span className="font-mono font-bold text-slate-900">{t.symbol}</span>
                      <span className="text-slate-400 block text-[10px]">
                        {new Date(t.executedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block">
                      {t.quantity} @ ${t.price.toFixed(2)}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Value: ${t.value.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No paper trading executions recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
