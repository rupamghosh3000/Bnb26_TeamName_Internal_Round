import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStrategyRule {
  type: 'MA_CROSSOVER' | 'RSI' | 'MOMENTUM' | 'BREAKOUT' | 'CUSTOM';
  params: Record<string, any>;
  description: string;
}

export interface IStrategy extends Document {
  userId: Types.ObjectId;
  name: string;
  description: string;
  rules: IStrategyRule[];
  assetUniverse: string[];
  timeframe: string;
  createdAt: Date;
  updatedAt: Date;
}

const StrategySchema = new Schema<IStrategy>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    rules: [
      {
        type: { type: String, required: true },
        params: { type: Schema.Types.Mixed, default: {} },
        description: { type: String, default: '' },
      },
    ],
    assetUniverse: [{ type: String, uppercase: true }],
    timeframe: { type: String, default: '1d' },
  },
  { timestamps: true }
);

export const Strategy = mongoose.model<IStrategy>('Strategy', StrategySchema);
