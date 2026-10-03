import mongoose from 'mongoose';
import { config } from './environment.js';

export async function connectDB(): Promise<void> {
  try {
    const uri = config.mongodbUri;
    const safeUri = uri.includes('@')
      ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
      : uri;
    
    console.log(`[Database] Connecting to MongoDB at ${safeUri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Database] MongoDB connected successfully to ${safeUri}`);
  } catch (error: any) {
    console.error('[Database] MongoDB connection error:', error?.message || error);
    console.warn('[Database] WARNING: If using MongoDB Atlas, ensure:');
    console.warn('  1. MONGODB_URI is set in Render Environment Variables.');
    console.warn('  2. MongoDB Atlas Network Access allows 0.0.0.0/0 (Access from Anywhere).');
  }
}
