import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Info, TrendingDown, RefreshCw, Sliders } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

export const RiskPage: React.FC = () => {
  const { formatAmount } = useCurrency();
  const [risk, setRisk] = useState<any>(null);
  const [customShock, setCustomShock] = useState<number>(-10);
  const [customResult, setCustomResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRisk = async () => {
    setLoading(true);
    try {
      const data = await api.portfolio.getRisk();
      setRisk(data);
      runCustomTest(-10);
    } catch (err) {
      console.error('Failed to load risk analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const runCustomTest = async (shock: number) => {
    try {
      const res = await api.portfolio.stressTest(shock);
      setCustomResult(res);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchRisk();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Portfolio Risk Analytics & Stress Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Institutional risk measures: volatility, drawdown, HHI concentration, and hypothetical shock modeling.
          </p>
        </div>

        <button
          onClick={fetchRisk}
          className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-soft"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Recalculate Risk</span>
        </button>
      </div>

      {/* Top Risk Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Annualized Volatility"
          value={`${risk?.annualizedVolatility || 0}%`}
          changeText="Weighted asset standard dev"
          icon={<ShieldAlert className="w-5 h-5 text-brand-primary" />}
        />
        <StatCard
          title="Maximum Drawdown"
          value={`${risk?.maxDrawdown || 0}%`}
          changeText="Peak-to-trough decline"
          icon={<TrendingDown className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="Concentration Rating"
          value={risk?.concentrationRisk || 'LOW'}
          changeText={`HHI: ${risk?.concentrationRatio || 0} / 10,000`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Cash Cushion"
          value={`${risk?.cashExposurePercent?.toFixed(1) || 100}%`}
          changeText={`Equity: ${risk?.equityExposurePercent?.toFixed(1) || 0}%`}
          icon={<Info className="w-5 h-5 text-slate-400" />}
        />
      </div>

      {/* Stress Testing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preset Stress Test Scenarios (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hypothetical Stress Testing Scenarios</h3>
            <p className="text-xs text-slate-500">
              Evaluates portfolio equity sensitivity under broad market shocks (simulated instantaneous shift)
            </p>
          </div>

          <div className="space-y-3">
            {risk?.stressTests?.map((scenario: any, i: number) => {
              const isNegative = scenario.shockPercentage < 0;
              return (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100 gap-3"
                >
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">{scenario.name}</span>
                    <span className="text-xs text-slate-400">
                      Projected Portfolio Value: {formatAmount(scenario.projectedPortfolioValue)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span
                        className={`font-mono font-bold text-sm block ${
                          isNegative ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {scenario.portfolioImpactValue >= 0 ? '+' : '-'}{formatAmount(Math.abs(scenario.portfolioImpactValue))}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Net: {scenario.projectedReturnPercent >= 0 ? '+' : ''}{scenario.projectedReturnPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Shock Slider (1 col) */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-brand-lavender/50 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-primary" />
              <h3 className="text-base font-bold text-slate-900">Custom Market Shock</h3>
            </div>
            <p className="text-xs text-slate-500">
              Slide to project portfolio behavior under customized market stress parameters.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between font-mono font-bold text-sm">
                <span>Shock:</span>
                <span className={customShock < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {customShock > 0 ? '+' : ''}{customShock}%
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={customShock}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCustomShock(val);
                  runCustomTest(val);
                }}
                className="w-full accent-brand-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-30%</span>
                <span>0%</span>
                <span>+30%</span>
              </div>
            </div>

            {customResult && (
              <div className="p-4 rounded-2xl bg-brand-glow/40 border border-brand-lavender/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Simulated Impact:</span>
                  <span className={`font-mono font-bold ${customResult.impactValue < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {customResult.impactValue >= 0 ? '+' : '-'}{formatAmount(Math.abs(customResult.impactValue))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Projected Total Value:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatAmount(customResult.projectedValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Projected Return:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {customResult.projectedReturnPercent >= 0 ? '+' : ''}{customResult.projectedReturnPercent}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legal / Educational Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700 block mb-0.5">Disclaimer:</span>
            Hypothetical scenario — not an investment forecast or guarantee. Calculations assume linear market correlation without second-order liquidity freezes.
          </div>
        </div>
      </div>
    </div>
  );
};
