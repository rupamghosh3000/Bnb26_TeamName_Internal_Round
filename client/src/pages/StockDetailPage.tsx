import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Shield,
  Loader2,
  Info,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { StockChart } from '../components/charts/StockChart';
import { FreshnessBadge, SentimentBadge } from '../components/common/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export const StockDetailPage: React.FC<{ onOpenQuickTrade: (symbol: string) => void }> = ({
  onOpenQuickTrade,
}) => {
  const { symbol = 'AAPL' } = useParams<{ symbol: string }>();
  const cleanSymbol = symbol.toUpperCase();
  const { user } = useAuth();
  const { currency, formatAmount, rate } = useCurrency();

  const [quote, setQuote] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [sentiment, setSentiment] = useState<any>(null);
  const [whyMoveAnalysis, setWhyMoveAnalysis] = useState<any>(null);
  const [analyzingWhyMove, setAnalyzingWhyMove] = useState(false);
  const [heldPosition, setHeldPosition] = useState<any>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setWhyMoveAnalysis(null);

    Promise.all([
      api.markets.getQuote(cleanSymbol),
      api.markets.getNews(cleanSymbol, 6),
      api.markets.getSentiment(cleanSymbol),
      api.portfolio.getPositions().catch(() => []),
      api.watchlists.get().catch(() => null),
    ])
      .then(([q, nw, sent, posList, wl]) => {
        if (!isMounted) return;
        setQuote(q);
        setNews(nw);
        setSentiment(sent);

        const pos = posList.find((p: any) => p.symbol === cleanSymbol);
        setHeldPosition(pos || null);

        if (wl?.watchlist) {
          setWatchlistId(wl.watchlist._id);
          setIsInWatchlist(wl.watchlist.symbols.includes(cleanSymbol));
        }
      })
      .catch((err) => {
        console.error('Error fetching stock details:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cleanSymbol]);

  const handleToggleWatchlist = async () => {
    if (!watchlistId) return;
    try {
      if (isInWatchlist) {
        await api.watchlists.removeSymbol(watchlistId, cleanSymbol);
        setIsInWatchlist(false);
      } else {
        await api.watchlists.addSymbol(watchlistId, cleanSymbol);
        setIsInWatchlist(true);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const handleTriggerWhyMove = async () => {
    setAnalyzingWhyMove(true);
    try {
      const res = await api.ai.whyMove(cleanSymbol);
      setWhyMoveAnalysis(res);
    } catch (err) {
      console.error('Failed to analyze why move:', err);
    } finally {
      setAnalyzingWhyMove(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Security Not Found</h2>
        <p className="text-sm text-slate-500">
          Unable to locate market data for symbol "{cleanSymbol}". Please verify the ticker.
        </p>
        <Link
          to="/markets"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-brand-primary text-white font-bold text-xs"
        >
          <span>Back to Markets</span>
        </Link>
      </div>
    );
  }

  const isUp = quote.change >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* 1. HEADER & LIVE QUOTE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-glow text-brand-deep font-mono font-extrabold text-xl flex items-center justify-center border border-brand-lavender/50">
            {quote.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {quote.symbol}
              </h1>
              <FreshnessBadge freshness={quote.freshness} />
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {quote.exchange}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{quote.name}</p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between md:justify-end gap-6">
          <div className="text-right">
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {formatAmount(quote.price)}
            </div>
            <div className="text-[11px] font-mono text-slate-400 font-medium">
              {currency === 'INR'
                ? `($${quote.price.toFixed(2)} USD)`
                : `(≈ ₹${(quote.price * rate).toLocaleString('en-IN', { maximumFractionDigits: 2 })} INR)`}
            </div>
            <div className={`text-xs font-bold flex items-center justify-end gap-1 mt-0.5 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isUp ? '+' : '-'}{formatAmount(Math.abs(quote.change))} ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWatchlist}
              className={`p-3 rounded-2xl border transition-all ${
                isInWatchlist
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-primary'
              }`}
              title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isInWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onOpenQuickTrade(cleanSymbol)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white font-extrabold text-xs shadow-md shadow-brand-primary/25 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Paper Trade</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CHART & TRADE / POSITION OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
          <StockChart symbol={cleanSymbol} defaultRange="1mo" />
        </div>

        {/* Key Statistics & Current Position Card (1 col) */}
        <div className="space-y-6">
          {/* Key Stats */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Market Statistics
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Day High</span>
                <span className="font-mono font-bold text-slate-900">
                  {quote.dayHigh ? formatAmount(quote.dayHigh) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Day Low</span>
                <span className="font-mono font-bold text-slate-900">
                  {quote.dayLow ? formatAmount(quote.dayLow) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">52-Week High</span>
                <span className="font-mono font-bold text-slate-900">
                  {quote.fiftyTwoWeekHigh ? formatAmount(quote.fiftyTwoWeekHigh) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">52-Week Low</span>
                <span className="font-mono font-bold text-slate-900">
                  {quote.fiftyTwoWeekLow ? formatAmount(quote.fiftyTwoWeekLow) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Trading Volume</span>
                <span className="font-mono font-bold text-slate-900">{quote.volume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Currency</span>
                <span className="font-mono font-bold text-slate-900">
                  {currency === 'INR' ? `INR (Converted @ ₹${rate.toFixed(2)}/$)` : quote.currency || 'USD'}
                </span>
              </div>
            </div>
          </div>

          {/* User Active Position if Held */}
          {heldPosition && (
            <div className="glass-panel-elevated rounded-3xl p-6 border border-brand-lavender/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-deep">
                  Your Position
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ACTIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Shares Held</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    {heldPosition.quantity}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Avg Price</span>
                  <span className="font-mono font-bold text-base text-slate-900">
                    {formatAmount(heldPosition.averagePrice)}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500">Unrealized P&L:</span>
                  <span className={`font-mono font-bold text-sm ${heldPosition.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {heldPosition.unrealizedPnL >= 0 ? '+' : '-'}{formatAmount(Math.abs(heldPosition.unrealizedPnL || 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. AI "WHY DID IT MOVE?" SECTION */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-4 border border-brand-lavender/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Why Did {cleanSymbol} Move?</h3>
              <p className="text-xs text-slate-500">
                AI cross-references price action, trading volume, and headline announcements
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerWhyMove}
            disabled={analyzingWhyMove}
            className="px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-primary/20 disabled:bg-slate-300"
          >
            {analyzingWhyMove ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Generate Grounded Explanation</span>
              </>
            )}
          </button>
        </div>

        {whyMoveAnalysis ? (
          <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {whyMoveAnalysis.answer}
            </p>

            {whyMoveAnalysis.observations && (
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Observed Facts & Data
                </span>
                {whyMoveAnalysis.observations.map((obs: string, i: number) => (
                  <div key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-brand-primary font-bold mt-0.5">•</span>
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            )}

            {whyMoveAnalysis.uncertainty && (
              <div className="text-xs text-slate-600 flex items-start gap-2 p-3 rounded-2xl bg-brand-glow/30 border border-brand-lavender/40">
                <Info className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <span>{whyMoveAnalysis.uncertainty}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-600">
            Click "Generate Grounded Explanation" to analyze recent price action against verified news and liquidity developments.
          </div>
        )}
      </div>

      {/* 4. REAL FINANCIAL NEWS & SENTIMENT STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Feed (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Financial News & Coverage</h3>
            <span className="text-xs text-slate-400 font-medium">Yahoo Finance Wire</span>
          </div>

          <div className="space-y-3">
            {news.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 hover:border-brand-lavender hover:bg-slate-50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">{item.source}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.publishedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <SentimentBadge sentiment={item.sentiment} score={item.sentimentScore} />
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-primary flex items-center gap-1.5"
                  >
                    <span>{item.headline}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                  </a>
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Distribution Card (1 col) */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sentiment Distribution</h3>
            <p className="text-xs text-slate-500">Classification across {sentiment?.distribution?.total || 0} recent reports</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700">Bullish Headlines</span>
                <span className="font-mono">{sentiment?.distribution?.bullish || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${sentiment?.distribution?.total ? (sentiment.distribution.bullish / sentiment.distribution.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Neutral Headlines</span>
                <span className="font-mono">{sentiment?.distribution?.neutral || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-400"
                  style={{
                    width: `${sentiment?.distribution?.total ? (sentiment.distribution.neutral / sentiment.distribution.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700">Bearish Headlines</span>
                <span className="font-mono">{sentiment?.distribution?.bearish || 0}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500"
                  style={{
                    width: `${sentiment?.distribution?.total ? (sentiment.distribution.bearish / sentiment.distribution.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed">
            Sentiment is evaluated from published headlines using natural language heuristics. Correlation with price behavior is observed rather than causal.
          </div>
        </div>
      </div>
    </div>
  );
};
