import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Not authorized. Token missing.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

    req.user = {
      id: String(decoded.sub ?? decoded.id ?? ''),
      email: String(decoded.email ?? ''),
      role: (decoded.role as 'admin' | 'user') ?? 'user',
    };

    return next();
  } catch (error) {
    return next(new AppError(401, 'Not authorized. Token invalid or expired.'));
  }
};
