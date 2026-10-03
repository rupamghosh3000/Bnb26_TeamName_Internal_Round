import mongoose from 'mongoose';
import { config } from './environment.js';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    const safeUri = config.mongodbUri.includes('@')
      ? config.mongodbUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
      : config.mongodbUri;
    console.log(`[Database] MongoDB connected successfully to ${safeUri}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    console.warn('[Database] WARNING: Running without active database connection. Ensure MONGODB_URI environment variable is configured in Render.');
  }
}
