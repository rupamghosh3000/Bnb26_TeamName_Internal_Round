import mongoose, { Schema, Document, Types } from 'mongoose';

export type AlertType = 'STOP_LOSS' | 'TARGET' | 'PRICE';
export type AlertStatus = 'ACTIVE' | 'TRIGGERED' | 'CANCELLED';

export interface IAlert extends Document {
  userId: Types.ObjectId;
  symbol: string;
  type: AlertType;
  direction?: 'ABOVE' | 'BELOW';
  targetPrice: number;
  status: AlertStatus;
  triggeredAt?: Date;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, enum: ['STOP_LOSS', 'TARGET', 'PRICE'], required: true },
    direction: { type: String, enum: ['ABOVE', 'BELOW'] },
    targetPrice: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'TRIGGERED', 'CANCELLED'], default: 'ACTIVE', index: true },
    triggeredAt: { type: Date },
  },
  { timestamps: true }
);

AlertSchema.index({ status: 1, symbol: 1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
