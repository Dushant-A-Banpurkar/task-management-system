import { useState } from 'react';
import { MessageSquare, Pencil } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskCommentsModal } from '../components/TaskCommentsModal';
import type { Task, TaskStatus, UserRole } from '../types';

const columns: Array<{ status: TaskStatus; title: string }> = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'completed', title: 'Completed' },
];

export function KanbanPage({
  currentUserId,
  role,
  onEditTask,
}: {
  currentUserId: string;
  role: UserRole;
  onEditTask: (task: Task) => void;
}) {
  const { tasks, isLoading, isError, updateMutation } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [commentsTask, setCommentsTask] = useState<Task | null>(null);

  const canManage = (task: Task) =>
    (role === 'admin' && currentUserId !== '') ||
    String(task.createdBy?.id ?? task.createdBy?._id ?? '') === currentUserId;

  const moveTask = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((candidate) => String(candidate._id ?? candidate.id) === taskId);
    if (task && task.status !== status) {
      updateMutation.mutate({ id: taskId, status });
    }
  };

  if (isLoading) return <p className="text-slate-400">Loading tasks...</p>;
  if (isError) return <p role="alert" className="text-rose-300">Unable to load tasks. Please try again.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Plan and track</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Kanban board</h1>
        <p className="mt-2 text-sm text-slate-400">Drag a task into another column to update its status.</p>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <section
            key={column.status}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const taskId = event.dataTransfer.getData('text/plain') || draggedTaskId;
              if (taskId) moveTask(taskId, column.status);
              setDraggedTaskId(null);
            }}
            className="min-h-64 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            aria-label={`${column.title} tasks`}
          >
            <h2 className="mb-4 flex items-center justify-between font-semibold text-white">
              {column.title}
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                {tasks.filter((task) => task.status === column.status).length}
              </span>
            </h2>
            <div className="space-y-3">
              {tasks.filter((task) => task.status === column.status).map((task) => {
                const taskId = String(task._id ?? task.id);
                return (
                  <article
                    key={taskId}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', taskId);
                      event.dataTransfer.effectAllowed = 'move';
                      setDraggedTaskId(taskId);
                    }}
                    onDragEnd={() => setDraggedTaskId(null)}
                    className="cursor-grab rounded-xl border border-slate-700 bg-slate-950 p-4 active:cursor-grabbing"
                  >
                    <h3 className="font-medium text-white">{task.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-400">{task.description}</p>
                    <p className="mt-3 text-xs text-slate-500">Priority: {task.priority} · Assignee: {task.assignee?.name ?? 'Unassigned'}</p>
                    <label className="mt-3 block text-xs text-slate-400">
                      Status
                      <select
                        value={task.status}
                        onChange={(event) => moveTask(taskId, event.target.value as TaskStatus)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-200"
                      >
                        {columns.map((option) => <option key={option.status} value={option.status}>{option.title}</option>)}
                      </select>
                    </label>
                    <div className="mt-3 flex items-center justify-between">
                      <button onClick={() => setCommentsTask(task)} className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white">
                        <MessageSquare size={14} /> Comments
                      </button>
                      {canManage(task) && (
                        <button onClick={() => onEditTask(task)} className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white">
                          <Pencil size={14} /> Edit
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
              {tasks.every((task) => task.status !== column.status) && (
                <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">Drop a task here</p>
              )}
            </div>
          </section>
        ))}
      </div>
      {updateMutation.isError && <p role="alert" className="text-sm text-rose-300">Unable to update task status.</p>}
      <TaskCommentsModal task={commentsTask} onClose={() => setCommentsTask(null)} />
    </div>
  );
}
