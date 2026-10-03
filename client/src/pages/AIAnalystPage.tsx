import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  Info,
  CheckCircle2,
  TrendingUp,
  Shield,
  Layers,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { FormattedAIMessage } from '../components/ai/FormattedAIMessage';

export const AIAnalystPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'brief' | 'why' | 'portfolio'>('chat');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; data?: any }>>([
    {
      sender: 'ai',
      text: 'Welcome to the StockPulse AI Market Intelligence Suite. I query real application state (live quotes, open positions, risk metrics, and news) to deliver grounded, transparent explanations without hallucinations.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Market Brief state
  const [marketBrief, setMarketBrief] = useState<any>(null);

  // Why Move state
  const [whySymbol, setWhySymbol] = useState('AAPL');
  const [whyResult, setWhyResult] = useState<any>(null);
  const [loadingWhy, setLoadingWhy] = useState(false);

  // Portfolio Deep Dive state
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  useEffect(() => {
    api.ai.getMarketBrief().then(setMarketBrief).catch(() => {});
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || query;
    if (!textToSend.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    if (!customText) setQuery('');
    setLoading(true);

    try {
      const res = await api.ai.query(textToSend);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.answer, data: res }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `Failed to retrieve intelligence: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeWhy = async () => {
    if (!whySymbol.trim()) return;
    setLoadingWhy(true);
    try {
      const res = await api.ai.whyMove(whySymbol.toUpperCase());
      setWhyResult(res);
    } catch (err: any) {
      setWhyResult({ answer: `Unable to analyze: ${err.message}` });
    } finally {
      setLoadingWhy(false);
    }
  };

  const handleAnalyzePortfolio = async () => {
    setLoadingPortfolio(true);
    try {
      const res = await api.ai.analyzePortfolio();
      setPortfolioAnalysis(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Market Intelligence Suite
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Grounded reasoning over live quotes, news sentiment, portfolio risk, and historical backtests.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'chat', label: 'StockPulse Assistant' },
          { id: 'brief', label: 'AI Market Brief' },
          { id: 'why', label: 'Why Did It Move?' },
          { id: 'portfolio', label: 'Portfolio Analyst' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-brand-deep shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. CHAT ASSISTANT TAB */}
      {activeTab === 'chat' && (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-lavender/50 max-w-4xl mx-auto flex flex-col h-[650px]">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-brand-primary text-white font-medium rounded-tr-sm shadow-sm'
                      : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm shadow-soft'
                  }`}
                >
                  {m.sender === 'user' ? (
                    <p>{m.text}</p>
                  ) : (
                    <FormattedAIMessage content={m.text} />
                  )}

                  {/* Grounded Facts */}
                  {m.data?.observations && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-deep block">
                        Observed Facts
                      </span>
                      {m.data.observations.map((obs: string, idx: number) => (
                        <div key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <span className="text-brand-soft font-bold">•</span>
                          <span>{obs}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Uncertainty */}
                  {m.data?.uncertainty && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-600 flex items-start gap-1">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>{m.data.uncertainty}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 text-xs text-slate-500 max-w-[50%]">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                <span>Executing grounded tool queries...</span>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
            {[
              'Can I buy 5 shares of NVDA?',
              'Compare Apple and Microsoft',
              'What is a P/E ratio?',
              'What are my current holdings?',
              'What is my portfolio risk?',
              'Why did TSLA move recently?',
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-primary text-slate-600 hover:text-brand-deep transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your portfolio, holdings, or live market assets..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none text-xs text-slate-900"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-3 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white disabled:bg-slate-200 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. AI MARKET BRIEF TAB */}
      {activeTab === 'brief' && (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-lavender/50 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Broad Market Brief</h3>
              <p className="text-xs text-slate-500">Live synthesis of macro session and mega-cap assets</p>
            </div>
          </div>

          {marketBrief ? (
            <div className="space-y-4">
              <div className="text-sm text-slate-800 leading-relaxed font-medium">
                <FormattedAIMessage content={marketBrief.answer} />
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Grounding Observations
                </span>
                {marketBrief.observations?.map((obs: string, i: number) => (
                  <div key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-brand-primary font-bold">•</span>
                    <span>{obs}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-600 p-3 rounded-2xl bg-brand-glow/40 border border-brand-lavender/50 flex items-start gap-2">
                <Info className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <span>{marketBrief.uncertainty}</span>
              </div>
            </div>
          ) : (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            </div>
          )}
        </div>
      )}

      {/* 3. WHY DID IT MOVE TAB */}
      {activeTab === 'why' && (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-lavender/50 max-w-4xl mx-auto">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Why Did This Security Move?</h3>
            <p className="text-xs text-slate-500">
              Cross-references price action, intraday volume, and recent headline reports
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={whySymbol}
              onChange={(e) => setWhySymbol(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL, NVDA, TSLA"
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono font-bold uppercase text-sm"
            />
            <button
              onClick={handleAnalyzeWhy}
              disabled={loadingWhy}
              className="px-6 py-2.5 rounded-2xl bg-brand-primary text-white font-bold text-xs flex items-center gap-2 hover:bg-brand-deep disabled:bg-slate-300"
            >
              {loadingWhy ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Analyze Movement</span>}
            </button>
          </div>

          {whyResult && (
            <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
              <div className="text-sm text-slate-800 leading-relaxed font-medium">
                <FormattedAIMessage content={whyResult.answer} />
              </div>

              {whyResult.observations && (
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Observed Facts
                  </span>
                  {whyResult.observations.map((obs: string, i: number) => (
                    <div key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              )}

              {whyResult.uncertainty && (
                <div className="text-xs text-slate-600 p-3 rounded-2xl bg-brand-glow/40 border border-brand-lavender/50 flex items-start gap-2">
                  <Info className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                  <span>{whyResult.uncertainty}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. PORTFOLIO DEEP DIVE TAB */}
      {activeTab === 'portfolio' && (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-lavender/50 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Portfolio AI Deep Dive</h3>
              <p className="text-xs text-slate-500">
                Evaluation of asset weights, cash buffer, returns, and concentration parameters
              </p>
            </div>
            <button
              onClick={handleAnalyzePortfolio}
              disabled={loadingPortfolio}
              className="px-5 py-2 rounded-2xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-deep disabled:bg-slate-300"
            >
              {loadingPortfolio ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Run Assessment</span>}
            </button>
          </div>

          {portfolioAnalysis ? (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-800 leading-relaxed font-medium">
                <FormattedAIMessage content={portfolioAnalysis.answer} />
              </div>

              {portfolioAnalysis.observations && (
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Grounded Metrics
                  </span>
                  {portfolioAnalysis.observations.map((obs: string, i: number) => (
                    <div key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-brand-primary font-bold">•</span>
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-slate-600 p-3 rounded-2xl bg-brand-glow/40 border border-brand-lavender/50 flex items-start gap-2">
                <Info className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <span>{portfolioAnalysis.uncertainty}</span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Click "Run Assessment" to generate a grounded analysis of your active paper portfolio.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
