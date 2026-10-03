import mongoose, { Schema, Document, Types } from 'mongoose';

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';

export interface IOrder extends Document {
  userId: Types.ObjectId;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  status: OrderStatus;
  executedPrice?: number;
  rejectionReason?: string;
  createdAt: Date;
  executedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    type: { type: String, enum: ['MARKET', 'LIMIT'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    limitPrice: { type: Number },
    status: {
      type: String,
      enum: ['PENDING', 'FILLED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    executedPrice: { type: Number },
    rejectionReason: { type: String },
    executedAt: { type: Date },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, symbol: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
