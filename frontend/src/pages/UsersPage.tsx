import { useUsers } from '../hooks/useTasks';

export function UsersPage() {
  const usersQuery = useUsers();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Team members</h1>
      </div>
      {usersQuery.isLoading ? (
        <p className="text-slate-400">Loading team members...</p>
      ) : usersQuery.isError ? (
        <p role="alert" className="text-rose-300">Unable to load team members.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {usersQuery.data?.map((user) => (
            <div key={user.id ?? user._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-4 last:border-0">
              <div>
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs capitalize text-violet-300">{user.role}</span>
            </div>
          ))}
          {!usersQuery.data?.length && <p className="p-5 text-slate-400">No team members found.</p>}
        </div>
      )}
    </div>
  );
}
