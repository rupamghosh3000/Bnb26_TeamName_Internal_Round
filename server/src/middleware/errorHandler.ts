import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[API Error]:', err);

  const statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An unexpected error occurred while processing your request.';
  if (message.includes('buffering timed out') || message.includes('ECONNREFUSED') || message.includes('MongooseServerSelectionError')) {
    message = 'Database is currently unreachable. Please ensure MONGODB_URI is set in Render Environment Variables and MongoDB Atlas Network Access has 0.0.0.0/0 allowed.';
  }

  res.status(statusCode).json({
    error: err.name || 'DATABASE_CONNECTION_ERROR',
    message,
    timestamp: new Date().toISOString(),
  });
}
