import type { ReactNode } from 'react';

export function StatCard({ label, value, icon, accentClass }: { label: string; value: string | number; icon: ReactNode; accentClass?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm shadow-slate-950/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClass ?? 'bg-violet-500/20 text-violet-300'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
