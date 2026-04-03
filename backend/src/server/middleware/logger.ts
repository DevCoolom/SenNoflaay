/**
 * Logging & Error Handling Middleware
 */

import { Request, Response, NextFunction } from 'express';

export interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  error?: string;
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Override res.json and res.send to log responses
  const originalJson = res.json;
  const originalSend = res.send;

  res.json = function (data: any) {
    const duration = Date.now() - startTime;
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    };

    console.log(
      `[${logEntry.timestamp}] ${logEntry.method} ${logEntry.path} - ${logEntry.statusCode} (${logEntry.duration}ms)`
    );

    return originalJson.call(this, data);
  };

  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    };

    console.log(
      `[${logEntry.timestamp}] ${logEntry.method} ${logEntry.path} - ${logEntry.statusCode} (${logEntry.duration}ms)`
    );

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Global error handler middleware
 */
export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const message = error.message || 'Internal server error';

  console.error(`[${timestamp}] ERROR: ${req.method} ${req.path} - ${message}`);
  console.error(error);

  // Supabase-specific errors
  if (error.message?.includes('PGRST')) {
    return res.status(400).json({ error: 'Database error: Invalid request' });
  }

  if (error.message?.includes('duplicate key')) {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (error.message?.includes('not found')) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    timestamp,
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
  });
}

/**
 * Health check endpoint
 */
export function healthCheck(req: Request, res: Response) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
