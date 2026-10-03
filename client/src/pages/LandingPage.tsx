import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Zap,
  Bot,
  BookOpen,
  PieChart,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CanvasContainer } from '../components/3d/CanvasContainer';
import { MarketCore } from '../components/3d/MarketCore';
import { ParticleField } from '../components/3d/ParticleField';
import { SentimentOrb } from '../components/3d/SentimentOrb';
import { PortfolioRing } from '../components/3d/PortfolioRing';
import { StrategyCube } from '../components/3d/StrategyCube';
import { AIOrb } from '../components/3d/AIOrb';
import { api } from '../services/api';

export const LandingPage: React.FC = () => {
  const [universe, setUniverse] = useState<any[]>([]);

  useEffect(() => {
    api.markets
      .getOverview()
      .then((data) => setUniverse(data.quotes || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-8">
        {/* Background 3D Scene */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-90 overflow-hidden">
          <CanvasContainer cameraPosition={[0, 0, 6]}>
            <MarketCore />
            <ParticleField count={100} />
          </CanvasContainer>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-brand-lavender/80 shadow-soft backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-deep">
              REAL MARKET INTELLIGENCE + ZERO-RISK SIMULATION
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            Trade ideas. <br />
            <span className="text-gradient">Understand markets.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            StockPulse bridges live financial market data with an institutional-grade paper trading
            engine, deterministic strategy backtesting, and grounded AI intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/auth?mode=register"
              className="w-full sm:w-auto px-8 py-4 rounded-3xl bg-brand-primary hover:bg-brand-deep text-white font-extrabold text-base shadow-xl shadow-brand-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Start Paper Trading</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/markets"
              className="w-full sm:w-auto px-8 py-4 rounded-3xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-soft transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5 text-brand-primary" />
              <span>Explore Live Markets</span>
            </Link>
          </div>

          {/* Virtual Fund Guarantee Badge */}
          <div className="pt-4 text-xs font-semibold text-slate-500 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> $100,000 Starting Virtual Capital
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real Market Quotes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Fabrication
            </span>
          </div>
        </div>
      </section>

      {/* 2. LIVE MARKET UNIVERSE BANNER */}
      {universe.length > 0 && (
        <section className="py-6 border-y border-brand-lavender/40 bg-white/40 backdrop-blur-md overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
            </span>
            {universe.map((q) => (
              <Link
                key={q.symbol}
                to={`/markets/${q.symbol}`}
                className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-brand-primary/50 transition-all flex-shrink-0 group"
              >
                <span className="font-mono font-bold text-slate-900 group-hover:text-brand-primary">
                  {q.symbol}
                </span>
                <span className="font-mono font-medium text-slate-700">${q.price.toFixed(2)}</span>
                <span
                  className={`text-xs font-bold ${
                    q.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {q.change >= 0 ? '+' : ''}
                  {q.changePercent.toFixed(2)}%
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. PRODUCT CORE LOOP STORYTELLING */}
      <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-24">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary">
            THE STOCKPULSE ADVANTAGE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            An intelligent space for serious market learners.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Engineered from ground-up to eliminate simulated gimmicks. Every price, chart bar, and
            news item reflects verified financial data.
          </p>
        </div>

        {/* Feature 1: Paper Trading Engine */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-brand-glow text-brand-primary flex items-center justify-center">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Authoritative Paper Trading Engine
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Execute Market Buys, Market Sells, Limit Buys, and Limit Sells against live quotes.
              Positions calculate weighted average entry prices, while the double-entry virtual cash
              ledger protects portfolio mathematical integrity.
            </p>
            <ul className="space-y-2 text-sm text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" /> $100,000 Starting Virtual Capital
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Uncompromising Server-Side Validation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Realized and Unrealized P&L Attribution
              </li>
            </ul>
          </div>
          <div className="h-80 glass-panel-elevated rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden shadow-elevated">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                    BUY
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">NVDA — NVIDIA Corp</span>
                    <span className="text-xs text-slate-500">Filled at Market Price</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">+$3,240.50</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                    SELL
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">AAPL — Apple Inc</span>
                    <span className="text-xs text-slate-500">Realized Profit Closed</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600 text-sm">+$1,120.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: 3D Sentiment & Market Intelligence */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 h-80 glass-panel rounded-3xl relative overflow-hidden flex items-center justify-center">
            <CanvasContainer cameraPosition={[0, 0, 4]}>
              <SentimentOrb sentiment="BULLISH" />
            </CanvasContainer>
          </div>
          <div className="order-1 md:order-2 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-brand-glow text-brand-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Live News & Sentiment Analytics
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Monitor real financial wire reports and algorithmically classified sentiment.
              StockPulse highlights correlations without making unfounded causal claims.
            </p>
            <div className="p-4 rounded-2xl bg-brand-glow/40 border border-brand-lavender text-xs text-brand-deep">
              <span className="font-bold block mb-1">Ethical Data Integrity Principle:</span>
              We present observable relationship patterns between news frequency and price movement,
              distinguishing empirical observation from speculation.
            </div>
          </div>
        </div>

        {/* Feature 3: Strategy Lab & Backtesting */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-brand-glow text-brand-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Deterministic Strategy Lab
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Build rules using Moving Average Crossover, RSI Oversold/Overbought, Momentum, and
              20-day Breakout. Simulate exact executions against historical OHLCV data.
            </p>
            <ul className="space-y-2 text-sm text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Equity Curve vs Buy & Hold Benchmark
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Win Rate, Maximum Drawdown & Profit Factor
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" /> AI Strategy Behavior Analysis
              </li>
            </ul>
          </div>
          <div className="h-80 glass-panel rounded-3xl relative overflow-hidden flex items-center justify-center">
            <CanvasContainer cameraPosition={[0, 0, 4]}>
              <StrategyCube />
            </CanvasContainer>
          </div>
        </div>

        {/* Feature 4: Risk Analytics & AI Intelligence */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 h-80 glass-panel rounded-3xl relative overflow-hidden flex items-center justify-center">
            <CanvasContainer cameraPosition={[0, 0, 4]}>
              <PortfolioRing />
            </CanvasContainer>
          </div>
          <div className="order-1 md:order-2 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-brand-glow text-brand-primary flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Portfolio Risk & Stress Testing
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Calculate annualized portfolio volatility, Herfindahl-Hirschman concentration (HHI),
              and simulated portfolio stress testing under -15%, -10%, and +10% market shocks.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-20 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-500 text-sm">Transparency and platform operation principles</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Does StockPulse execute real money trades?',
              a: 'No. StockPulse is strictly an educational paper trading and market intelligence platform. All trading accounts use virtual cash with zero financial liability.',
            },
            {
              q: 'Where do market prices and news originate?',
              a: 'All market quotes, historical OHLCV chart bars, and financial news items originate directly from live external market data providers (including Yahoo Finance stream). We never fabricate prices or mock returns.',
            },
            {
              q: 'How does the AI Analyst operate?',
              a: 'The StockPulse AI Analyst uses internal data tools to query actual application state (live quotes, positions, risk metrics, and news). It will never hallucinate fabricated financial data.',
            },
          ].map((faq, i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 space-y-2 border border-slate-100">
              <h4 className="text-base font-bold text-slate-900">{faq.q}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION & FOOTER */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-transparent to-brand-glow/60 border-t border-brand-lavender/40">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-extrabold text-slate-900">Ready to master the markets?</h2>
          <p className="text-slate-600 text-base">
            Start with $100,000 in virtual funds. Analyze live assets, test your strategies, and
            journal your decisions.
          </p>
          <Link
            to="/auth?mode=register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-3xl bg-brand-primary hover:bg-brand-deep text-white font-extrabold text-base shadow-xl shadow-brand-primary/30 transition-all hover:scale-105"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <footer className="mt-20 pt-8 border-t border-slate-200/60 max-w-7xl mx-auto text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} StockPulse. Educational Market Intelligence Platform.</div>
          <div className="text-[11px] text-slate-600 max-w-xl text-center sm:text-right">
            Disclaimer: StockPulse does not provide investment advice or brokerage services. Past
            backtest performance does not guarantee future results.
          </div>
        </footer>
      </section>
    </div>
  );
};
