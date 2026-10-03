import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, TrendingUp, TrendingDown, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { SentimentBadge, FreshnessBadge } from '../components/common/Badge';
import { api } from '../services/api';

export const MarketPulsePage: React.FC<{ onOpenQuickTrade: (symbol: string) => void }> = ({
  onOpenQuickTrade,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPulse = async () => {
    setLoading(true);
    try {
      const res = await api.markets.getOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load market pulse:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, []);

  const quotes = data?.quotes || [];
  const news = data?.news || [];
  const sentiment = data?.sentimentDistribution || { bullish: 0, bearish: 0, neutral: 0, total: 0 };

  // Calculate divergence where sentiment opposes price action
  const divergences = quotes.filter((q: any) => {
    const symbolNews = news.find((n: any) => n.symbol === q.symbol);
    if (!symbolNews) return false;
    const isPriceUp = q.changePercent > 0.5;
    const isPriceDown = q.changePercent < -0.5;
    return (isPriceUp && symbolNews.sentiment === 'BEARISH') || (isPriceDown && symbolNews.sentiment === 'BULLISH');
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Market Pulse & Sentiment Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Macro breadth, sentiment distributions, real news correlation, and price divergences.
          </p>
        </div>

        <button
          onClick={fetchPulse}
          className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Pulse</span>
        </button>
      </div>

      {/* Top Sentiment Distribution Bar */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-4 border border-brand-lavender/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Broad Sentiment Breadth</h3>
            <p className="text-xs text-slate-500">Classified across {sentiment.total} financial news wires</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold font-mono">
            <span className="text-emerald-600">Bullish: {sentiment.bullish}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">Neutral: {sentiment.neutral}</span>
            <span className="text-slate-400">•</span>
            <span className="text-rose-600">Bearish: {sentiment.bearish}</span>
          </div>
        </div>

        {/* Stacked Sentiment Bar */}
        <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${sentiment.total ? (sentiment.bullish / sentiment.total) * 100 : 33}%` }}
            title={`Bullish: ${sentiment.bullish}`}
          />
          <div
            className="h-full bg-slate-400 transition-all duration-500"
            style={{ width: `${sentiment.total ? (sentiment.neutral / sentiment.total) * 100 : 34}%` }}
            title={`Neutral: ${sentiment.neutral}`}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${sentiment.total ? (sentiment.bearish / sentiment.total) * 100 : 33}%` }}
            title={`Bearish: ${sentiment.bearish}`}
          />
        </div>
      </div>

      {/* Benchmark Universe Quotes */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Benchmark Movement
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quotes.map((q: any) => {
            const isUp = q.change >= 0;
            return (
              <div
                key={q.symbol}
                className="glass-panel rounded-3xl p-5 hover:shadow-elevated transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Link
                    to={`/markets/${q.symbol}`}
                    className="font-mono font-bold text-lg text-slate-900 hover:text-brand-primary"
                  >
                    {q.symbol}
                  </Link>
                  <FreshnessBadge freshness={q.freshness} />
                </div>

                <div className="flex items-end justify-between">
                  <div className="font-mono font-extrabold text-2xl text-slate-900">
                    ${q.price.toFixed(2)}
                  </div>
                  <div className={`text-xs font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isUp ? '+' : ''}{q.changePercent.toFixed(2)}%
                  </div>
                </div>

                <button
                  onClick={() => onOpenQuickTrade(q.symbol)}
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-brand-primary hover:text-white text-slate-700 text-xs font-bold transition-all"
                >
                  Trade {q.symbol}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divergence & News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Divergence Detection Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-bold text-slate-900">Sentiment / Price Divergence</h3>
          </div>
          <p className="text-xs text-slate-500">
            Highlights securities where headline tone and actual auction price movement diverge.
          </p>

          {divergences.length > 0 ? (
            <div className="space-y-3">
              {divergences.map((q: any) => (
                <div
                  key={q.symbol}
                  className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="font-mono text-slate-900">{q.symbol}</span>
                    <span className={q.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      Price: {q.change >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Divergence detected: asset is moving contrary to prevailing news sentiment classification.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No strong statistical divergences currently detected among benchmark securities.
            </div>
          )}
        </div>

        {/* Real Financial News Stream */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Verified Financial Headlines</h3>
            <span className="text-xs text-slate-400">Live Wire</span>
          </div>

          <div className="space-y-3">
            {news.slice(0, 5).map((item: any) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/60 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500">{item.source}</span>
                  <SentimentBadge sentiment={item.sentiment} score={item.sentimentScore} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-primary flex items-center gap-1"
                  >
                    <span>{item.headline}</span>
                    <ExternalLink className="w-3 h-3 opacity-40 flex-shrink-0" />
                  </a>
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
