import React, { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  History,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FreshnessBadge } from '../components/common/Badge';

export const TradePage: React.FC = () => {
  const { account, refreshAccount } = useAuth();
  const [symbol, setSymbol] = useState('AAPL');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'trades'>('orders');

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchQuote = async (sym: string) => {
    if (!sym) return;
    setLoadingQuote(true);
    try {
      const q = await api.markets.getQuote(sym);
      setQuote(q);
      if (type === 'LIMIT' && !limitPrice) {
        setLimitPrice(q.price.toString());
      }
    } catch {
      setQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  };

  const fetchTradeHistory = async () => {
    try {
      const [posList, ordList, trList] = await Promise.all([
        api.portfolio.getPositions(),
        api.orders.getAll(20),
        api.trades.getAll(20),
      ]);
      setPositions(posList);
      setOrders(ordList.orders || []);
      setTrades(trList.trades || []);
      await refreshAccount();
    } catch (err) {
      console.error('Failed to load trade data:', err);
    }
  };

  useEffect(() => {
    fetchQuote(symbol);
    fetchTradeHistory();
  }, [symbol]);

  const heldPosition = positions.find((p) => p.symbol === symbol.toUpperCase());
  const heldQuantity = heldPosition ? heldPosition.quantity : 0;
  const executionPrice = quote ? quote.price : 0;
  const targetPrice = type === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : executionPrice;
  const totalCost = targetPrice * quantity;
  const availableCash = account?.cashBalance || 0;

  const handleExecuteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await api.orders.place({
        symbol: symbol.toUpperCase(),
        side,
        type,
        quantity,
        limitPrice: type === 'LIMIT' ? parseFloat(limitPrice) : undefined,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6736C7', '#10B981'],
      });

      setSuccess(res.message);
      fetchTradeHistory();
    } catch (err: any) {
      setError(err.message || 'Order failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.orders.cancel(orderId);
      fetchTradeHistory();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Paper Trading Terminal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Execute simulated orders with real market liquidity against your $100,000 virtual balance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ORDER EXECUTION FORM (1 col) */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-lavender/50">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              New Order
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
              <Wallet className="w-4 h-4 text-brand-primary" />
              <span>${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <form onSubmit={handleExecuteOrder} className="space-y-5">
            {/* Symbol Input & Quote */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Asset Symbol
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  onBlur={() => fetchQuote(symbol)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono font-extrabold text-slate-900 text-lg uppercase"
                  placeholder="AAPL"
                  required
                />
              </div>

              {quote && (
                <div className="mt-2 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ${quote.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        quote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {quote.change >= 0 ? '+' : ''}
                      {quote.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <FreshnessBadge freshness={quote.freshness} />
                </div>
              )}
            </div>

            {/* Side Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  side === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BUY (LONG)
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  side === 'SELL'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SELL (SHORT/CLOSE)
              </button>
            </div>

            {/* Type Tabs */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type:</span>
              <div className="flex gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => setType('MARKET')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    type === 'MARKET'
                      ? 'border-brand-primary bg-brand-glow text-brand-deep'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Market
                </button>
                <button
                  type="button"
                  onClick={() => setType('LIMIT')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    type === 'LIMIT'
                      ? 'border-brand-primary bg-brand-glow text-brand-deep'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>

            {/* Limit Price */}
            {type === 'LIMIT' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Limit Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="Enter target execution price"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono text-sm"
                  required
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Quantity (Shares)
                </label>
                <span className="text-xs text-slate-400">
                  {side === 'BUY'
                    ? `Max: ${executionPrice > 0 ? Math.floor(availableCash / executionPrice) : 0}`
                    : `Held: ${heldQuantity}`}
                </span>
              </div>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono font-bold text-slate-900"
                required
              />
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Estimated Value:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cash After Trade:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${Math.max(0, availableCash - (side === 'BUY' ? totalCost : 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Error or Success Alerts */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (side === 'BUY' && totalCost > availableCash) || (side === 'SELL' && quantity > heldQuantity)}
              className={`w-full py-4 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                side === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 disabled:bg-slate-300'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 disabled:bg-slate-300'
              }`}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>
                    Submit {side} Order ({quantity} {symbol})
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ORDER & TRADE HISTORY (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-2 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'orders'
                    ? 'border-brand-primary text-brand-deep'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Order Book & History
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={`pb-2 text-sm font-bold border-b-2 transition-all ${
                  activeTab === 'trades'
                    ? 'border-brand-primary text-brand-deep'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Execution Ledger
              </button>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {activeTab === 'orders' ? `${orders.length} orders` : `${trades.length} fills`}
            </span>
          </div>

          {activeTab === 'orders' ? (
            orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Symbol</th>
                      <th className="pb-3">Side</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3 text-right">Qty</th>
                      <th className="pb-3 text-right">Exec Price</th>
                      <th className="pb-3 text-right">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50/60">
                        <td className="py-3 text-slate-400 font-sans text-[11px]">
                          {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 font-bold text-slate-900">{o.symbol}</td>
                        <td className="py-3 font-bold">
                          <span className={o.side === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}>
                            {o.side}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 font-sans">{o.type}</td>
                        <td className="py-3 text-right font-bold text-slate-900">{o.quantity}</td>
                        <td className="py-3 text-right font-bold text-slate-900">
                          {o.executedPrice ? `$${o.executedPrice.toFixed(2)}` : o.limitPrice ? `$${o.limitPrice.toFixed(2)}` : 'Market'}
                        </td>
                        <td className="py-3 text-right font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'FILLED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : o.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-700 animate-pulse'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {o.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelOrder(o._id)}
                              className="text-[11px] font-sans font-bold text-rose-600 hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                No paper orders placed yet.
              </div>
            )
          ) : (
            trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Symbol</th>
                      <th className="pb-3">Side</th>
                      <th className="pb-3 text-right">Shares</th>
                      <th className="pb-3 text-right">Execution Price</th>
                      <th className="pb-3 text-right">Total Value</th>
                      <th className="pb-3 text-right">Realized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono">
                    {trades.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50/60">
                        <td className="py-3 text-slate-400 font-sans text-[11px]">
                          {new Date(t.executedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 font-bold text-slate-900">{t.symbol}</td>
                        <td className="py-3 font-bold">
                          <span className={t.side === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}>
                            {t.side}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900">{t.quantity}</td>
                        <td className="py-3 text-right font-bold text-slate-900">${t.price.toFixed(2)}</td>
                        <td className="py-3 text-right font-bold text-slate-900">${t.value.toFixed(2)}</td>
                        <td className="py-3 text-right font-bold">
                          {t.realizedPnL != null ? (
                            <span className={t.realizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {t.realizedPnL >= 0 ? '+' : ''}${t.realizedPnL.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                No fills recorded in execution ledger.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
