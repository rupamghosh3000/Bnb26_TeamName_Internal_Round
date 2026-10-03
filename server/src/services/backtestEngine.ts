import { HistoricalBar } from '../providers/interfaces.js';

export interface BacktestParams {
  symbol: string;
  strategyType: 'MA_CROSSOVER' | 'RSI' | 'MOMENTUM' | 'BREAKOUT';
  params?: Record<string, any>;
  initialCapital: number;
  bars: HistoricalBar[];
}

export interface BacktestResult {
  symbol: string;
  strategyType: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  benchmarkReturn: number;
  winRate: number;
  maxDrawdown: number;
  profitFactor: number;
  tradeCount: number;
  equityCurve: {
    date: string;
    strategyEquity: number;
    benchmarkEquity: number;
    drawdown: number;
  }[];
  trades: {
    date: string;
    side: 'BUY' | 'SELL';
    price: number;
    shares: number;
    pnl?: number;
    returnPct?: number;
  }[];
}

// Indicator Helpers
export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

export function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (data.length <= period) return data.map(() => null);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null);
    } else if (i === period) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    } else {
      const diff = data[i] - data[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }

  return result;
}

export function runBacktest(options: BacktestParams): BacktestResult {
  const { symbol, strategyType, params = {}, initialCapital, bars } = options;

  if (!bars || bars.length < 20) {
    throw new Error(`Insufficient historical bars (${bars?.length || 0}) to execute backtest.`);
  }

  const closes = bars.map((b) => b.close);
  const dates = bars.map((b) => b.date.split('T')[0]);

  // Generate strategy signals: 1 for BUY, -1 for SELL, 0 for HOLD
  const signals: number[] = new Array(bars.length).fill(0);

  if (strategyType === 'MA_CROSSOVER') {
    const fastPeriod = Number(params.fastPeriod) || 20;
    const slowPeriod = Number(params.slowPeriod) || 50;
    const fastMA = calculateSMA(closes, fastPeriod);
    const slowMA = calculateSMA(closes, slowPeriod);

    for (let i = 1; i < bars.length; i++) {
      if (fastMA[i] != null && slowMA[i] != null && fastMA[i - 1] != null && slowMA[i - 1] != null) {
        if (fastMA[i - 1]! <= slowMA[i - 1]! && fastMA[i]! > slowMA[i]!) {
          signals[i] = 1; // Bullish cross
        } else if (fastMA[i - 1]! >= slowMA[i - 1]! && fastMA[i]! < slowMA[i]!) {
          signals[i] = -1; // Bearish cross
        }
      }
    }
  } else if (strategyType === 'RSI') {
    const period = Number(params.period) || 14;
    const oversold = Number(params.oversold) || 30;
    const overbought = Number(params.overbought) || 70;
    const rsi = calculateRSI(closes, period);

    for (let i = 1; i < bars.length; i++) {
      if (rsi[i] != null && rsi[i - 1] != null) {
        if (rsi[i - 1]! < oversold && rsi[i]! >= oversold) {
          signals[i] = 1; // Rebound from oversold
        } else if (rsi[i - 1]! > overbought && rsi[i]! <= overbought) {
          signals[i] = -1; // Fall from overbought
        }
      }
    }
  } else if (strategyType === 'BREAKOUT') {
    const lookback = Number(params.lookback) || 20;
    for (let i = lookback; i < bars.length; i++) {
      const windowHigh = Math.max(...closes.slice(i - lookback, i));
      const windowLow = Math.min(...closes.slice(i - lookback, i));

      if (closes[i] > windowHigh) {
        signals[i] = 1; // 20-day high breakout
      } else if (closes[i] < windowLow) {
        signals[i] = -1; // 20-day low breakdown
      }
    }
  } else {
    // MOMENTUM default
    const lookback = Number(params.lookback) || 10;
    for (let i = lookback; i < bars.length; i++) {
      const mom = (closes[i] - closes[i - lookback]) / closes[i - lookback];
      if (mom > 0.03) signals[i] = 1;
      else if (mom < -0.02) signals[i] = -1;
    }
  }

  // Simulation execution loop
  let cash = initialCapital;
  let shares = 0;
  let entryPrice = 0;
  let peakEquity = initialCapital;
  let grossProfit = 0;
  let grossLoss = 0;
  let winningTrades = 0;
  let losingTrades = 0;

  const trades: BacktestResult['trades'] = [];
  const equityCurve: BacktestResult['equityCurve'] = [];

  const firstClose = closes[0];
  const benchmarkShares = initialCapital / firstClose;

  for (let i = 0; i < bars.length; i++) {
    const price = closes[i];
    const date = dates[i];
    const sig = signals[i];

    // Execution logic
    if (sig === 1 && shares === 0 && cash > price) {
      // BUY
      shares = Math.floor(cash / price);
      const cost = shares * price;
      cash -= cost;
      entryPrice = price;

      trades.push({
        date,
        side: 'BUY',
        price,
        shares,
      });
    } else if (sig === -1 && shares > 0) {
      // SELL
      const proceeds = shares * price;
      const pnl = proceeds - shares * entryPrice;
      const retPct = entryPrice > 0 ? ((price - entryPrice) / entryPrice) * 100 : 0;

      cash += proceeds;

      if (pnl > 0) {
        winningTrades++;
        grossProfit += pnl;
      } else {
        losingTrades++;
        grossLoss += Math.abs(pnl);
      }

      trades.push({
        date,
        side: 'SELL',
        price,
        shares,
        pnl: Number(pnl.toFixed(2)),
        returnPct: Number(retPct.toFixed(2)),
      });

      shares = 0;
      entryPrice = 0;
    }

    const currentStrategyEquity = cash + shares * price;
    const benchmarkEquity = benchmarkShares * price;

    if (currentStrategyEquity > peakEquity) {
      peakEquity = currentStrategyEquity;
    }
    const dd = peakEquity > 0 ? ((peakEquity - currentStrategyEquity) / peakEquity) * 100 : 0;

    equityCurve.push({
      date,
      strategyEquity: Number(currentStrategyEquity.toFixed(2)),
      benchmarkEquity: Number(benchmarkEquity.toFixed(2)),
      drawdown: Number(dd.toFixed(2)),
    });
  }

  // Close remaining open position at final bar for total accounting
  const finalClose = closes[closes.length - 1];
  const finalEquity = cash + shares * finalClose;
  const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100;
  const benchmarkReturn = ((finalClose - firstClose) / firstClose) * 100;

  const totalTrades = winningTrades + losingTrades;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.99 : 0;
  const maxDrawdown = Math.max(...equityCurve.map((e) => e.drawdown), 0);

  return {
    symbol,
    strategyType,
    initialCapital,
    finalCapital: Number(finalEquity.toFixed(2)),
    totalReturn: Number(totalReturn.toFixed(2)),
    benchmarkReturn: Number(benchmarkReturn.toFixed(2)),
    winRate: Number(winRate.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    tradeCount: totalTrades,
    equityCurve,
    trades,
  };
}
