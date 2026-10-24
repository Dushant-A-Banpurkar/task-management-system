import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUsers } from '../hooks/useTasks';
import type { Task } from '../types';

const taskSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 chars'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'completed']),
  dueDate: z.string().optional().or(z.literal('')),
  assigneeId: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskFormModal({
  isOpen,
  task,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  task?: Task | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const usersQuery = useUsers(isOpen);
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'medium',
      status: task?.status ?? 'todo',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
      assigneeId: task?.assignee?.id ?? task?.assignee?._id ?? '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        priority: task?.priority ?? 'medium',
        status: task?.status ?? 'todo',
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
        assigneeId: task?.assignee?.id ?? task?.assignee?._id ?? '',
      });
    }
  }, [isOpen, task, form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold">{task ? 'Edit Task' : 'Create Task'}</h3>
          <button onClick={onClose} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200">Close</button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Title</label>
            <input {...form.register('title')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none ring-0 focus:border-violet-500" />
            {form.formState.errors.title && <p className="mt-1 text-xs text-rose-400">{form.formState.errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Description</label>
            <textarea {...form.register('description')} rows={4} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 outline-none focus:border-violet-500" />
            {form.formState.errors.description && <p className="mt-1 text-xs text-rose-400">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Priority</label>
              <select {...form.register('priority')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Status</label>
              <select {...form.register('status')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Due date</label>
            <input type="date" {...form.register('dueDate')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Assignee</label>
            <select {...form.register('assigneeId')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5">
              <option value="">Unassigned</option>
              {usersQuery.data?.map((user) => (
                <option key={user.id ?? user._id} value={user.id ?? user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {usersQuery.isError && <p className="mt-1 text-xs text-rose-400">Unable to load team members.</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2.5 text-slate-200">Cancel</button>
            <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 font-medium text-white hover:bg-violet-500">
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
