import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { api } from '../services/api';
import type { AuthResponse } from '../types';

const setupSchema = z.object({
  name: z.string().min(2, 'Name must contain at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
  adminKey: z.string().min(1, 'Setup key is required'),
});

type SetupValues = z.infer<typeof setupSchema>;

export function AdminSetupPage() {
  const statusQuery = useQuery({
    queryKey: ['admin-setup-status'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { setupAvailable: boolean } }>('/auth/admin-setup-status');
      return data.data.setupAvailable;
    },
    retry: false,
  });
  const setupMutation = useMutation({
    mutationFn: async (values: SetupValues) => {
      const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/setup-admin', values);
      return data.data;
    },
    onSuccess: ({ token }) => {
      localStorage.setItem('taskToken', token);
      window.location.href = '/';
    },
  });
  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: { name: '', email: '', password: '', adminKey: '' },
  });

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-400">One-time setup</p>
        <h1 className="mt-4 text-3xl font-bold text-white">Create the first admin</h1>
        <p className="mt-2 text-sm text-slate-400">The setup key is validated by the server and is never stored in the browser.</p>

        {statusQuery.isLoading ? (
          <p className="mt-8 text-slate-400">Checking admin setup...</p>
        ) : statusQuery.isError ? (
          <p role="alert" className="mt-8 text-rose-400">Unable to check admin setup. Try again later.</p>
        ) : !statusQuery.data ? (
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <p>Admin setup is unavailable. It may already have been completed or the server setup key is not configured.</p>
            <Link to="/login" className="text-violet-300 hover:text-violet-200">Return to sign in</Link>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit((values) => setupMutation.mutate(values))} className="mt-8 space-y-4">
            {([
              ['name', 'Full name', 'text'],
              ['email', 'Email', 'email'],
              ['password', 'Password', 'password'],
              ['adminKey', 'Server setup key', 'password'],
            ] as const).map(([field, label, type]) => (
              <div key={field}>
                <label htmlFor={field} className="mb-1.5 block text-sm text-slate-300">{label}</label>
                <input
                  id={field}
                  type={type}
                  autoComplete={field === 'adminKey' ? 'off' : field === 'password' ? 'new-password' : field}
                  {...form.register(field)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-violet-500"
                />
                {form.formState.errors[field] && <p className="mt-1 text-xs text-rose-400">{form.formState.errors[field]?.message}</p>}
              </div>
            ))}
            {setupMutation.isError && <p role="alert" className="text-sm text-rose-400">Admin setup failed. Verify the setup key and try again.</p>}
            <button type="submit" disabled={setupMutation.isPending} className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-60">
              {setupMutation.isPending ? 'Creating admin...' : 'Create admin account'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
