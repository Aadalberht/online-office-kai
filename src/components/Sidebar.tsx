import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  ListTodo, 
  Kanban, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Sparkles, 
  Users, 
  User, 
  LogOut 
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  user: UserType;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, currentView, onViewChange, onLogout }: SidebarProps) {
  // Navigation authorization checks
  const canSeeReports = user.role === 'Руководитель проекта' || user.role === 'Директор';
  const canSeeUsers = user.role === 'Администратор';

  const menuItems = [
    { id: 'dashboard', label: 'Главная панель', icon: LayoutDashboard },
    { id: 'projects', label: 'Проекты', icon: Briefcase },
    { id: 'tasks', label: 'Задачи', icon: ListTodo },
    { id: 'kanban', label: 'Канбан-доска', icon: Kanban },
    { id: 'calendar', label: 'Календарь', icon: Calendar },
    { id: 'wiki', label: 'База знаний', icon: BookOpen },
    ...(canSeeReports ? [{ id: 'reports', label: 'Отчеты и аналитика', icon: BarChart3 }] : []),
    { id: 'ai', label: 'ИИ-помощник', icon: Sparkles },
    ...(canSeeUsers ? [{ id: 'users', label: 'Пользователи и роли', icon: Users }] : []),
    { id: 'profile', label: 'Личный кабинет', icon: User },
  ];

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 text-slate-350 flex flex-col h-full shadow-xl">
      {/* App brand header */}
      <div className="h-16 px-6 flex items-center border-b border-slate-800 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Briefcase className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight block">
              Онлайн-Офис
            </span>
            <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block">
              система управления
            </span>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2 select-none">
          Разделы системы
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-200 text-left group border text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500/10 shadow-lg shadow-blue-500/15'
                    : 'text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <IconComponent className={`w-4.5 h-4.5 transition-transform duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-1 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
            {user.name.split('')[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-blue-400 font-medium truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 text-left text-xs font-semibold"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
          <span>Выйти из системы</span>
        </button>
      </div>
    </div>
  );
}
