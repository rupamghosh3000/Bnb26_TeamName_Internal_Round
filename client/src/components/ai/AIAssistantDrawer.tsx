import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, Loader2, Info, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AIAssistantDrawer: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; data?: any }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your StockPulse Market Intelligence Assistant. I query real application data to analyze market movements, risk parameters, and portfolio allocations.',
    },
  ]);

  if (!user) return null;

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || query;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    if (!messageText) setQuery('');
    setLoading(true);

    try {
      const response = await api.ai.query(userMsg);
      setHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.answer,
          data: response,
        },
      ]);
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Analysis unavailable: ${err.message || 'Unable to connect with market intelligence.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Summarize broad market condition',
    'What is my portfolio valuation & risk?',
    'Why did AAPL move recently?',
    'What was the outcome of my last trade?',
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-brand-deep to-brand-primary text-white font-bold text-xs shadow-xl shadow-brand-primary/30 transition-all hover:scale-105 active:scale-95 ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <Sparkles className="w-4 h-4 fill-current animate-pulse text-brand-lavender" />
        <span>Ask StockPulse AI</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-brand-lavender/50 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">StockPulse Analyst</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Grounded in Live Data
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {history.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-primary text-white font-medium rounded-tr-sm shadow-sm'
                        : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm shadow-soft'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Grounded Observations */}
                    {msg.data?.observations && msg.data.observations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-deep block">
                          Observed Facts
                        </span>
                        {msg.data.observations.map((obs: string, i: number) => (
                          <div key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                            <span className="text-brand-soft mt-0.5">•</span>
                            <span>{obs}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Uncertainty Notice */}
                    {msg.data?.uncertainty && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-600 flex items-start gap-1">
                        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>{msg.data.uncertainty}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 max-w-[70%]">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                  <span>Retrieving live context...</span>
                </div>
              )}
            </div>

            {/* Prompt Suggestions */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Suggested Questions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-brand-primary text-slate-600 hover:text-brand-deep transition-all flex items-center gap-1"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-100 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about your portfolio or markets..."
                  className="flex-1 px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-xs text-slate-900"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="p-2.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white disabled:bg-slate-200 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
