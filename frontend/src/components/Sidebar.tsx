import { BarChart3, CheckSquare, Columns3, Plus, Settings, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import type { UserRole } from '../types';

const navItems = [
  { label: 'Dashboard', icon: BarChart3, to: '/' },
  { label: 'Tasks', icon: CheckSquare, to: '/tasks' },
  { label: 'Kanban', icon: Columns3, to: '/kanban' },
  { label: 'Users', icon: Users, to: '/users' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export function Sidebar({ onCreateTask, userName, role }: { onCreateTask: () => void; userName?: string; role: UserRole }) {
  const location = useLocation();
  const visibleNavItems = navItems.filter(({ to }) => role === 'admin' || to !== '/users');

  return (
    <aside className="flex h-screen flex-col border-r border-slate-800 bg-slate-950/90 px-4 py-6 text-slate-200">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-violet-400">Swan</p>
          <h2 className="mt-1 text-xl font-semibold">TaskFlow</h2>
        </div>
        <button
          onClick={onCreateTask}
          className="rounded-xl bg-violet-600 p-2 text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-500"
          aria-label="Create task"
        >
          <Plus size={18} />
        </button>
      </div>

      <nav className="space-y-2">
        {visibleNavItems.map(({ label, icon: Icon, to }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={label}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Signed in</p>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">{userName || 'User'}</p>
            <p className="text-xs capitalize text-slate-400">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
