import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginPage() {
  const { loginMutation } = useAuth();
  const adminSetupQuery = useQuery({
    queryKey: ['admin-setup-status'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: { setupAvailable: boolean } }>('/auth/admin-setup-status');
      return data.data.setupAvailable;
    },
    retry: false,
  });

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: { email: string; password: string }) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        window.location.href = '/';
      },
    });
  };

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-400">Welcome back</p>
        <h2 className="mt-4 text-3xl font-bold text-white">Sign in</h2>
        <p className="mt-2 text-sm text-slate-400">Access your task dashboard and team workspace.</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Email</label>
            <input {...form.register('email')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-violet-500" placeholder="you@example.com" />
            {form.formState.errors.email && <p className="mt-1 text-xs text-rose-400">{form.formState.errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Password</label>
            <input type="password" {...form.register('password')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-violet-500" placeholder="••••••••" />
            {form.formState.errors.password && <p className="mt-1 text-xs text-rose-400">{form.formState.errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loginMutation.isPending} className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {loginMutation.isError && <p role="alert" className="mt-4 text-center text-sm text-rose-400">Unable to sign in. Check your credentials and try again.</p>}
        <p className="mt-6 text-center text-sm text-slate-400">
          New here? <Link to="/register" className="text-violet-300 hover:text-violet-200">Create an account</Link>
        </p>
        {adminSetupQuery.data && (
          <p className="mt-3 text-center text-sm text-slate-400">
            First administrator? <Link to="/setup-admin" className="text-violet-300 hover:text-violet-200">Set up admin account</Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
