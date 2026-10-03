import mongoose from 'mongoose';
import { config } from './environment.js';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log(`[Database] MongoDB connected successfully to ${config.mongodbUri}`);
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error);
    process.exit(1);
  }
}
