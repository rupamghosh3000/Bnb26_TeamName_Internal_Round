import React, { useState } from 'react';
import { RefreshCw, ArrowRightLeft, TrendingUp, DollarSign, Calculator } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';

export const CurrencyConverterWidget: React.FC = () => {
  const { rate, rateChange, currency, setCurrency, formatAmount } = useCurrency();
  const { account } = useAuth();

  const [usdAmount, setUsdAmount] = useState<string>('1000');
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; price: number }>({
    symbol: 'NVDA',
    price: 233.95,
  });

  const parsedUSD = parseFloat(usdAmount) || 0;
  const inrValue = parsedUSD * rate;

  const popularStocks = [
    { symbol: 'NVDA', price: 233.95 },
    { symbol: 'AAPL', price: 333.69 },
    { symbol: 'MSFT', price: 517.53 },
    { symbol: 'TSLA', price: 370.59 },
    { symbol: 'AMZN', price: 251.52 },
    { symbol: 'GOOGL', price: 343.50 },
  ];

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 border border-brand-lavender/50 space-y-6 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              USD to Indian Rupee (INR) Converter
            </h3>
            <p className="text-xs text-slate-500">Live interbank spot exchange rate conversion</p>
          </div>
        </div>

        {/* Live Rate Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono font-bold text-slate-900">1 USD = ₹{rate.toFixed(2)}</span>
          <span className={`text-[10px] font-bold ${rateChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ({rateChange >= 0 ? '+' : ''}{rateChange.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Main Interactive Converter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* USD Input Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Amount in US Dollars (USD $)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-400">$</span>
            <input
              type="number"
              min="0"
              step="any"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              className="w-full bg-transparent text-xl font-black font-mono text-slate-900 outline-none"
              placeholder="1000"
            />
          </div>
          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {['100', '500', '1000', '10000'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setUsdAmount(preset)}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-brand-primary text-slate-600 font-bold transition-all"
              >
                ${preset}
              </button>
            ))}
            {account && (
              <button
                type="button"
                onClick={() => setUsdAmount(account.cashBalance.toFixed(0))}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-brand-primary/10 border border-brand-primary/30 text-brand-deep font-bold transition-all"
              >
                My Cash Balance
              </button>
            )}
          </div>
        </div>

        {/* INR Converted Output Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Equivalent in Indian Rupees (INR ₹)
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">
              ₹{inrValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[11px] font-medium text-slate-600 pt-2 flex items-center gap-3">
            {inrValue >= 100000 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 font-bold text-[10px]">
                ≈ ₹{(inrValue / 100000).toFixed(2)} Lakhs
              </span>
            )}
            {inrValue >= 10000000 && (
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">
                ≈ ₹{(inrValue / 10000000).toFixed(3)} Crores
              </span>
            )}
            <span className="text-slate-500">Live rate spot</span>
          </div>
        </div>
      </div>

      {/* Stock Prices in INR Quick Ticker Strip */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
          Quick Look: US Stock Prices in Indian Rupees (₹)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {popularStocks.map((stock) => {
            const stockINR = stock.price * rate;
            return (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => setUsdAmount(stock.price.toFixed(2))}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-brand-primary">
                    {stock.symbol}
                  </span>
                  <span className="text-[10px] text-slate-600">${stock.price.toFixed(0)}</span>
                </div>
                <div className="text-xs font-black text-emerald-700 font-mono mt-0.5">
                  ₹{stockINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
