import React from 'react';

export interface FreshnessBadgeProps {
  freshness: 'LIVE' | 'DELAYED' | 'MARKET_CLOSED' | 'UNAVAILABLE';
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({ freshness }) => {
  const configs = {
    LIVE: {
      label: 'LIVE',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500 animate-pulse',
    },
    DELAYED: {
      label: 'DELAYED',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    MARKET_CLOSED: {
      label: 'MARKET CLOSED',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    },
    UNAVAILABLE: {
      label: 'UNAVAILABLE',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    },
  };

  const current = configs[freshness] || configs.DELAYED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
};

export interface SentimentBadgeProps {
  sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  score?: number;
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment, score }) => {
  const configs = {
    BULLISH: {
      label: 'BULLISH',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    NEUTRAL: {
      label: 'NEUTRAL',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    BEARISH: {
      label: 'BEARISH',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  const current = configs[sentiment] || configs.NEUTRAL;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg}`}
    >
      {current.label}
      {score != null && <span className="opacity-75 font-mono">({score > 0 ? '+' : ''}{score})</span>}
    </span>
  );
};
