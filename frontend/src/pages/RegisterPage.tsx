import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function RegisterPage() {
  const { registerMutation } = useAuth();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = (values: { name: string; email: string; password: string }) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        window.location.href = '/';
      },
    });
  };

  return (
    <AuthLayout>
      <div className="mx-auto max-w-md">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-400">Create account</p>
        <h2 className="mt-4 text-3xl font-bold text-white">Register</h2>
        <p className="mt-2 text-sm text-slate-400">Set up your workspace and start managing work.</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Full name</label>
            <input {...form.register('name')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-violet-500" placeholder="Jane Doe" />
            {form.formState.errors.name && <p className="mt-1 text-xs text-rose-400">{form.formState.errors.name.message}</p>}
          </div>

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

          <button type="submit" disabled={registerMutation.isPending} className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
