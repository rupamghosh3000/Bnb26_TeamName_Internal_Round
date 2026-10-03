import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderSide } from './Order.js';

export interface ITrade extends Document {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  value: number;
  realizedPnL?: number;
  executedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    value: { type: Number, required: true },
    realizedPnL: { type: Number },
    executedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

TradeSchema.index({ userId: 1, executedAt: -1 });
TradeSchema.index({ userId: 1, symbol: 1 });

export const Trade = mongoose.model<ITrade>('Trade', TradeSchema);
