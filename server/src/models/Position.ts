import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPosition extends Document {
  userId: Types.ObjectId;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  updatedAt: Date;
}

const PositionSchema = new Schema<IPosition>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    quantity: { type: Number, required: true },
    averagePrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

// Unique index: a user can only have one active position entry per symbol
PositionSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Position = mongoose.model<IPosition>('Position', PositionSchema);
