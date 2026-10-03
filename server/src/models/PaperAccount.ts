import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPaperAccount extends Document {
  userId: Types.ObjectId;
  startingCash: number;
  cashBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaperAccountSchema = new Schema<IPaperAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    startingCash: { type: Number, required: true, default: 100000 },
    cashBalance: { type: Number, required: true, default: 100000 },
  },
  { timestamps: true }
);

export const PaperAccount = mongoose.model<IPaperAccount>('PaperAccount', PaperAccountSchema);
