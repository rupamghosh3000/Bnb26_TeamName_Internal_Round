import { PaperAccount } from '../models/PaperAccount.js';
import { Position } from '../models/Position.js';
import { Trade } from '../models/Trade.js';
import { PortfolioSnapshot } from '../models/PortfolioSnapshot.js';
import { marketProvider } from '../providers/index.js';

export interface EnrichedPosition {
  id: string;
  symbol: string;
  currency?: string;
  name?: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  unrealizedPnL: number;
  pnlPercent: number;
  allocationPercent: number;
  changePercent?: number;
}

export function isIndianSymbol(symbol: string, currency?: string): boolean {
  if (currency === 'INR') return true;
  if (!symbol) return false;
  const s = symbol.toUpperCase();
  return s.endsWith('.NS') || s.endsWith('.BO') || s.startsWith('^NSE') || s.startsWith('^BSE');
}

export async function getUsdToInrRate(): Promise<number> {
  try {
    const q = await marketProvider.getQuote('USDINR=X');
    if (q && q.price > 0) return q.price;
  } catch {}
  return 84.5;
}

export interface PortfolioSummary {
  startingCash: number;
  cashBalance: number;
  investedValue: number;
  totalValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  returnPercent: number;
  largestPosition?: {
    symbol: string;
    value: number;
    allocationPercent: number;
  };
  cashExposurePercent: number;
  positionsCount: number;
  positions: EnrichedPosition[];
}

export class PortfolioService {
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    let account = await PaperAccount.findOne({ userId });
    if (!account) {
      account = new PaperAccount({
        userId,
        startingCash: 100000,
        cashBalance: 100000,
      });
      await account.save();
    }

    const rawPositions = await Position.find({ userId });
    const enrichedPositions: EnrichedPosition[] = [];
    let investedValue = 0;
    let unrealizedPnL = 0;

    // Fetch live quotes for active positions concurrently
    const quotePromises = rawPositions.map(async (pos) => {
      try {
        const quote = await marketProvider.getQuote(pos.symbol);
        pos.currentPrice = quote.price;
        await pos.save();
        return { pos, quote };
      } catch (err) {
        return { pos, quote: null };
      }
    });

    const [quoteResults, usdInrRate] = await Promise.all([
      Promise.all(quotePromises),
      getUsdToInrRate(),
    ]);

    for (const { pos, quote } of quoteResults) {
      const isIndian = isIndianSymbol(pos.symbol, quote?.currency);
      const price = pos.currentPrice;
      const priceInUSD = isIndian ? (usdInrRate > 0 ? price / usdInrRate : price) : price;
      const avgPriceInUSD = isIndian ? (usdInrRate > 0 ? pos.averagePrice / usdInrRate : pos.averagePrice) : pos.averagePrice;

      const currentVal = pos.quantity * priceInUSD;
      const investedVal = pos.quantity * avgPriceInUSD;
      const pnl = currentVal - investedVal;
      const pnlPct = investedVal > 0 ? (pnl / investedVal) * 100 : 0;

      investedValue += currentVal;
      unrealizedPnL += pnl;

      enrichedPositions.push({
        id: pos._id.toString(),
        symbol: pos.symbol,
        currency: isIndian ? 'INR' : (quote?.currency || 'USD'),
        name: quote?.name || pos.symbol,
        quantity: pos.quantity,
        averagePrice: Number(pos.averagePrice.toFixed(2)),
        currentPrice: Number(price.toFixed(2)),
        investedValue: Number(investedVal.toFixed(2)),
        currentValue: Number(currentVal.toFixed(2)),
        unrealizedPnL: Number(pnl.toFixed(2)),
        pnlPercent: Number(pnlPct.toFixed(2)),
        allocationPercent: 0, // Will calculate below once totalValue is known
        changePercent: quote?.changePercent,
      });
    }

    const totalValue = account.cashBalance + investedValue;

    // Calculate allocation percentages
    let largestPos: PortfolioSummary['largestPosition'];
    let maxVal = -1;

    for (const p of enrichedPositions) {
      p.allocationPercent = totalValue > 0 ? Number(((p.currentValue / totalValue) * 100).toFixed(2)) : 0;
      if (p.currentValue > maxVal) {
        maxVal = p.currentValue;
        largestPos = {
          symbol: p.symbol,
          value: p.currentValue,
          allocationPercent: p.allocationPercent,
        };
      }
    }

    // Calculate realized P&L from closed trades
    const trades = await Trade.find({ userId, side: 'SELL' });
    const realizedPnL = trades.reduce((acc, t) => acc + (t.realizedPnL || 0), 0);
    const totalPnL = realizedPnL + unrealizedPnL;
    const returnPercent = account.startingCash > 0 ? ((totalValue - account.startingCash) / account.startingCash) * 100 : 0;
    const cashExposurePercent = totalValue > 0 ? (account.cashBalance / totalValue) * 100 : 100;

    return {
      startingCash: Number(account.startingCash.toFixed(2)),
      cashBalance: Number(account.cashBalance.toFixed(2)),
      investedValue: Number(investedValue.toFixed(2)),
      totalValue: Number(totalValue.toFixed(2)),
      unrealizedPnL: Number(unrealizedPnL.toFixed(2)),
      realizedPnL: Number(realizedPnL.toFixed(2)),
      totalPnL: Number(totalPnL.toFixed(2)),
      returnPercent: Number(returnPercent.toFixed(2)),
      largestPosition: largestPos,
      cashExposurePercent: Number(cashExposurePercent.toFixed(2)),
      positionsCount: enrichedPositions.length,
      positions: enrichedPositions,
    };
  }

  async getPerformance(userId: string) {
    const snapshots = await PortfolioSnapshot.find({ userId }).sort({ timestamp: 1 });
    const current = await this.getPortfolioSummary(userId);

    const dataPoints = snapshots.map((s) => ({
      date: s.timestamp.toISOString().split('T')[0],
      totalValue: s.totalValue,
      cash: s.cash,
      investedValue: s.investedValue,
      unrealizedPnL: s.unrealizedPnL,
      realizedPnL: s.realizedPnL,
    }));

    // If fewer than 2 snapshots, provide baseline representation
    if (dataPoints.length === 0) {
      const now = new Date();
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dataPoints.push({
        date: past.toISOString().split('T')[0],
        totalValue: current.startingCash,
        cash: current.startingCash,
        investedValue: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
      });
      dataPoints.push({
        date: now.toISOString().split('T')[0],
        totalValue: current.totalValue,
        cash: current.cashBalance,
        investedValue: current.investedValue,
        unrealizedPnL: current.unrealizedPnL,
        realizedPnL: current.realizedPnL,
      });
    }

    return dataPoints;
  }

  async recordSnapshot(userId: string) {
    try {
      const summary = await this.getPortfolioSummary(userId);
      const snapshot = new PortfolioSnapshot({
        userId,
        timestamp: new Date(),
        cash: summary.cashBalance,
        investedValue: summary.investedValue,
        totalValue: summary.totalValue,
        realizedPnL: summary.realizedPnL,
        unrealizedPnL: summary.unrealizedPnL,
      });
      await snapshot.save();
    } catch (err) {
      console.error('[Portfolio] Snapshot error:', err);
    }
  }
}

export const portfolioService = new PortfolioService();
