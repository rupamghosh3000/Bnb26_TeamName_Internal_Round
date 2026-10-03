import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.markets.search(query);
        setResults(data);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (symbol: string) => {
    onClose();
    navigate(`/markets/${symbol}`);
  };

  const defaultPopular = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPY'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-brand-lavender/50 overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-6 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-brand-primary mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search stocks by symbol or company name (e.g. AAPL, Tesla, Nvidia)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base font-medium placeholder-slate-400 bg-transparent outline-none text-slate-900"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-brand-soft animate-spin mr-2" />
          ) : query ? (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md text-slate-500 hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="max-h-96 overflow-y-auto p-4">
          {query.trim().length > 0 ? (
            results.length > 0 ? (
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Securities Found
                </div>
                {results.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-brand-glow/40 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-glow flex items-center justify-center font-mono font-bold text-brand-deep">
                        {item.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{item.symbol}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                            {item.exchange}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 truncate max-w-md">{item.name}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            ) : !loading ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No active securities found matching "{query}".
              </div>
            ) : null
          ) : (
            <div>
              <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Popular Securities
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {defaultPopular.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => handleSelect(sym)}
                    className="flex items-center gap-2 p-3 rounded-2xl border border-slate-100 hover:border-brand-lavender hover:bg-brand-glow/30 transition-all font-mono font-bold text-slate-800"
                  >
                    <TrendingUp className="w-4 h-4 text-brand-soft" />
                    <span>{sym}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
