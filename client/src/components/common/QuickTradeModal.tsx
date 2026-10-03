import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface QuickTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
  defaultSide?: 'BUY' | 'SELL';
  onTradeSuccess?: () => void;
}

export const QuickTradeModal: React.FC<QuickTradeModalProps> = ({
  isOpen,
  onClose,
  defaultSymbol = 'AAPL',
  defaultSide = 'BUY',
  onTradeSuccess,
}) => {
  const { account, refreshAccount } = useAuth();
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [side, setSide] = useState<'BUY' | 'SELL'>(defaultSide);
  const [type, setType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [quote, setQuote] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSymbol(defaultSymbol);
      setSide(defaultSide);
      setError(null);
      setSuccessMessage(null);
      fetchQuote(defaultSymbol);
      fetchPositions();
    }
  }, [isOpen, defaultSymbol, defaultSide]);

  const fetchQuote = async (sym: string) => {
    if (!sym) return;
    setLoadingQuote(true);
    try {
      const q = await api.markets.getQuote(sym);
      setQuote(q);
      if (type === 'LIMIT' && !limitPrice) {
        setLimitPrice(q.price.toString());
      }
    } catch (err: any) {
      setQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const pos = await api.portfolio.getPositions();
      setPositions(pos);
    } catch {
      // Ignore
    }
  };

  if (!isOpen) return null;

  const currentHeldPosition = positions.find((p) => p.symbol === symbol.toUpperCase());
  const heldQuantity = currentHeldPosition ? currentHeldPosition.quantity : 0;
  const executionPrice = quote ? quote.price : 0;
  const targetPrice = type === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : executionPrice;
  const totalCost = targetPrice * quantity;
  const availableCash = account?.cashBalance || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const result = await api.orders.place({
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
        colors: ['#6736C7', '#9A78E8', '#10B981'],
      });

      setSuccessMessage(result.message);
      await refreshAccount();
      fetchPositions();
      if (onTradeSuccess) onTradeSuccess();

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Trade execution failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-brand-lavender/40 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Virtual Paper Trade</h3>
            <p className="text-xs text-slate-500">Live market execution using virtual funds</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Symbol & Quote Header */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onBlur={() => fetchQuote(symbol)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-glow outline-none font-mono font-bold text-slate-900 text-lg uppercase"
                placeholder="AAPL"
                required
              />
            </div>

            {quote && (
              <div className="px-4 py-2 rounded-2xl bg-brand-glow/40 border border-brand-lavender/50 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Live Price
                </span>
                <span className="text-xl font-mono font-extrabold text-slate-900">
                  ${quote.price.toFixed(2)}
                </span>
                <span className={`text-xs font-semibold block ${quote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {/* Side Selector (BUY / SELL) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
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
              className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                side === 'SELL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SELL
            </button>
          </div>

          {/* Order Type (MARKET / LIMIT) */}
          <div className="flex gap-4 items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Type:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('MARKET')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  type === 'MARKET'
                    ? 'border-brand-primary bg-brand-glow text-brand-deep'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Market Order
              </button>
              <button
                type="button"
                onClick={() => setType('LIMIT')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                  type === 'LIMIT'
                    ? 'border-brand-primary bg-brand-glow text-brand-deep'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Limit Order
              </button>
            </div>
          </div>

          {/* Limit Price Input if LIMIT */}
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
                placeholder="Enter limit price"
                className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono"
                required
              />
            </div>
          )}

          {/* Quantity Stepper */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shares Quantity</label>
              <span className="text-xs text-slate-500 font-medium">
                {side === 'BUY'
                  ? `Max Afford: ${executionPrice > 0 ? Math.floor(availableCash / executionPrice) : 0} shares`
                  : `Currently Held: ${heldQuantity} shares`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono font-bold text-slate-900 text-base"
                required
              />
              <div className="flex gap-1.5">
                {[5, 10, 25, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-semibold hover:bg-slate-100"
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 space-y-2 border border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Estimated Order Value:</span>
              <span className="font-mono font-bold text-slate-900">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Available Virtual Cash:</span>
              <span className="font-mono font-bold text-slate-900">${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || (side === 'BUY' && totalCost > availableCash) || (side === 'SELL' && quantity > heldQuantity)}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              side === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25 disabled:bg-slate-300'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25 disabled:bg-slate-300'
            }`}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>
                  Execute {side} {quantity} {symbol} ({type})
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
