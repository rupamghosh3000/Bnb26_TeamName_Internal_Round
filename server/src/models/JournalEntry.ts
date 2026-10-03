import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJournalEntry extends Document {
  userId: Types.ObjectId;
  tradeId?: Types.ObjectId;
  symbol: string;
  thesis: string;
  strategyUsed?: string;
  entryReason?: string;
  exitReason?: string;
  emotion?: 'CONFIDENT' | 'ANXIOUS' | 'NEUTRAL' | 'FOMO' | 'DISCIPLINED';
  outcomeNotes?: string;
  aiReview?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tradeId: { type: Schema.Types.ObjectId, ref: 'Trade' },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    thesis: { type: String, required: true },
    strategyUsed: { type: String },
    entryReason: { type: String },
    exitReason: { type: String },
    emotion: {
      type: String,
      enum: ['CONFIDENT', 'ANXIOUS', 'NEUTRAL', 'FOMO', 'DISCIPLINED'],
      default: 'NEUTRAL',
    },
    outcomeNotes: { type: String },
    aiReview: { type: String },
  },
  { timestamps: true }
);

export const JournalEntry = mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
