import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  console.error(`[Error] ${statusCode} - ${message}`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(err.details !== undefined ? { details: err.details } : {}),
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
};

export class AppError extends Error implements ApiError {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(message: string, statusCode: number = 500, code: string = 'ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
