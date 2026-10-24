import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isValidationError = err instanceof ZodError;
  const statusCode = err instanceof AppError ? err.statusCode : isValidationError ? 400 : 500;
  const message = isValidationError ? 'Validation failed' : err.message || 'Internal server error';

  console.error(`Error ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(isValidationError && {
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
