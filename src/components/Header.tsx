import React, { useState, useEffect } from 'react';
import { User, Bell, Clock, Building2 } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType;
  currentView: string;
}

export default function Header({ user, currentView }: HeaderProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Главная панель', subtitle: 'Сводные данные, аналитика реального времени и события' },
    projects: { title: 'Управление проектами', subtitle: 'Реестр глобальных проектов организации, планирование и прогресс' },
    tasks: { title: 'Задачи компании', subtitle: 'Полнофункциональный список поручений со статусами и приоритетами' },
    kanban: { title: 'Канбан-доска', subtitle: 'Интерактивная визуализация производственного процесса департаментов' },
    calendar: { title: 'Календарь событий', subtitle: 'График дедлайнов, проектных встреч, контрольных точек и спринтов' },
    wiki: { title: 'База знаний (Wiki)', subtitle: 'Корпоративные регламенты, документация проектов, инструкции и FAQ' },
    reports: { title: 'Отчетность и аналитика', subtitle: 'Сводные графики, загрузка исполнителей, экспорт отчетов' },
    ai: { title: 'Интеллектуальный помощник', subtitle: 'ИИ-чатбот, генератор регламентов и конструктор проектных схем' },
    users: { title: 'Права и доступы', subtitle: 'Управление корпоративными аккаунтами, назначение ролей и отделов' },
    profile: { title: 'Личный кабинет', subtitle: 'Персональная информация сотрудника, личная статистика и дедлайны' },
  };

  const currentMeta = viewTitles[currentView] || { title: 'Онлайн-офис', subtitle: 'Информационная система управления' };

  return (
    <header id="app-header" className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-40 relative shadow-sm">
      {/* Title & subtitle details */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {currentMeta.title}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl truncate">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Profile/System widgets */}
      <div className="flex items-center gap-6">
        {/* Real-time UTC status clock */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-lg text-slate-600">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-mono text-xs font-semibold">{time || '12:00'}</span>
          <span className="text-[10px] bg-blue-500/10 text-blue-600 font-bold px-1 py-0.5 rounded ml-1 uppercase">
            MCK
          </span>
        </div>

        {/* User profile avatar info */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="text-right">
            <h3 className="text-xs font-bold text-slate-800">{user.name}</h3>
            <div className="flex items-center justify-end gap-1.5 text-slate-500 mt-0.5">
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {user.role}
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">•</span>
              <span className="text-[10px] text-slate-500 max-w-32 truncate hidden sm:inline">
                {user.dept}
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/10 select-none">
            {user.name ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ПО'}
          </div>
        </div>
      </div>
    </header>
  );
}
