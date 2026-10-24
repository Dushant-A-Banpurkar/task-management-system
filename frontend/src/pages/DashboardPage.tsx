import { AlarmClockCheck, CheckCheck, ClipboardList, CircleDashed } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useTasks } from '../hooks/useTasks';
import { StatCard } from '../components/StatCard';

const COLORS = ['#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

export function DashboardPage() {
  const { tasks } = useTasks();

  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
  const overdue = tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed').length;

  const chartData = [
    { name: 'Todo', value: tasks.filter((task) => task.status === 'todo').length },
    { name: 'In Progress', value: inProgress },
    { name: 'Completed', value: completed },
  ];

  const priorityData = [
    { name: 'Low', value: tasks.filter((task) => task.priority === 'low').length },
    { name: 'Medium', value: tasks.filter((task) => task.priority === 'medium').length },
    { name: 'High', value: tasks.filter((task) => task.priority === 'high').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Dashboard</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tasks" value={total} icon={<ClipboardList size={18} />} accentClass="bg-violet-500/20 text-violet-300" />
        <StatCard label="Pending" value={tasks.filter((task) => task.status !== 'completed').length} icon={<CircleDashed size={18} />} accentClass="bg-amber-500/20 text-amber-300" />
        <StatCard label="Completed" value={completed} icon={<CheckCheck size={18} />} accentClass="bg-emerald-500/20 text-emerald-300" />
        <StatCard label="Overdue" value={overdue} icon={<AlarmClockCheck size={18} />} accentClass="bg-rose-500/20 text-rose-300" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Task Status</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Priority Mix</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {priorityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
