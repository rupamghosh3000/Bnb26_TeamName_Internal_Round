import React, { useState, useEffect } from 'react';
import { Bell, Plus, X, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

export const AlertsPage: React.FC = () => {
  const { currency, formatAmount, formatStockPrice } = useCurrency();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [symbol, setSymbol] = useState('AAPL');
  const [type, setType] = useState<'STOP_LOSS' | 'TARGET' | 'PRICE'>('TARGET');
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [saving, setSaving] = useState(false);

  const fetchAlerts = async () => {
    try {
      const data = await api.alerts.getAll();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !targetPrice) return;
    setSaving(true);

    try {
      await api.alerts.create({
        symbol: symbol.toUpperCase(),
        type,
        targetPrice: parseFloat(targetPrice),
        direction,
      });

      setIsModalOpen(false);
      setTargetPrice('');
      fetchAlerts();
    } catch (err: any) {
      alert(err.message || 'Failed to create alert.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAlert = async (id: string) => {
    try {
      await api.alerts.cancel(id);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Price & Stop-Loss Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Server-side background evaluation monitoring real quotes for stop-loss and profit target triggers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white text-xs font-bold shadow-md shadow-brand-primary/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>New Alert Trigger</span>
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className="glass-panel rounded-3xl p-5 flex items-center justify-between border border-slate-100 space-y-1"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                    alert.status === 'TRIGGERED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : alert.type === 'STOP_LOSS'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-brand-glow text-brand-deep'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {alert.symbol}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {alert.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Target: <span className="font-mono font-bold text-slate-900">{formatStockPrice(alert.targetPrice, alert.symbol)}</span> ({alert.direction || 'ABOVE'})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    alert.status === 'TRIGGERED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : alert.status === 'ACTIVE'
                      ? 'bg-amber-50 text-amber-700 animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {alert.status}
                </span>
                {alert.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCancelAlert(alert._id)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                    title="Cancel Alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-20 text-center glass-panel rounded-3xl space-y-2">
            <Bell className="w-8 h-8 text-brand-soft mx-auto" />
            <p className="text-sm font-bold text-slate-900">No Active Price Alerts</p>
            <p className="text-xs text-slate-500">Set target price thresholds or stop-loss boundaries.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-lavender/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900">Create Alert</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono font-bold uppercase text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Alert Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none text-xs font-bold bg-white"
                >
                  <option value="TARGET">Profit Target (Price Reaches Level)</option>
                  <option value="STOP_LOSS">Stop Loss (Price Drops Below Level)</option>
                  <option value="PRICE">Custom Direction Trigger</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Trigger Price ({currency === 'INR' ? '₹ INR' : '$ USD'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 195.50"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-brand-primary outline-none font-mono font-bold text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-deep text-white font-bold text-xs shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Activate Alert Trigger</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
