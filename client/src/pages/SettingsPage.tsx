import React from 'react';
import { User, Shield, Info, Database, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export const SettingsPage: React.FC = () => {
  const { user, account } = useAuth();
  const { formatAmount } = useCurrency();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Account Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Account credentials, paper balance parameters, and regulatory boundary declarations.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-glow text-brand-deep flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name || 'Trader'}</h3>
            <span className="text-xs text-slate-500">{user?.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50">
            <span className="text-slate-400 block mb-1">Account Role</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {user?.role || 'PAPER_TRADER'}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50">
            <span className="text-slate-400 block mb-1">Starting Allocation</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatAmount(account?.startingCash || 100000)}
            </span>
          </div>
        </div>
      </div>

      {/* Platform Production Boundary & Disclaimers */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-brand-lavender/40">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-primary" />
          <h3 className="text-base font-bold text-slate-900">
            Regulatory Boundary & Education Policy
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Paper Trading Only:</strong> StockPulse is an educational simulation environment.
              All funds, balances, and orders represent virtual paper executions. The platform does NOT execute real-money orders and is not a registered broker-dealer.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Verified Data Standard:</strong> All market quotes and financial wire reports reflect verified data sourced from external market feeds. We do not generate fake random numbers.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p>
              <strong>AI Grounding:</strong> The AI Analyst reasons strictly from actual portfolio metrics, historical backtests, and news sentiment classifications. Correlation is never represented as causal investment advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
