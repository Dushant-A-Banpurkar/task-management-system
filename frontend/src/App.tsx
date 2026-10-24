import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TaskFormModal, type TaskFormValues } from './components/TaskFormModal';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TasksPage } from './pages/TasksPage';
import { KanbanPage } from './pages/KanbanPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminSetupPage } from './pages/AdminSetupPage';
import type { Task } from './types';

const queryClient = new QueryClient();

function AppShell() {
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { createMutation, updateMutation } = useTasks();

  const handleTaskModalClose = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskSubmit = (values: TaskFormValues) => {
    if (editingTask) {
      updateMutation.mutate(
        { id: String(editingTask._id ?? editingTask.id), ...values },
        { onSuccess: handleTaskModalClose }
      );
      return;
    }

    createMutation.mutate(values, { onSuccess: handleTaskModalClose });
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-950 p-8 text-slate-300">Loading account...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        <Sidebar userName={user.name} role={user.role} onCreateTask={() => { setEditingTask(null); setModalOpen(true); }} />

        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-6 flex justify-end">
            <button onClick={logout} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
              Logout
            </button>
          </div>

          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage currentUserId={user.id} role={user.role} onEditTask={(task) => { setEditingTask(task); setModalOpen(true); }} />} />
            <Route path="/kanban" element={<KanbanPage currentUserId={user.id} role={user.role} onEditTask={(task) => { setEditingTask(task); setModalOpen(true); }} />} />
            {user.role === 'admin' && <Route path="/users" element={<UsersPage />} />}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <TaskFormModal isOpen={modalOpen} task={editingTask} onClose={handleTaskModalClose} onSubmit={handleTaskSubmit} />
    </div>
  );
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      {token ? (
        <AppShell />
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/setup-admin" element={<AdminSetupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
