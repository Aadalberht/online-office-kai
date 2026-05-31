import React, { useState } from 'react';
import { Project, User, UserRole } from '../types';
import { 
  Plus, 
  FolderPlus, 
  Calendar, 
  User as UserIcon, 
  X, 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentUser: User;
  onNotify: (msg: string) => void;
  onActivityLog: (log: { user: string; action: string; target: string }) => void;
}

export default function ProjectsView({
  projects,
  setProjects,
  currentUser,
  onNotify,
  onActivityLog,
}: ProjectsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Все');

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [lead, setLead] = useState(currentUser.name);
  const [start, setStart] = useState('2026-06-01');
  const [end, setEnd] = useState('2026-12-31');
  const [status, setStatus] = useState<any>('Планирование');
  const [progress, setProgress] = useState(0);

  // Checks
  const canModify = currentUser.role === 'Руководитель проекта' || currentUser.role === 'Администратор';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) {
      onNotify('Пожалуйста, заполните основные поля');
      return;
    }

    const newProject: Project = {
      id: Date.now(),
      title,
      desc,
      lead,
      start,
      end,
      status,
      progress: Number(progress),
    };

    setProjects(prev => [...prev, newProject]);
    setShowModal(false);
    onNotify('Проект успешно добавлен в систему');
    onActivityLog({
      user: currentUser.name,
      action: 'зарегистрировал проект',
      target: title
    });

    // Reset Form state
    setTitle('');
    setDesc('');
    setLead(currentUser.name);
    setStart('2026-06-01');
    setEnd('2026-12-31');
    setStatus('Планирование');
    setProgress(0);
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.lead.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Все' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="projects-view" className="space-y-6 animate-fade-in">
      {/* Control panel search & buttons */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по проектам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            {['Все', 'Планирование', 'В работе', 'Завершено'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {canModify && (
          <button
            onClick={() => setShowModal(true)}
            id="btn-create-project"
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Создать проект</span>
          </button>
        )}
      </div>

      {/* Projects roster cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold select-none">
                <th className="px-6 py-4.5">Название и описание</th>
                <th className="px-6 py-4.5">Руководитель проекта</th>
                <th className="px-6 py-4.5">Интервал дат</th>
                <th className="px-6 py-4.5">Статус</th>
                <th className="px-6 py-4.5">Прогресс выполнения</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition duration-150 group">
                    <td className="px-6 py-4 max-w-sm">
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
                        {p.desc}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {p.lead.split('')[0] || 'Р'}
                        </div>
                        <span>{p.lead}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      <div className="flex flex-col">
                        <span>с {p.start}</span>
                        <span className="text-slate-400">до {p.end}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'Завершено' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : p.status === 'В работе' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-105' 
                          : p.status === 'На проверке'
                          ? 'bg-purple-50 text-purple-700 border border-purple-105'
                          : 'bg-slate-50 text-slate-600 border border-slate-105'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 w-52">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              p.status === 'Завершено' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${p.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 font-mono w-8 text-right">
                          {p.progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 text-xs font-semibold">
                    Проекты по заданному фильтру не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6.5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2.5">
                <FolderPlus className="w-5.5 h-5.5 text-blue-500" />
                <h3 className="text-lg font-black text-slate-900">Создать новый проект</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Название проекта *
                </label>
                <input 
                  type="text"
                  required 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Например, Интеграция складского учёта..."
                  className="w-full border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Краткое описание *
                </label>
                <textarea 
                  required
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Определите основные бизнес-цели и рамки проекта..."
                  className="w-full border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 h-24 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Дата начала
                  </label>
                  <input 
                    type="date" 
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    className="w-full border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Дата завершения
                  </label>
                  <input 
                    type="date" 
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                    className="w-full border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 font-mono" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Статус
                  </label>
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-white"
                  >
                    <option value="Планирование">Планирование</option>
                    <option value="В работе">В работе</option>
                    <option value="На проверке">На проверке</option>
                    <option value="Завершено">Завершено</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Прогресс выполнения (%)
                    </label>
                    <span className="text-xs font-black text-blue-600 font-mono">{progress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0"
                    max="100"
                    value={progress}
                    onChange={e => setProgress(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 mt-3" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Руководитель проекта
                </label>
                <input 
                  type="text"
                  value={lead}
                  onChange={e => setLead(e.target.value)}
                  className="w-full border border-slate-200 outline-none focus:ring-2 focus:ring-blue-100 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 text-xs text-slate-500 font-bold hover:text-slate-800 transition cursor-pointer"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition cursor-pointer"
                >
                  Создать проект
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
