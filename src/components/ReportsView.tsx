import React, { useState } from 'react';
import { Task, Project } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DownloadCloud, 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  AlertCircle, 
  TrendingDown, 
  Layers 
} from 'lucide-react';

interface ReportsProps {
  tasks: Task[];
  projects: Project[];
  onNotify: (msg: string) => void;
}

export default function ReportsView({ tasks, projects, onNotify }: ReportsProps) {
  const [exportingType, setExportingType] = useState<'excel' | 'pdf' | null>(null);

  // Computations
  const totalTasks = tasks.length || 1;
  const statusCounts = {
    'Открыта': tasks.filter(t => t.status === 'Открыта').length,
    'В работе': tasks.filter(t => t.status === 'В работе').length,
    'На проверке': tasks.filter(t => t.status === 'На проверке').length,
    'Готово': tasks.filter(t => t.status === 'Готово').length,
  };

  const priorityCounts = {
    'Низкий': tasks.filter(t => t.priority === 'Низкий').length,
    'Средний': tasks.filter(t => t.priority === 'Средний').length,
    'Высокий': tasks.filter(t => t.priority === 'Высокий').length,
    'Критический': tasks.filter(t => t.priority === 'Критический').length,
  };

  // Assignee mapping
  const assigneeStats: Record<string, { total: number; done: number; inWork: number }> = {};
  tasks.forEach(t => {
    if (!assigneeStats[t.assignee]) {
      assigneeStats[t.assignee] = { total: 0, done: 0, inWork: 0 };
    }
    assigneeStats[t.assignee].total += 1;
    if (t.status === 'Готово') assigneeStats[t.assignee].done += 1;
    if (t.status === 'В работе') assigneeStats[t.assignee].inWork += 1;
  });

  const currentDate = new Date('2026-05-31');
  const totalOverdue = tasks.filter(t => t.status !== 'Готово' && t.deadline && new Date(t.deadline) < currentDate).length;

  const handleExport = (format: 'excel' | 'pdf') => {
    setExportingType(format);
    onNotify('Запрос на экспорт передан в подсистему генерации документов...');
    
    setTimeout(() => {
      setExportingType(null);
      const ext = format === 'excel' ? 'XLSX' : 'PDF';
      onNotify(`Отчет сформирован и отправлен на печать в формате ${ext}`);
    }, 2000);
  };

  return (
    <div id="reports-view" className="space-y-6 animate-fade-in">
      {/* Top action header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-slate-950 text-sm">Сводная аналитика компании</h3>
          <p className="text-xs text-slate-500 font-medium">Статистика выполнения планов, загрузка исполнителей и дедлайн-контроль</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            disabled={exportingType !== null}
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-150 rounded-xl flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {exportingType === 'excel' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
            <span>Экспорт XLS</span>
          </button>

          <button
            disabled={exportingType !== null}
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-50 hover:bg-red-100/80 text-red-800 text-xs font-bold border border-red-150 rounded-xl flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {exportingType === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            <span>Экспорт PDF</span>
          </button>
        </div>
      </div>

      {/* Main KPI charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Task statuses breakdowm (CSS Meter graphs) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Статусы задач по компании</h4>
          
          <div className="space-y-4">
            {(Object.keys(statusCounts) as Array<keyof typeof statusCounts>).map((status) => {
              const count = statusCounts[status];
              const percent = Math.round((count / totalTasks) * 100);

              let colBar = 'bg-slate-400';
              if (status === 'В работе') colBar = 'bg-blue-500';
              if (status === 'На проверке') colBar = 'bg-purple-500';
              if (status === 'Готово') colBar = 'bg-emerald-500';

              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{status}</span>
                    <span className="text-slate-500 font-mono font-bold">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colBar}`} style={{ width: `${percent || 5}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold">Всего в бэклоге:</span>
            <span className="font-mono font-bold text-slate-800">{tasks.length} зафиксировано</span>
          </div>
        </div>

        {/* Project Compliances (Эффективность по проектам) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Процент выполнения проектов</h4>
            <span className="text-[10px] text-blue-600 bg-blue-50 font-bold px-2 py-0.5 rounded font-mono uppercase border border-blue-100">
              Выполнение
            </span>
          </div>

          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold leading-normal">
                  <span className="text-slate-800 truncate max-w-[220px]">{p.title}</span>
                  <span className="font-mono text-slate-600">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Critical Area Warning (Красная зона контроля) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 select-none">Зона контроля рисков</h4>
          
          <div className="py-6 text-center space-y-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border shadow-xs ${
              totalOverdue > 0 
                ? 'bg-red-50 text-red-500 border-red-150 animate-pulse' 
                : 'bg-emerald-50 text-emerald-500 border-emerald-150'
            }`}>
              <AlertCircle className="w-7 h-7" />
            </div>
            
            <div>
              <span className={`text-[10px] font-bold uppercase block tracking-widest ${
                totalOverdue > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {totalOverdue > 0 ? 'Критический риск' : 'Показатели в норме'}
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1 inline-block">
                {totalOverdue}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-1 leading-normal">задач просрочено на текущий момент</span>
            </div>
          </div>

          <div className="bg-slate-50 border p-3 rounded-xl text-[10px] text-slate-500 font-medium text-center leading-normal">
            {totalOverdue > 0 
              ? 'Рекомендуется перераспределить задачи в бэклоге исполнителей.' 
              : 'Все дедлайны по проектам строго соблюдаются.'}
          </div>
        </div>
      </div>

      {/* Staff individual performance bars (Эффективность исполнителей) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Индивидуальные показатели исполнителей</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(assigneeStats).map(([name, stat]) => {
            const performancePct = Math.round((stat.done / (stat.total || 1)) * 100);

            return (
              <div key={name} className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-105 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-black select-none">
                    {name.split(' ')[0][0]}{name.split(' ')[1]?.[0] || ''}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-slate-900 block truncate">{name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">Всего поручений: {stat.total}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 text-center text-[10px] font-bold text-slate-500 divide-x select-none">
                  <div>
                    <span className="block text-slate-400 text-[8px] uppercase">В работе</span>
                    <span className="text-blue-600 font-mono text-sm block mt-0.5">{stat.inWork}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[8px] uppercase font-semibold">Сдано</span>
                    <span className="text-emerald-600 font-mono text-sm block mt-0.5">{stat.done}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[8px] uppercase font-semibold">КД (%)</span>
                    <span className="text-indigo-600 font-mono text-sm block mt-0.5">{performancePct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
