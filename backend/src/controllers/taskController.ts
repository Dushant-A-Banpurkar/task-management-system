import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { canAccessTask, canManageTask, canUpdateTask } from '../utils/taskPermissions';

const taskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  dueDate: z
    .union([
      z.string().refine((value) => value === '' || !Number.isNaN(new Date(value).getTime())),
      z.date(),
    ])
    .optional(),
  assigneeId: z.string().refine(Types.ObjectId.isValid, 'Invalid assignee ID').optional(),
});

const createTaskSchema = taskSchema.extend({
  title: z.string().min(3),
  description: z.string().min(10),
});

const validateTaskId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid task ID');
  }
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, priority, search } = req.query;

    const filter: Record<string, unknown> = {};

    if (req.user && req.user.role === 'user') {
      filter.$or = [{ createdBy: req.user.id }, { assignee: req.user.id }];
    }

    if (status) {
      filter.status = String(status);
    }

    if (priority) {
      filter.priority = String(priority);
    }

    if (search) {
      filter.title = { $regex: String(search), $options: 'i' };
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email role')
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validateTaskId(req.params.id);
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email role');

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (!req.user || !canAccessTask(req.user, task)) {
      throw new AppError(403, 'You do not have access to this task');
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = createTaskSchema.parse(req.body);

    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    if (payload.assigneeId) {
      const assignee = await User.findById(payload.assigneeId);
      if (!assignee) {
        throw new AppError(400, 'Assignee user not found');
      }
    }

    const task = await Task.create({
      title: payload.title,
      description: payload.description,
      priority: payload.priority ?? 'medium',
      status: payload.status ?? 'todo',
      dueDate: payload.dueDate || undefined,
      assignee: payload.assigneeId || undefined,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validateTaskId(req.params.id);
    const payload = taskSchema.partial().parse(req.body);
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    if (!canUpdateTask(req.user, task, Object.keys(payload))) {
      throw new AppError(403, 'You can only update your own tasks');
    }

    if (payload.assigneeId) {
      const assignee = await User.findById(payload.assigneeId);
      if (!assignee) {
        throw new AppError(400, 'Assignee user not found');
      }
    }

    const { assigneeId, ...taskPayload } = payload;
    Object.assign(task, taskPayload);
    if (assigneeId !== undefined) {
      task.assignee = assigneeId ? new Types.ObjectId(assigneeId) : undefined;
      task.reminderSentAt = undefined;
      task.reminderClaimedAt = undefined;
    }
    if (payload.dueDate !== undefined || (payload.status && payload.status !== 'completed')) {
      task.dueDate = payload.dueDate
        ? payload.dueDate instanceof Date
          ? payload.dueDate
          : new Date(payload.dueDate)
        : undefined;
      task.reminderSentAt = undefined;
      task.reminderClaimedAt = undefined;
    }

    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validateTaskId(req.params.id);
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    if (!canManageTask(req.user, task)) {
      throw new AppError(403, 'You can only delete your own tasks');
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTaskComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validateTaskId(req.params.id);
    const task = await Task.findById(req.params.id).populate(
      'comments.user',
      'name email role'
    );

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (!req.user || !canAccessTask(req.user, task)) {
      throw new AppError(403, 'You do not have access to this task');
    }

    res.status(200).json({ success: true, data: task.comments });
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    validateTaskId(req.params.id);
    const { message } = z.object({ message: z.string().trim().min(1).max(2000) }).parse(req.body);
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw new AppError(404, 'Task not found');
    }
    if (!req.user || !canAccessTask(req.user, task)) {
      throw new AppError(403, 'You do not have access to this task');
    }

    task.comments.push({
      user: new Types.ObjectId(req.user.id),
      message,
      createdAt: new Date(),
    });
    await task.save();
    await task.populate('comments.user', 'name email role');

    res.status(201).json({
      success: true,
      data: task.comments[task.comments.length - 1],
    });
  } catch (error) {
    next(error);
  }
};
