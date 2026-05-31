import React from 'react';
import { 
  Project, 
  Task, 
  CalendarEvent, 
  NotificationLog 
} from '../types';
import { 
  FolderLock, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Gauge, 
  Calendar as CalendarIcon, 
  Activity, 
  User, 
  Flame 
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  events: CalendarEvent[];
  activityLogs: NotificationLog[];
  onViewChange: (view: string) => void;
}

export default function DashboardView({ 
  projects, 
  tasks, 
  events, 
  activityLogs, 
  onViewChange 
}: DashboardViewProps) {
  const currentDateStr = '2026-05-31';
  const currentDate = new Date(currentDateStr);

  // Dynamic calculations
  const activeProjectsCount = projects.filter(p => p.status !== 'Завершено').length;
  const totalTasksCount = tasks.length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'В работе').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Готово').length;

  const overdueTasksCount = tasks.filter(t => {
    if (t.status === 'Готово' || !t.deadline) return false;
    const dlDate = new Date(t.deadline);
    return dlDate < currentDate;
  }).length;

  // Let's compute team workload (number of non-completed tasks / total capacity)
  const nonCompletedTasks = tasks.filter(t => t.status !== 'Готово').length;
  const simulatedWorkload = Math.min(100, Math.round((nonCompletedTasks / (tasks.length || 1)) * 95));

  // Find 3 upcoming events (events starting on or after May 31, 2026)
  const upcomingEvents = [...events]
    .filter(e => new Date(e.date) >= currentDate)
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 3);

  // Stats definition for rendering
  const stats = [
    { 
      label: 'Активные проекты', 
      value: activeProjectsCount, 
      icon: FolderLock, 
      desc: 'Проекты в разработке', 
      colorColor: 'text-blue-600', 
      bgColor: 'bg-blue-50 border-blue-100' 
    },
    { 
      label: 'Всего задач', 
      value: totalTasksCount, 
      icon: Layers, 
      desc: 'Задач в бэклоге', 
      colorColor: 'text-indigo-600', 
      bgColor: 'bg-indigo-50 border-indigo-100' 
    },
    { 
      label: 'Задачи в работе', 
      value: inProgressTasksCount, 
      icon: Clock, 
      desc: 'Активное исполнение', 
      colorColor: 'text-amber-600', 
      bgColor: 'bg-amber-50 border-amber-100' 
    },
    { 
      label: 'Просрочено', 
      value: overdueTasksCount, 
      icon: AlertTriangle, 
      desc: `Дедлайн до ${currentDateStr}`, 
      colorColor: overdueTasksCount > 0 ? 'text-red-600' : 'text-slate-500', 
      bgColor: overdueTasksCount > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-205'
    },
    { 
      label: 'Выполнено задач', 
      value: completedTasksCount, 
      icon: CheckCircle2, 
      desc: 'Успешно закрыты', 
      colorColor: 'text-emerald-600', 
      bgColor: 'bg-emerald-50 border-emerald-100' 
    },
    { 
      label: 'Загрузка команды', 
      value: `${simulatedWorkload}%`, 
      icon: Gauge, 
      desc: 'Коэффициент занятости ресурсов', 
      colorColor: 'text-rose-600', 
      bgColor: 'bg-rose-50 border-rose-100' 
    }
  ];

  // Group task count by assignee for team capacity insight
  const assigneeStats: Record<string, { total: number; active: number }> = {};
  tasks.forEach(t => {
    if (!assigneeStats[t.assignee]) {
      assigneeStats[t.assignee] = { total: 0, active: 0 };
    }
    assigneeStats[t.assignee].total += 1;
    if (t.status !== 'Готово') {
      assigneeStats[t.assignee].active += 1;
    }
  });

  const teamList = Object.entries(assigneeStats).map(([name, stat]) => ({
    name,
    activeTasks: stat.active,
    totalTasks: stat.total,
  })).sort((a, b) => b.activeTasks - a.activeTasks);

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in">
      {/* 6 metrics bento cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div 
              key={i} 
              id={`stat-card-${i}`}
              className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-white flex flex-col justify-between ${s.bgColor}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {s.label}
                </span>
                <span className={`${s.colorColor}`}>
                  <Icon className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-black tracking-tight ${s.colorColor}`}>
                  {s.value}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1 line-clamp-1">
                  {s.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upcoming events (Ближайшие события) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:col-span-4 justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                <h2 className="font-bold text-slate-900 text-sm">Ближайшие события</h2>
              </div>
              <button 
                onClick={() => onViewChange('calendar')} 
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Все
              </button>
            </div>

            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((ev) => {
                  const dayStr = new Date(ev.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                  return (
                    <div 
                      key={ev.id} 
                      className="group flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl transition-all duration-150 hover:bg-slate-100/50"
                    >
                      <div className="w-12 shrink-0 bg-blue-100 text-blue-700 rounded-lg flex flex-col items-center justify-center p-1.5 shadow-sm text-center">
                        <span className="font-bold text-xs">{dayStr.split(' ')[0]}</span>
                        <span className="text-[9px] uppercase font-semibold text-blue-600 tracking-wider">
                          {dayStr.split(' ')[1]?.replace('.', '')}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {ev.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs">
                          <span className="font-semibold text-slate-600">{ev.time}</span>
                          <span>•</span>
                          <span className="truncate">{ev.type}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Нет приближающихся встреч
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 font-mono text-[10px] text-slate-400 flex items-center justify-between">
            <span>График синхронизирован</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>

        {/* Audit Log (Последние изменения) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-slate-900 text-sm">Журнал последних изменений</h2>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold uppercase">
              Логи
            </span>
          </div>

          <div className="space-y-4 max-h-[310px] overflow-y-auto pr-1">
            {activityLogs.map((log) => {
              const initials = log.user
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('');
              return (
                <div 
                  key={log.id} 
                  className="flex gap-3.5 pb-4.5 border-b border-slate-50 last:pb-0 last:border-b-0"
                >
                  <div className="w-8.5 h-8.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 uppercase select-none">
                    {initials}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-slate-800 leading-normal">
                      <span className="font-bold text-slate-900">{log.user}</span>{' '}
                      <span className="text-slate-500">{log.action}</span>{' '}
                      <span className="font-semibold text-blue-600 block sm:inline">
                        «{log.target}»
                      </span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-1 inline-block">
                      {log.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Capacity Workload (Загрузка сотрудников) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-slate-900 text-sm">Занятость сотрудников</h2>
          </div>

          <div className="space-y-4">
            {teamList.map((tm, idx) => {
              const loadPercent = Math.round((tm.activeTasks / 5) * 100);
              const isOverloaded = tm.activeTasks >= 4;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 truncate max-w-40">{tm.name.split(' ').slice(0, 2).join(' ')}</span>
                    <span className={`font-mono text-xs font-bold ${isOverloaded ? 'text-red-500' : 'text-slate-600'}`}>
                      {tm.activeTasks} акт.
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverloaded ? 'bg-red-500' : tm.activeTasks >= 2 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(15, loadPercent))}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
