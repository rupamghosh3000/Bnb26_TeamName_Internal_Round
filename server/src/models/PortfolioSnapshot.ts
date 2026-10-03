import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPortfolioSnapshot extends Document {
  userId: Types.ObjectId;
  timestamp: Date;
  cash: number;
  investedValue: number;
  totalValue: number;
  realizedPnL: number;
  unrealizedPnL: number;
}

const PortfolioSnapshotSchema = new Schema<IPortfolioSnapshot>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    cash: { type: Number, required: true },
    investedValue: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    realizedPnL: { type: Number, required: true, default: 0 },
    unrealizedPnL: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

PortfolioSnapshotSchema.index({ userId: 1, timestamp: -1 });

export const PortfolioSnapshot = mongoose.model<IPortfolioSnapshot>(
  'PortfolioSnapshot',
  PortfolioSnapshotSchema
);
