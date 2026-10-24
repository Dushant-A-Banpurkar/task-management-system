import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(404, `Route not found: ${req.originalUrl}`));
};
