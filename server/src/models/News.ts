import mongoose, { Schema, Document } from 'mongoose';

export type SentimentType = 'BULLISH' | 'NEUTRAL' | 'BEARISH';

export interface INews extends Document {
  symbol?: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: Date;
  sentiment: SentimentType;
  sentimentScore?: number; // e.g. -1.0 to +1.0
  provider: string;
  fetchedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    symbol: { type: String, uppercase: true, trim: true, index: true },
    headline: { type: String, required: true },
    source: { type: String, required: true },
    url: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    sentiment: { type: String, enum: ['BULLISH', 'NEUTRAL', 'BEARISH'], default: 'NEUTRAL' },
    sentimentScore: { type: Number },
    provider: { type: String, default: 'primary' },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

NewsSchema.index({ symbol: 1, publishedAt: -1 });

export const News = mongoose.model<INews>('News', NewsSchema);
