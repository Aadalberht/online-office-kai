import React from 'react';
import { Task, Project } from '../types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  User, 
  Folder, 
  CheckCircle2, 
  CornerDownRight,
  TrendingDown
} from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  projects: Project[];
  onNotify: (msg: string) => void;
  onActivityLog: (log: { user: string; action: string; target: string }) => void;
  username: string;
}

const COLUMNS = [
  { id: 'Открыта', label: 'Открыта', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'В работе', label: 'В работе', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'На проверке', label: 'На проверке', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'Готово', label: 'Готово', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
] as const;

export default function KanbanView({
  tasks,
  setTasks,
  projects,
  onNotify,
  onActivityLog,
  username
}: KanbanViewProps) {

  const handleMoveStatus = (id: number, direction: 'forward' | 'backward', currentStatus: string) => {
    let nextIndex = 0;
    const statuses = ['Открыта', 'В работе', 'На проверке', 'Готово'];
    const currentIndex = statuses.indexOf(currentStatus);

    if (direction === 'forward') {
      nextIndex = Math.min(statuses.length - 1, currentIndex + 1);
    } else {
      nextIndex = Math.max(0, currentIndex - 1);
    }

    const nextStatus = statuses[nextIndex];
    if (nextStatus === currentStatus) return;

    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        onActivityLog({
          user: username,
          action: `переместил в статус «${nextStatus}» задачу`,
          target: t.title
        });
        return { ...t, status: nextStatus as any };
      }
      return t;
    }));

    onNotify(`Задача перемещена в статус «${nextStatus}»`);
  };

  // Drag and drop mechanics
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('text/plain', taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('text/plain');
    if (!idStr) return;
    const taskId = Number(idStr);

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (t.status === colId) return t;
        onActivityLog({
          user: username,
          action: `перетащил в колонку «${colId}» задачу`,
          target: t.title
        });
        onNotify(`Статус изменен на «${colId}»`);
        return { ...t, status: colId as any };
      }
      return t;
    }));
  };

  return (
    <div id="kanban-view" className="space-y-6 animate-fade-in">
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-bold text-slate-950 text-sm">Визуальный рабочий процесс</h3>
          <p className="text-xs text-slate-500 font-medium">Перетаскивайте карточки задач между колонками или используйте стрелки переключения</p>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-xl uppercase border">
          Автосохранение активно
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 min-h-[600px] items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <div 
              key={col.id} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 px-1 select-none">
                <span className="text-xs font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
                  {col.label} 
                </span>
                <span className="text-xs font-black bg-white rounded-lg px-2.5 py-1 text-slate-600 border border-slate-200 font-mono shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div id={`kanban-column-${col.id}`} className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1 scrollbar-thin">
                {colTasks.length > 0 ? (
                  colTasks.map((t) => {
                    const corrProj = projects.find(p => p.id === t.projectId);
                    
                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all hover:border-blue-400 group relative"
                      >
                        {/* Priority Badge */}
                        <div className="flex items-center justify-between gap-2.5 mb-2.5 select-none">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            t.priority === 'Критический' ? 'bg-red-500 text-white shadow-xs' :
                            t.priority === 'Высокий' ? 'bg-orange-500 text-white' :
                            t.priority === 'Средний' ? 'bg-blue-500 text-white' : 'bg-slate-400 text-white'
                          }`}>
                            {t.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">ID {t.id.toString().substring(0, 4)}</span>
                        </div>

                        {/* Task Title */}
                        <h4 className="font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors text-xs line-clamp-2">
                          {t.title}
                        </h4>

                        {/* Project Context */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-2.5 truncate select-none">
                          <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{corrProj?.title || 'Проект удален'}</span>
                        </div>

                        {/* Bottom Assignment & Deadline row */}
                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 select-none">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-700 font-bold overflow-hidden">
                            <div className="w-5 h-5 rounded-full bg-slate-150 flex items-center justify-center text-[8px] text-slate-600 font-bold shrink-0">
                              {t.assignee.split('')[0] || 'И'}
                            </div>
                            <span className="truncate max-w-[90px]">{t.assignee.split(' ')[0]}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono font-medium shrink-0 bg-slate-50 border px-1.5 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{t.deadline.substring(5)}</span>
                          </div>
                        </div>

                        {/* Status switcher arrows (Назад / Вперед) */}
                        <div className="flex justify-between items-center gap-1 mt-3 pt-2.5 border-t border-dashed border-slate-100">
                          <button
                            disabled={col.id === 'Открыта'}
                            onClick={() => handleMoveStatus(t.id, 'backward', t.status)}
                            className="flex-1 flex justify-center items-center py-1 rounded bg-slate-50 text-slate-500 border border-slate-150 hover:bg-slate-150 text-[10px] font-semibold transition disabled:opacity-30 disabled:pointer-events-none"
                            title="Назад"
                          >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                            <span>Назад</span>
                          </button>
                          
                          <button
                            disabled={col.id === 'Готово'}
                            onClick={() => handleMoveStatus(t.id, 'forward', t.status)}
                            className="flex-1 flex justify-center items-center py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 text-[10px] font-semibold transition disabled:opacity-30 disabled:pointer-events-none"
                            title="Вперед"
                          >
                            <span>Вперед</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 text-[10px] font-bold border border-dashed border-slate-220 rounded-xl select-none">
                    Пусто
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
