import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWatchlist extends Document {
  userId: Types.ObjectId;
  name: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistSchema = new Schema<IWatchlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, default: 'My Watchlist' },
    symbols: [{ type: String, uppercase: true, trim: true }],
  },
  { timestamps: true }
);

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);
