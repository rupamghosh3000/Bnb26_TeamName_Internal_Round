import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Info,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api';

export const StrategyLabPage: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [strategyType, setStrategyType] = useState<'MA_CROSSOVER' | 'RSI' | 'MOMENTUM' | 'BREAKOUT'>('MA_CROSSOVER');
  const [range, setRange] = useState('1y');
  const [initialCapital, setInitialCapital] = useState(100000);

  // Strategy parameters
  const [fastMA, setFastMA] = useState(20);
  const [slowMA, setSlowMA] = useState(50);
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiOversold, setRsiOversold] = useState(30);
  const [rsiOverbought, setRsiOverbought] = useState(70);
  const [lookback, setLookback] = useState(20);

  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-run initial backtest on load
  useEffect(() => {
    handleRunBacktest();
  }, []);

  const handleRunBacktest = async () => {
    setLoading(true);
    setError(null);
    setAiExplanation(null);

    let params: Record<string, any> = {};
    if (strategyType === 'MA_CROSSOVER') {
      params = { fastPeriod: fastMA, slowPeriod: slowMA };
    } else if (strategyType === 'RSI') {
      params = { period: rsiPeriod, oversold: rsiOversold, overbought: rsiOverbought };
    } else {
      params = { lookback };
    }

    try {
      const result = await api.strategies.runBacktest({
        symbol: symbol.toUpperCase(),
        strategyType,
        params,
        range,
        initialCapital,
      });
      setBacktestResult(result);
    } catch (err: any) {
      setError(err.message || 'Backtest failed. Verify symbol and historical coverage.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalyze = async () => {
    if (!backtestResult?._id) return;
    setAnalyzingAi(true);
    try {
      const res = await api.ai.analyzeStrategy(backtestResult._id);
      setAiExplanation(res);
    } catch (err) {
      console.error('Failed to analyze strategy:', err);
    } finally {
      setAnalyzingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Strategy Lab & Backtesting
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Simulate rule-based strategies against real historical OHLCV data with benchmark comparisons.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* STRATEGY BUILDER CONTROLS (1 col) */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-lavender/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Configure Strategy</h3>
            <p className="text-xs text-slate-500">Select asset, rule model, and parameters</p>
          </div>

          <div className="space-y-4">
            {/* Symbol */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Target Asset
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono font-bold text-slate-900 uppercase"
                placeholder="AAPL"
              />
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Strategy Template
              </label>
              <select
                value={strategyType}
                onChange={(e) => setStrategyType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none text-xs font-bold text-slate-800 bg-white"
              >
                <option value="MA_CROSSOVER">Moving Average Crossover (Fast/Slow)</option>
                <option value="RSI">RSI Mean Reversion (Thresholds)</option>
                <option value="MOMENTUM">Momentum Trend Follower</option>
                <option value="BREAKOUT">20-Day Donchian Breakout</option>
              </select>
            </div>

            {/* Specific Template Parameters */}
            {strategyType === 'MA_CROSSOVER' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Fast MA Period</label>
                  <input
                    type="number"
                    value={fastMA}
                    onChange={(e) => setFastMA(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Slow MA Period</label>
                  <input
                    type="number"
                    value={slowMA}
                    onChange={(e) => setSlowMA(parseInt(e.target.value) || 50)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {strategyType === 'RSI' && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Period</label>
                  <input
                    type="number"
                    value={rsiPeriod}
                    onChange={(e) => setRsiPeriod(parseInt(e.target.value) || 14)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Oversold</label>
                  <input
                    type="number"
                    value={rsiOversold}
                    onChange={(e) => setRsiOversold(parseInt(e.target.value) || 30)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Overbought</label>
                  <input
                    type="number"
                    value={rsiOverbought}
                    onChange={(e) => setRsiOverbought(parseInt(e.target.value) || 70)}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {(strategyType === 'MOMENTUM' || strategyType === 'BREAKOUT') && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Lookback Window (Days)</label>
                <input
                  type="number"
                  value={lookback}
                  onChange={(e) => setLookback(parseInt(e.target.value) || 20)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>
            )}

            {/* Historical Range */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Historical Testing Range
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['6mo', '1y', '2y'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      range === r
                        ? 'border-brand-primary bg-brand-glow text-brand-deep'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={handleRunBacktest}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white font-extrabold text-sm shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Backtest</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RESULTS & EQUITY CURVE (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {backtestResult && (
            <>
              {/* Top 4 Performance Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-panel rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Strategy Return
                  </span>
                  <span
                    className={`text-xl font-mono font-extrabold block mt-1 ${
                      backtestResult.totalReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {backtestResult.totalReturn >= 0 ? '+' : ''}{backtestResult.totalReturn}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    B&H: {backtestResult.benchmarkReturn >= 0 ? '+' : ''}{backtestResult.benchmarkReturn}%
                  </span>
                </div>

                <div className="glass-panel rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Win Rate
                  </span>
                  <span className="text-xl font-mono font-extrabold text-slate-900 block mt-1">
                    {backtestResult.winRate}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {backtestResult.tradeCount} total trades
                  </span>
                </div>

                <div className="glass-panel rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Max Drawdown
                  </span>
                  <span className="text-xl font-mono font-extrabold text-rose-600 block mt-1">
                    {backtestResult.maxDrawdown}%
                  </span>
                  <span className="text-[10px] text-slate-400">Peak-to-trough</span>
                </div>

                <div className="glass-panel rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Profit Factor
                  </span>
                  <span className="text-xl font-mono font-extrabold text-brand-deep block mt-1">
                    {backtestResult.profitFactor}
                  </span>
                  <span className="text-[10px] text-slate-400">Gross W / Gross L</span>
                </div>
              </div>

              {/* Equity Curve Comparison Chart */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Strategy Equity Curve vs Buy & Hold Benchmark
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tested over {backtestResult.startDate} to {backtestResult.endDate}
                    </p>
                  </div>
                  <button
                    onClick={handleAiAnalyze}
                    disabled={analyzingAi}
                    className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-glow text-brand-deep text-xs font-bold hover:bg-brand-lavender/50 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{analyzingAi ? 'Analyzing...' : 'AI Strategy Explanation'}</span>
                  </button>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={backtestResult.equityCurve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-2xl text-xs shadow-xl space-y-1">
                                <div className="text-slate-400">{d.date}</div>
                                <div className="text-brand-soft font-mono font-bold">
                                  Strategy: ${d.strategyEquity.toLocaleString()}
                                </div>
                                <div className="text-emerald-400 font-mono font-bold">
                                  Buy & Hold: ${d.benchmarkEquity.toLocaleString()}
                                </div>
                                <div className="text-rose-400 font-mono text-[10px]">
                                  Drawdown: {d.drawdown}%
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="strategyEquity"
                        name="Strategy Equity"
                        stroke="#6736C7"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmarkEquity"
                        name="Buy & Hold Benchmark"
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* AI Explanation Banner */}
                {aiExplanation && (
                  <div className="mt-4 p-4 rounded-2xl bg-brand-glow/30 border border-brand-lavender/50 space-y-2 text-xs text-slate-800 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 font-bold text-brand-deep">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Strategy Behavior Analysis</span>
                    </div>
                    <p className="leading-relaxed">{aiExplanation.answer}</p>
                    <div className="text-[10px] text-slate-600 pt-1 border-t border-brand-lavender/40">
                      {aiExplanation.uncertainty}
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-600">Disclaimer:</span> Past backtest performance does not guarantee future results. Frictionless fills assumed.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
