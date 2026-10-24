import { NextFunction, Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { IUser } from '../models/User';
import { z } from 'zod';
import { env } from '../config/env';
import { AdminSetup } from '../models/AdminSetup';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const adminSetupSchema = registerSchema.extend({
  password: z.string().min(8),
  adminKey: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signToken = (user: { id: string; email: string; role: 'admin' | 'user' }): string => {
  const secret = env.jwtSecret as jwt.Secret;
  const expiresIn = env.jwtExpiresIn as jwt.SignOptions['expiresIn'];

  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret, {
    expiresIn,
  });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
    if (existingUser) {
      throw new AppError(400, 'Email is already registered');
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: payload.password,
      role: 'user',
    });

    const token = signToken({
      id: String(user._id),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = loginSchema.parse(req.body);

    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(payload.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = signToken({
      id: String(user._id),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminSetupStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [adminExists, setup] = await Promise.all([
      User.exists({ role: 'admin' }),
      AdminSetup.findById('initial-admin').select('state updatedAt'),
    ]);
    const staleSetupBefore = new Date(Date.now() - 5 * 60 * 1000);
    const setupCanBeClaimed =
      !setup ||
      setup.state === 'available' ||
      (setup.state === 'in_progress' && setup.updatedAt < staleSetupBefore);

    res.status(200).json({
      success: true,
      data: {
        setupAvailable: Boolean(
          env.adminSetupKey &&
            env.adminSetupKey.length >= 32 &&
            !adminExists &&
            setupCanBeClaimed
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const setupAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!env.adminSetupKey || env.adminSetupKey.length < 32) {
      throw new AppError(503, 'Admin setup requires a server key of at least 32 characters');
    }

    const payload = adminSetupSchema.parse(req.body);
    const providedKey = Buffer.from(payload.adminKey);
    const expectedKey = Buffer.from(env.adminSetupKey);
    const keyMatches =
      providedKey.length === expectedKey.length &&
      timingSafeEqual(providedKey, expectedKey);

    if (!keyMatches) {
      throw new AppError(403, 'Invalid admin setup key');
    }

    if (await User.exists({ role: 'admin' })) {
      throw new AppError(409, 'An admin account already exists');
    }

    try {
      await AdminSetup.updateOne(
        { _id: 'initial-admin' },
        { $setOnInsert: { state: 'available' } },
        { upsert: true }
      );
    } catch (error) {
      if (!(error && typeof error === 'object' && 'code' in error && error.code === 11000)) {
        throw error;
      }
    }

    const setupLock = await AdminSetup.findOneAndUpdate(
      {
        _id: 'initial-admin',
        $or: [
          { state: 'available' },
          { state: 'in_progress', updatedAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) } },
        ],
      },
      { $set: { state: 'in_progress' } },
      { new: true }
    );

    if (!setupLock) {
      throw new AppError(409, 'Admin setup has already been used or is in progress');
    }

    let user: IUser;
    try {
      user = await User.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: payload.password,
        role: 'admin',
      });
      await AdminSetup.updateOne(
        { _id: 'initial-admin', state: 'in_progress' },
        { $set: { state: 'completed' } }
      );
    } catch (error) {
      await AdminSetup.updateOne(
        { _id: 'initial-admin', state: 'in_progress' },
        { $set: { state: 'available' } }
      );
      throw error;
    }

    const token = signToken({
      id: String(user._id),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'User not authenticated');
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
