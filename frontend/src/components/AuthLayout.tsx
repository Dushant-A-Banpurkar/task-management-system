import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-slate-950/40 lg:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-100/80">Swan Digital</p>
              <h1 className="mt-6 text-4xl font-bold leading-tight">Task Management System</h1>
            </div>
            <div className="space-y-4 text-sm text-indigo-50/80">
              <p>Track work, assign tasks, and keep teams aligned.</p>
              <p>Built for productivity, visibility, and faster execution.</p>
            </div>
          </div>
          <div className="p-6 sm:p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
