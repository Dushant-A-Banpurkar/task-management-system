import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Download, MessageSquare, Pencil, Search, Trash2 } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { TaskCommentsModal } from '../components/TaskCommentsModal';
import type { Task, UserRole } from '../types';

const priorityColors: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-300',
  medium: 'bg-amber-500/15 text-amber-300',
  high: 'bg-rose-500/15 text-rose-300',
};

const escapeCsv = (value: string): string => {
  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
};

export function TasksPage({
  currentUserId,
  role,
  onEditTask,
}: {
  currentUserId: string;
  role: UserRole;
  onEditTask: (task: Task) => void;
}) {
  const { tasks, isLoading, isError, deleteMutation, updateMutation } = useTasks();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [commentsTask, setCommentsTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const exportCsv = () => {
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Due date', 'Assignee', 'Created by'];
    const rows = filteredTasks.map((task) => [
      task.title,
      task.description,
      task.status,
      task.priority,
      task.dueDate ? new Date(task.dueDate).toISOString() : '',
      task.assignee?.name ?? '',
      task.createdBy?.name ?? '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => escapeCsv(String(value))).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'taskflow-tasks.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const canManage = (task: Task) =>
    role === 'admin' && currentUserId !== '' ||
    String(task.createdBy?.id ?? task.createdBy?._id ?? '') === currentUserId;

  const toggleTaskStatus = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    updateMutation.mutate({ id: String(task._id ?? task.id), status: nextStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Manage</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Tasks</h1>
        </div>
        <button onClick={exportCsv} disabled={!filteredTasks.length} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm disabled:opacity-50">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="grid gap-3 md:grid-cols-[1.1fr_0.6fr_0.6fr]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks by title" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-white outline-none focus:border-violet-500" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-violet-500">
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-violet-500">
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">Loading tasks...</div>
        ) : isError ? (
          <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-rose-300">Unable to load tasks. Please try again.</div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">No tasks match your filters.</div>
        ) : (
          filteredTasks.map((task) => (
            <div key={String(task._id ?? task.id)} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">{task.title}</h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority] || 'bg-slate-700 text-slate-300'}`}>{task.priority}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{task.status.replace('_', ' ')}</span>
                  </div>
                  <p className="max-w-2xl text-sm text-slate-300">{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <span>Due: {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No date'}</span>
                    <span>Assignee: {task.assignee?.name || 'Unassigned'}</span>
                    <span>Created by: {task.createdBy?.name || 'System'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => toggleTaskStatus(task)} disabled={updateMutation.isPending} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700 disabled:opacity-50">
                    {task.status === 'completed' ? 'Reopen' : 'Mark done'}
                  </button>
                  <button onClick={() => setCommentsTask(task)} className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700" aria-label={`Comments for ${task.title}`}>
                    <MessageSquare size={16} />
                  </button>
                  {canManage(task) && (
                    <>
                      <button onClick={() => onEditTask(task)} className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700" aria-label={`Edit ${task.title}`}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(String(task._id ?? task.id))} disabled={deleteMutation.isPending} className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20 disabled:opacity-50" aria-label={`Delete ${task.title}`}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <TaskCommentsModal task={commentsTask} onClose={() => setCommentsTask(null)} />
    </div>
  );
}
