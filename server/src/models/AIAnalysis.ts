import mongoose, { Schema, Document, Types } from 'mongoose';

export type AIAnalysisType =
  | 'MARKET_BRIEF'
  | 'STOCK_EXPLANATION'
  | 'WHY_DID_IT_MOVE'
  | 'PORTFOLIO_ANALYST'
  | 'RISK_EXPLANATION'
  | 'TRADE_REVIEW'
  | 'STRATEGY_ANALYST'
  | 'NATURAL_QUERY';

export interface IAIAnalysis extends Document {
  userId: Types.ObjectId;
  type: AIAnalysisType;
  symbol?: string;
  contextSnapshot: Record<string, any>;
  result: {
    answer: string;
    observations: string[];
    sources?: string[];
    uncertainty?: string;
    metrics?: Record<string, any>;
  };
  createdAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    symbol: { type: String, uppercase: true },
    contextSnapshot: { type: Schema.Types.Mixed, default: {} },
    result: {
      answer: { type: String, required: true },
      observations: [{ type: String }],
      sources: [{ type: String }],
      uncertainty: { type: String },
      metrics: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

AIAnalysisSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
