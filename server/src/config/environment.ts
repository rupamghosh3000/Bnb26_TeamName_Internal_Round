import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or current directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  webUrl: process.env.WEB_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/stockpulse',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwt: {
    secret: process.env.JWT_SECRET || 'stockpulse_super_secure_jwt_token_secret_key_2026_xyz',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  providers: {
    marketData: process.env.MARKET_DATA_PROVIDER || 'primary',
    marketDataApiKey: process.env.MARKET_DATA_API_KEY || '',
    news: process.env.NEWS_PROVIDER || 'primary',
    newsApiKey: process.env.NEWS_API_KEY || '',
    sentiment: process.env.SENTIMENT_PROVIDER || 'primary',
    sentimentApiKey: process.env.SENTIMENT_API_KEY || '',
    ai: process.env.AI_PROVIDER || 'internal',
    aiApiKey: process.env.AI_API_KEY || '',
    aiModel: process.env.AI_MODEL || 'stockpulse-intelligence-v1',
  },
  trading: {
    defaultStartingCash: 100000, // $100,000 virtual starting capital
    currency: 'USD',
  },
};
