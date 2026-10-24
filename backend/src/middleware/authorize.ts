import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export const authorize = (...allowedRoles: Array<'admin' | 'user'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action.'));
    }

    return next();
  };
};
