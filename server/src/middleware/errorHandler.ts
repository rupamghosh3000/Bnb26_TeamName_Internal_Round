import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[API Error]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected error occurred while processing your request.';

  res.status(statusCode).json({
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message,
    timestamp: new Date().toISOString(),
  });
}
