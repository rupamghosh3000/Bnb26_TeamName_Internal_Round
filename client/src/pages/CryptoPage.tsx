import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Flame,
  ArrowRight,
  ShieldCheck,
  Globe,
  Radio,
  Coins,
  Activity,
  Layers,
  BarChart3,
  SlidersHorizontal,
} from 'lucide-react';
import { FreshnessBadge, SentimentBadge } from '../components/common/Badge';
import { CurrencyConverterWidget } from '../components/common/CurrencyConverterWidget';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';

const CATEGORIES = ['All', 'Layer 1', 'DeFi', 'AI & Data', 'Meme', 'Layer 2', 'Payment'];

export const CryptoPage: React.FC<{ onOpenQuickTrade: (symbol: string) => void }> = ({
  onOpenQuickTrade,
}) => {
  const { currency, formatStockPrice, formatAmount } = useCurrency();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [overview, setOverview] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      const data = await api.markets.getCryptoOverview();
      setOverview(data);
      setQuotes(data.quotes || []);
    } catch (err) {
      console.error('Failed to fetch crypto overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000); // 30s live refresh
    return () => clearInterval(interval);
  }, []);

  // Filter quotes by category and search
  const filteredQuotes = quotes.filter((q) => {
    const matchesCategory =
      activeCategory === 'All' ||
      (q.category && q.category.toLowerCase() === activeCategory.toLowerCase());
    const cleanSearch = search.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      q.symbol.toLowerCase().includes(cleanSearch) ||
      q.name.toLowerCase().includes(cleanSearch) ||
      (q.baseTicker && q.baseTicker.toLowerCase().includes(cleanSearch));
    return matchesCategory && matchesSearch;
  });

  const globalMetrics = overview?.globalMetrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP 24/7 LIVE TICKER STRIP */}
      <div className="glass-panel-elevated rounded-2xl px-4 py-2.5 flex items-center justify-between overflow-x-auto gap-4 border border-brand-lavender/30 no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            24/7 Live Crypto Feeds
          </span>
        </div>

        <div className="flex items-center gap-6 divide-x divide-slate-100 text-xs font-mono shrink-0">
          {quotes.slice(0, 5).map((coin) => {
            const isUp = coin.change >= 0;
            return (
              <Link
                key={coin.symbol}
                to={`/markets/${coin.symbol}`}
                className="pl-6 first:pl-0 flex items-center gap-2 hover:text-brand-primary transition-colors group"
              >
                <span className="text-sm">{coin.icon || '🪙'}</span>
                <span className="font-bold text-slate-800 group-hover:text-brand-primary">{coin.baseTicker || coin.symbol}</span>
                <span className="font-extrabold text-slate-900">
                  {formatStockPrice(coin.price, coin.symbol, coin.currency)}
                </span>
                <span className={`text-[11px] font-bold flex items-center ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isUp ? '+' : ''}{coin.changePercent.toFixed(2)}%
                </span>
              </Link>
            );
          })}
        </div>

        <button
          onClick={fetchCryptoData}
          title="Refresh 24/7 Live Rates"
          className="shrink-0 p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2. HERO / MARKET OVERVIEW BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-brand-glow/20 to-brand-lavender/30 border border-brand-lavender/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-700 text-xs font-extrabold flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              Decentralized Global Assets
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              Real Direct Data Stream
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cryptocurrency Markets
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Real-time live prices, market sentiment, decentralized finance tokens, and verified 24/7 liquidity metrics with multi-currency USD ($) and INR (₹) conversion.
          </p>
        </div>

        {/* Global Market Sentiment Meter */}
        <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 border border-white/80 min-w-[280px] space-y-3 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-primary" />
              Crypto Market Sentiment
            </span>
            <span
              className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                (globalMetrics?.sentimentScore || 50) >= 60
                  ? 'bg-emerald-100 text-emerald-800'
                  : (globalMetrics?.sentimentScore || 50) <= 40
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {globalMetrics?.sentimentLabel || 'Neutral'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400 font-mono">Score</span>
              <span className="font-mono text-slate-900 text-sm">
                {globalMetrics?.sentimentScore ?? 65} / 100
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${globalMetrics?.sentimentScore ?? 65}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>Extreme Fear</span>
            <span>Neutral</span>
            <span>Extreme Greed</span>
          </div>
        </div>
      </div>

      {/* 3. KEY METRICS STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bitcoin Card */}
        <div className="glass-panel rounded-3xl p-5 border border-slate-100/80 hover:shadow-elevated transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 font-extrabold text-xl flex items-center justify-center border border-amber-200/60">
                ₿
              </div>
              <div>
                <h3 className="font-mono font-bold text-slate-900 text-sm">Bitcoin</h3>
                <span className="text-[11px] text-slate-400 font-mono">BTC-USD</span>
              </div>
            </div>
            <button
              onClick={() => onOpenQuickTrade('BTC-USD')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 transition-all"
              title="Trade Bitcoin"
            >
              <Zap className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <div className="font-mono font-extrabold text-2xl text-slate-900">
                {formatStockPrice(globalMetrics?.btcPrice || 0, 'BTC-USD', 'USD')}
              </div>
              <span className="text-[10px] text-slate-400">24h Benchmark</span>
            </div>
            <div
              className={`text-xs font-bold flex items-center gap-0.5 ${
                (globalMetrics?.btcChange || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {(globalMetrics?.btcChange || 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{(globalMetrics?.btcChange || 0) >= 0 ? '+' : ''}{(globalMetrics?.btcChange || 0).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Ethereum Card */}
        <div className="glass-panel rounded-3xl p-5 border border-slate-100/80 hover:shadow-elevated transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-xl flex items-center justify-center border border-indigo-200/60">
                Ξ
              </div>
              <div>
                <h3 className="font-mono font-bold text-slate-900 text-sm">Ethereum</h3>
                <span className="text-[11px] text-slate-400 font-mono">ETH-USD</span>
              </div>
            </div>
            <button
              onClick={() => onOpenQuickTrade('ETH-USD')}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 transition-all"
              title="Trade Ethereum"
            >
              <Zap className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <div className="font-mono font-extrabold text-2xl text-slate-900">
                {formatStockPrice(globalMetrics?.ethPrice || 0, 'ETH-USD', 'USD')}
              </div>
              <span className="text-[10px] text-slate-400">Smart Contracts</span>
            </div>
            <div
              className={`text-xs font-bold flex items-center gap-0.5 ${
                (globalMetrics?.ethChange || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {(globalMetrics?.ethChange || 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{(globalMetrics?.ethChange || 0) >= 0 ? '+' : ''}{(globalMetrics?.ethChange || 0).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Solana Card */}
        <div className="glass-panel rounded-3xl p-5 border border-slate-100/80 hover:shadow-elevated transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 font-extrabold text-xl flex items-center justify-center border border-teal-200/60">
                ◎
              </div>
              <div>
                <h3 className="font-mono font-bold text-slate-900 text-sm">Solana</h3>
                <span className="text-[11px] text-slate-400 font-mono">SOL-USD</span>
              </div>
            </div>
            <button
              onClick={() => onOpenQuickTrade('SOL-USD')}
              className="p-2 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 transition-all"
              title="Trade Solana"
            >
              <Zap className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <div className="font-mono font-extrabold text-2xl text-slate-900">
                {formatStockPrice(globalMetrics?.solPrice || 0, 'SOL-USD', 'USD')}
              </div>
              <span className="text-[10px] text-slate-400">High Throughput L1</span>
            </div>
            <div
              className={`text-xs font-bold flex items-center gap-0.5 ${
                (globalMetrics?.solChange || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {(globalMetrics?.solChange || 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{(globalMetrics?.solChange || 0) >= 0 ? '+' : ''}{(globalMetrics?.solChange || 0).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* 24h Trading Volume Card */}
        <div className="glass-panel rounded-3xl p-5 border border-slate-100/80 hover:shadow-elevated transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-glow text-brand-deep font-extrabold text-xl flex items-center justify-center border border-brand-lavender/60">
                <BarChart3 className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-slate-900 text-sm">24h Tracked Vol</h3>
                <span className="text-[11px] text-slate-400">Total Market Flow</span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              USD / INR
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              <div className="font-mono font-extrabold text-2xl text-slate-900">
                {formatAmount(globalMetrics?.totalVolumeUSD || 0, { compact: true })}
              </div>
              <span className="text-[10px] text-slate-400">
                Forex: 1 USD = ₹{(globalMetrics?.usdInrRate || 84.5).toFixed(2)}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-500">
              {globalMetrics?.totalTracked || quotes.length} Coins
            </div>
          </div>
        </div>
      </div>

      {/* 4. TOP GAINERS & LOSERS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Gainers */}
        <div className="glass-panel rounded-3xl p-5 border border-emerald-100/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-600" />
              Top 24h Gainers
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Real-time Movement</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(overview?.topGainers || quotes.slice(0, 4)).map((coin: any) => (
              <Link
                key={coin.symbol}
                to={`/markets/${coin.symbol}`}
                className="p-3 rounded-2xl bg-white/70 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-emerald-700">
                    {coin.baseTicker || coin.symbol}
                  </span>
                  <span className="text-xs">{coin.icon || '🪙'}</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-800">
                  {formatStockPrice(coin.price, coin.symbol, coin.currency)}
                </div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{coin.changePercent.toFixed(2)}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="glass-panel rounded-3xl p-5 border border-rose-100/60 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              Top 24h Decliners
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Discount Opportunities</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(overview?.topLosers || quotes.slice(-4)).map((coin: any) => (
              <Link
                key={coin.symbol}
                to={`/markets/${coin.symbol}`}
                className="p-3 rounded-2xl bg-white/70 hover:bg-rose-50/50 border border-slate-100 hover:border-rose-200 transition-all group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-rose-700">
                    {coin.baseTicker || coin.symbol}
                  </span>
                  <span className="text-xs">{coin.icon || '🪙'}</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-800">
                  {formatStockPrice(coin.price, coin.symbol, coin.currency)}
                </div>
                <div className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  <span>{coin.changePercent.toFixed(2)}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 5. SEARCH & CATEGORY FILTER BAR */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar & View Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter coin or symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-glow outline-none text-xs text-slate-900 bg-white"
              />
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
                title="Grid Cards View"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 6. CRYPTO ASSET LIST / TABLE */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Price ({currency})</th>
                  <th className="py-3 px-4">24h Change</th>
                  <th className="py-3 px-4 hidden md:table-cell">24h High / Low</th>
                  <th className="py-3 px-4 hidden lg:table-cell">24h Volume</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredQuotes.map((coin) => {
                  const isUp = coin.change >= 0;
                  return (
                    <tr
                      key={coin.symbol}
                      className="hover:bg-brand-glow/20 transition-colors group"
                    >
                      {/* Symbol & Name */}
                      <td className="py-3.5 px-4">
                        <Link to={`/markets/${coin.symbol}`} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-slate-100 group-hover:bg-white text-base flex items-center justify-center border border-slate-200/60 shadow-xs">
                            {coin.icon || '🪙'}
                          </div>
                          <div>
                            <div className="font-mono font-bold text-slate-900 group-hover:text-brand-primary flex items-center gap-1.5">
                              <span>{coin.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono uppercase">
                                {coin.baseTicker || coin.symbol}
                              </span>
                            </div>
                            <FreshnessBadge freshness={coin.freshness} />
                          </div>
                        </Link>
                      </td>

                      {/* Live Price */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                        {formatStockPrice(coin.price, coin.symbol, coin.currency)}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3.5 px-4">
                        <div
                          className={`font-mono font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs ${
                            isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>{isUp ? '+' : ''}{coin.changePercent.toFixed(2)}%</span>
                        </div>
                      </td>

                      {/* 24h High / Low */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 font-mono text-[11px]">
                        <div>H: {formatStockPrice(coin.dayHigh || coin.price, coin.symbol, coin.currency)}</div>
                        <div className="text-slate-400">L: {formatStockPrice(coin.dayLow || coin.price, coin.symbol, coin.currency)}</div>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-slate-600 font-mono text-xs">
                        {coin.volume ? coin.volume.toLocaleString() : '—'}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 hidden sm:table-cell">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {coin.category || 'Crypto'}
                        </span>
                      </td>

                      {/* Quick Trade & Inspect */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenQuickTrade(coin.symbol)}
                            className="px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-deep text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                            title={`Trade ${coin.name}`}
                          >
                            <Zap className="w-3 h-3 fill-current" />
                            <span>Trade</span>
                          </button>
                          <Link
                            to={`/markets/${coin.symbol}`}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-brand-glow text-slate-600 hover:text-brand-deep transition-colors"
                            title="Detailed Chart & Sentiment"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredQuotes.map((coin) => {
              const isUp = coin.change >= 0;
              return (
                <div
                  key={coin.symbol}
                  className="glass-panel rounded-3xl p-5 hover:shadow-elevated transition-all flex flex-col justify-between space-y-4 group border border-slate-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-xl flex items-center justify-center border border-slate-200/60">
                        {coin.icon || '🪙'}
                      </div>
                      <div>
                        <Link
                          to={`/markets/${coin.symbol}`}
                          className="font-mono font-bold text-base text-slate-900 group-hover:text-brand-primary transition-colors block"
                        >
                          {coin.name}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono">
                          {coin.baseTicker || coin.symbol}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenQuickTrade(coin.symbol)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600 transition-colors"
                      title={`Trade ${coin.name}`}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <span className="font-mono font-extrabold text-2xl text-slate-900 block">
                        {formatStockPrice(coin.price, coin.symbol, coin.currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Vol: {coin.volume ? coin.volume.toLocaleString() : '—'}
                      </span>
                    </div>

                    <div className={`text-xs font-bold text-right ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <div className="flex items-center justify-end gap-0.5">
                        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{isUp ? '+' : ''}{coin.changePercent.toFixed(2)}%</span>
                      </div>
                      <span className="text-[10px] block opacity-80">
                        {coin.category}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/markets/${coin.symbol}`}
                    className="w-full py-2 rounded-xl bg-slate-50 hover:bg-brand-glow text-center text-xs font-bold text-brand-deep transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Analyze & Chart</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Currency Converter & Rupee Calculator Widget */}
      <CurrencyConverterWidget />

      {/* 7. REAL 24/7 CRYPTO NEWS WIRE */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-primary" />
              Live Crypto News & Decentralized Wire
            </h3>
            <p className="text-xs text-slate-500">
              Verified financial news headlines, regulatory developments, and institutional sentiment.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-deep bg-brand-glow px-3 py-1 rounded-full border border-brand-lavender/40 self-start sm:self-auto">
            Grounded Sentiment Feeds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(overview?.news || []).map((item: any) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white/80 border border-slate-100 hover:border-brand-lavender hover:shadow-soft transition-all space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-2">
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
                    className="hover:text-brand-primary flex items-start gap-1.5 group"
                  >
                    <span>{item.headline}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0 mt-0.5" />
                  </a>
                </h4>
              </div>

              {item.relatedSymbols?.length > 0 && (
                <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                  {item.relatedSymbols.slice(0, 3).map((sym: string) => (
                    <Link
                      key={sym}
                      to={`/markets/${sym}`}
                      className="px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-brand-glow text-[10px] font-mono font-bold text-slate-600 transition-colors"
                    >
                      {sym}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
