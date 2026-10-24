import { Document, model, Schema, Types } from 'mongoose';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface ITask extends Document {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  reminderSentAt?: Date;
  reminderClaimedAt?: Date;
  assignee?: Types.ObjectId;
  createdBy: Types.ObjectId;
  comments: Array<{
    user: Types.ObjectId;
    message: string;
    createdAt: Date;
  }>;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
    reminderSentAt: {
      type: Date,
    },
    reminderClaimedAt: {
      type: Date,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITask>('Task', taskSchema);
