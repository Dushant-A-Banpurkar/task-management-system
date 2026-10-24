import type { Types } from 'mongoose';

type TaskOwnerFields = {
  createdBy: string | Types.ObjectId | { _id?: string | Types.ObjectId };
  assignee?: string | Types.ObjectId | { _id?: string | Types.ObjectId } | null;
};

type TaskActor = {
  id: string;
  role: 'admin' | 'user';
};

const idOf = (value: TaskOwnerFields['createdBy'] | TaskOwnerFields['assignee']): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && '_id' in value) {
    return value._id ? String(value._id) : undefined;
  }
  return String(value);
};

export const canAccessTask = (actor: TaskActor, task: TaskOwnerFields): boolean =>
  actor.role === 'admin' ||
  idOf(task.createdBy) === actor.id ||
  idOf(task.assignee) === actor.id;

export const canManageTask = (actor: TaskActor, task: TaskOwnerFields): boolean =>
  actor.role === 'admin' || idOf(task.createdBy) === actor.id;

export const canUpdateTask = (
  actor: TaskActor,
  task: TaskOwnerFields,
  fields: string[]
): boolean =>
  canManageTask(actor, task) ||
  (fields.length > 0 &&
    fields.every((field) => field === 'status') &&
    idOf(task.assignee) === actor.id);
