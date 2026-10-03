import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBacktestTrade {
  date: string;
  side: 'BUY' | 'SELL';
  price: number;
  shares: number;
  pnl?: number;
  returnPct?: number;
}

export interface IEquityPoint {
  date: string;
  strategyEquity: number;
  benchmarkEquity: number; // Buy & Hold comparison
  drawdown: number;
}

export interface IBacktest extends Document {
  userId: Types.ObjectId;
  strategyId?: Types.ObjectId;
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  benchmarkReturn: number;
  winRate: number;
  maxDrawdown: number;
  profitFactor: number;
  tradeCount: number;
  equityCurve: IEquityPoint[];
  trades: IBacktestTrade[];
  createdAt: Date;
}

const BacktestSchema = new Schema<IBacktest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    strategyId: { type: Schema.Types.ObjectId, ref: 'Strategy' },
    strategyName: { type: String, required: true },
    symbol: { type: String, required: true, uppercase: true },
    timeframe: { type: String, default: '1d' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    initialCapital: { type: Number, required: true },
    finalCapital: { type: Number, required: true },
    totalReturn: { type: Number, required: true },
    benchmarkReturn: { type: Number, required: true },
    winRate: { type: Number, required: true },
    maxDrawdown: { type: Number, required: true },
    profitFactor: { type: Number, required: true },
    tradeCount: { type: Number, required: true },
    equityCurve: [
      {
        date: String,
        strategyEquity: Number,
        benchmarkEquity: Number,
        drawdown: Number,
      },
    ],
    trades: [
      {
        date: String,
        side: { type: String, enum: ['BUY', 'SELL'] },
        price: Number,
        shares: Number,
        pnl: Number,
        returnPct: Number,
      },
    ],
  },
  { timestamps: true }
);

export const Backtest = mongoose.model<IBacktest>('Backtest', BacktestSchema);
