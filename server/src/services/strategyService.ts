import { Types } from 'mongoose';
import { Strategy, IStrategy } from '../models/Strategy.js';
import { Backtest, IBacktest } from '../models/Backtest.js';
import { marketProvider } from '../providers/index.js';
import { runBacktest } from './backtestEngine.js';

export interface CreateStrategyDTO {
  userId: string;
  name: string;
  description?: string;
  rules: any[];
  assetUniverse?: string[];
  timeframe?: string;
}

export interface RunBacktestDTO {
  userId: string;
  strategyId?: string;
  symbol: string;
  strategyType: 'MA_CROSSOVER' | 'RSI' | 'MOMENTUM' | 'BREAKOUT';
  params?: Record<string, any>;
  range?: string; // 6mo, 1y, 2y
  initialCapital?: number;
}

export class StrategyService {
  async createStrategy(dto: CreateStrategyDTO): Promise<IStrategy> {
    const strategy = new Strategy({
      userId: new Types.ObjectId(dto.userId),
      name: dto.name,
      description: dto.description || '',
      rules: dto.rules,
      assetUniverse: dto.assetUniverse || ['AAPL', 'MSFT', 'NVDA'],
      timeframe: dto.timeframe || '1d',
    });
    await strategy.save();
    return strategy;
  }

  async getUserStrategies(userId: string): Promise<IStrategy[]> {
    return Strategy.find({ userId }).sort({ updatedAt: -1 });
  }

  async getStrategyById(id: string, userId: string): Promise<IStrategy | null> {
    return Strategy.findOne({ _id: id, userId });
  }

  async deleteStrategy(id: string, userId: string): Promise<boolean> {
    const res = await Strategy.deleteOne({ _id: id, userId });
    return res.deletedCount > 0;
  }

  async executeBacktest(dto: RunBacktestDTO): Promise<IBacktest> {
    const symbol = dto.symbol.trim().toUpperCase();
    const range = dto.range || '1y';
    const initialCapital = dto.initialCapital || 100000;

    // Fetch REAL historical market data
    const bars = await marketProvider.getHistoricalData(symbol, range, '1d');
    if (!bars || bars.length < 20) {
      throw new Error(`Insufficient historical market data available for ${symbol} over ${range}.`);
    }

    const result = runBacktest({
      symbol,
      strategyType: dto.strategyType,
      params: dto.params,
      initialCapital,
      bars,
    });

    const startDate = bars[0].date.split('T')[0];
    const endDate = bars[bars.length - 1].date.split('T')[0];

    const backtest = new Backtest({
      userId: new Types.ObjectId(dto.userId),
      strategyId: dto.strategyId ? new Types.ObjectId(dto.strategyId) : undefined,
      strategyName: `${dto.strategyType} on ${symbol}`,
      symbol,
      timeframe: '1d',
      startDate,
      endDate,
      initialCapital: result.initialCapital,
      finalCapital: result.finalCapital,
      totalReturn: result.totalReturn,
      benchmarkReturn: result.benchmarkReturn,
      winRate: result.winRate,
      maxDrawdown: result.maxDrawdown,
      profitFactor: result.profitFactor,
      tradeCount: result.tradeCount,
      equityCurve: result.equityCurve,
      trades: result.trades,
    });

    await backtest.save();
    return backtest;
  }

  async getBacktestById(id: string, userId: string): Promise<IBacktest | null> {
    return Backtest.findOne({ _id: id, userId });
  }

  async getUserBacktests(userId: string): Promise<IBacktest[]> {
    return Backtest.find({ userId }).sort({ createdAt: -1 }).limit(20);
  }
}

export const strategyService = new StrategyService();
