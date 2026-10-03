import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Sparkles, Trash2, Calendar, Tag, Smile, X } from 'lucide-react';
import { api } from '../services/api';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [symbol, setSymbol] = useState('');
  const [tradeId, setTradeId] = useState('');
  const [thesis, setThesis] = useState('');
  const [strategyUsed, setStrategyUsed] = useState('Momentum Breakout');
  const [entryReason, setEntryReason] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [emotion, setEmotion] = useState<'CONFIDENT' | 'ANXIOUS' | 'NEUTRAL' | 'FOMO' | 'DISCIPLINED'>('DISCIPLINED');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchJournal = async () => {
    setLoading(true);
    try {
      const [entryList, tradeList] = await Promise.all([
        api.journal.getAll(),
        api.trades.getAll(20),
      ]);
      setEntries(entryList);
      setTrades(tradeList.trades || []);
    } catch (err) {
      console.error('Failed to load journal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, []);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !thesis.trim()) return;
    setSaving(true);

    try {
      await api.journal.create({
        symbol: symbol.toUpperCase(),
        tradeId: tradeId || undefined,
        thesis,
        strategyUsed,
        entryReason,
        exitReason,
        emotion,
        outcomeNotes,
      });

      setIsModalOpen(false);
      resetForm();
      fetchJournal();
    } catch (err) {
      console.error('Failed to create journal entry:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      await api.journal.delete(id);
      fetchJournal();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setSymbol('');
    setTradeId('');
    setThesis('');
    setStrategyUsed('Momentum Breakout');
    setEntryReason('');
    setExitReason('');
    setEmotion('DISCIPLINED');
    setOutcomeNotes('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Editorial Trade Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Systematic trade reflection: theses, execution discipline, emotions, and AI trade reviews.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white text-xs font-bold shadow-md shadow-brand-primary/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Reflection</span>
        </button>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-6">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={entry._id}
              className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-100 relative overflow-hidden"
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-glow text-brand-deep font-mono font-bold text-sm flex items-center justify-center">
                    {entry.symbol}
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-slate-900 text-lg">{entry.symbol}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(entry.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {entry.strategyUsed && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            {entry.strategyUsed}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      entry.emotion === 'DISCIPLINED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : entry.emotion === 'CONFIDENT'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : entry.emotion === 'FOMO'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {entry.emotion}
                  </span>
                  <button
                    onClick={() => handleDeleteEntry(entry._id)}
                    className="p-2 text-slate-300 hover:text-rose-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thesis Body */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Trading Thesis & Rationale
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-normal bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  {entry.thesis}
                </p>
              </div>

              {/* Entry & Exit notes */}
              {(entry.entryReason || entry.exitReason) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {entry.entryReason && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-500 block mb-0.5">Entry Criteria:</span>
                      <span className="text-slate-700">{entry.entryReason}</span>
                    </div>
                  )}
                  {entry.exitReason && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-500 block mb-0.5">Exit Strategy:</span>
                      <span className="text-slate-700">{entry.exitReason}</span>
                    </div>
                  )}
                </div>
              )}

              {/* AI Review Banner */}
              {entry.aiReview && (
                <div className="p-4 rounded-2xl bg-brand-glow/40 border border-brand-lavender/50 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-brand-deep">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Reflection Review</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{entry.aiReview}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-20 text-center glass-panel rounded-3xl space-y-3">
            <BookOpen className="w-8 h-8 text-brand-soft mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Your Trade Journal is Clean</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Document your trade theses, emotional states, and execution disciplines to cultivate
              systematic market habits.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand-primary text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Entry</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-brand-lavender/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900">New Journal Reflection</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g. NVDA"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono font-bold text-sm uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Emotion / Mindset
                  </label>
                  <select
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none text-xs font-bold bg-white"
                  >
                    <option value="DISCIPLINED">Disciplined</option>
                    <option value="CONFIDENT">Confident</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="ANXIOUS">Anxious</option>
                    <option value="FOMO">FOMO / Impulsive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Strategy Pattern
                </label>
                <input
                  type="text"
                  value={strategyUsed}
                  onChange={(e) => setStrategyUsed(e.target.value)}
                  placeholder="e.g. 50/200 MA Cross, Earnings Rebound, Trend Breakout"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Thesis (Why enter? What catalyst?)
                </label>
                <textarea
                  rows={3}
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  placeholder="Explain why this trade was taken and what market evidence supports it..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Planned Entry Criteria
                  </label>
                  <input
                    type="text"
                    value={entryReason}
                    onChange={(e) => setEntryReason(e.target.value)}
                    placeholder="Breakout above resistance"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Planned Exit Criteria
                  </label>
                  <input
                    type="text"
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value)}
                    placeholder="Trailing stop or +8% target"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white font-bold text-xs shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Save Reflection to Journal</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
