import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { FreshnessBadge } from '../components/common/Badge';
import { CurrencyConverterWidget } from '../components/common/CurrencyConverterWidget';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';

export const MarketsPage: React.FC<{ onOpenQuickTrade: (symbol: string) => void }> = ({
  onOpenQuickTrade,
}) => {
  const { formatAmount } = useCurrency();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [popularQuotes, setPopularQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const symbols = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'SPY', 'QQQ', 'AMD'];

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const quotes = await Promise.all(
        symbols.map(async (s) => {
          try {
            return await api.markets.getQuote(s);
          } catch {
            return null;
          }
        })
      );
      setPopularQuotes(quotes.filter((q): q is NonNullable<typeof q> => q !== null));
    } catch (err) {
      console.error('Error fetching market quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      api.markets.search(search).then(setSearchResults).catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Markets Universe
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real market prices, verified liquidity metrics, and financial asset search.
          </p>
        </div>

        <button
          onClick={fetchQuotes}
          className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Quotes</span>
        </button>
      </div>

      {/* Real-time Symbol Search Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-brand-primary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equities by symbol or name (e.g. Apple, NVDA, Microsoft)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-glow outline-none text-sm text-slate-900 bg-white"
          />
        </div>

        {/* Autocomplete Search Dropdown */}
        {searchResults.length > 0 && (
          <div className="p-2 bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 shadow-soft">
            {searchResults.map((r) => (
              <div
                key={r.symbol}
                className="flex items-center justify-between p-3 hover:bg-brand-glow/30 rounded-xl transition-colors"
              >
                <Link to={`/markets/${r.symbol}`} className="flex-1">
                  <div className="font-mono font-bold text-slate-900 text-sm">{r.symbol}</div>
                  <div className="text-xs text-slate-500 truncate">{r.name} ({r.exchange})</div>
                </Link>
                <Link
                  to={`/markets/${r.symbol}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-primary hover:text-white text-xs font-bold text-slate-700 transition-colors"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Currency Converter & Rupee Calculator */}
      <CurrencyConverterWidget />

      {/* Grid of Monitored Assets */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Core Monitored Universe
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {popularQuotes.map((q) => {
            const isUp = q.change >= 0;
            return (
              <div
                key={q.symbol}
                className="glass-panel rounded-3xl p-5 hover:shadow-elevated transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/markets/${q.symbol}`}
                        className="font-mono font-bold text-lg text-slate-900 group-hover:text-brand-primary transition-colors"
                      >
                        {q.symbol}
                      </Link>
                      <FreshnessBadge freshness={q.freshness} />
                    </div>
                    <span className="text-xs text-slate-500 block truncate max-w-[150px] mt-0.5">
                      {q.name}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenQuickTrade(q.symbol)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600 transition-colors"
                    title={`Trade ${q.symbol}`}
                  >
                    <Zap className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="font-mono font-extrabold text-2xl text-slate-900 block">
                      {formatAmount(q.price)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Vol: {q.volume.toLocaleString()}
                    </span>
                  </div>

                  <div className={`text-xs font-bold text-right ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <div className="flex items-center justify-end gap-0.5">
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{isUp ? '+' : ''}{q.changePercent.toFixed(2)}%</span>
                    </div>
                    <span className="text-[10px] block opacity-80">
                      {isUp ? '+' : '-'}{formatAmount(Math.abs(q.change))}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/markets/${q.symbol}`}
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-brand-glow text-center text-xs font-bold text-brand-deep transition-colors flex items-center justify-center gap-1"
                >
                  <span>Detailed Analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
