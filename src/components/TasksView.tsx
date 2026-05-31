import React, { useState } from 'react';
import { Task, Project, User, TaskStatus, TaskPriority, Comment } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User as UserIcon, 
  Folder, 
  AlertCircle, 
  MessageSquare, 
  Paperclip, 
  ChevronRight, 
  X,
  FileText,
  Send,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  projects: Project[];
  users: User[];
  currentUser: User;
  onNotify: (msg: string) => void;
  onActivityLog: (log: { user: string; action: string; target: string }) => void;
}

export default function TasksView({
  tasks,
  setTasks,
  projects,
  users,
  currentUser,
  onNotify,
  onActivityLog,
}: TasksViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('Все');
  const [filterAssignee, setFilterAssignee] = useState<string>('Все');
  const [filterStatus, setFilterStatus] = useState<string>('Все');
  const [filterPriority, setFilterPriority] = useState<string>('Все');
  
  // Default to filtering current user's tasks if employee
  const isEmployee = currentUser.role === 'Сотрудник';
  const [onlyMyTasks, setOnlyMyTasks] = useState(isEmployee);

  // Modal active flags
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeDetailsTask, setActiveDetailsTask] = useState<Task | null>(null);

  // Creation State elements
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProjId, setNewProjId] = useState<number>(projects[0]?.id || 1);
  const [newAssignee, setNewAssignee] = useState(users[0]?.name || '');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Средний');
  const [newDeadline, setNewDeadline] = useState('2026-06-15');

  // Comment adding elements
  const [commentText, setCommentText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Authorizations
  const canCreate = currentUser.role === 'Руководитель проекта' || currentUser.role === 'Администратор';

  // Perform filtering
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProj = filterProject === 'Все' || t.projectId === Number(filterProject);
    const matchesAssignee = filterAssignee === 'Все' || t.assignee === filterAssignee;
    const matchesStatus = filterStatus === 'Все' || t.status === filterStatus;
    const matchesPriority = filterPriority === 'Все' || t.priority === filterPriority;
    const matchesMyOnly = !onlyMyTasks || t.assignee === currentUser.name;

    return matchesSearch && matchesProj && matchesAssignee && matchesStatus && matchesPriority && matchesMyOnly;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onNotify('Название задачи не может быть пустым');
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: newTitle,
      desc: newDesc,
      projectId: Number(newProjId),
      assignee: newAssignee,
      status: 'Открыта',
      priority: newPriority,
      deadline: newDeadline,
      dateCreated: '2026-05-31',
      comments: [],
      files: [],
    };

    setTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
    onNotify('Задача успешно создана и делегирована');
    onActivityLog({
      user: currentUser.name,
      action: 'создал задачу',
      target: newTitle
    });

    // Reset Creation inputs
    setNewTitle('');
    setNewDesc('');
    setNewPriority('Средний');
    setNewDeadline('2026-06-15');
  };

  const handleChangeTaskStatus = (taskId: number, nextStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // Log action
        onActivityLog({
          user: currentUser.name,
          action: `изменил статус на «${nextStatus}» у задачи`,
          target: t.title
        });
        return { ...t, status: nextStatus };
      }
      return t;
    }));

    // Update active details overlay context if open
    if (activeDetailsTask && activeDetailsTask.id === taskId) {
      setActiveDetailsTask(prev => prev ? { ...prev, status: nextStatus } : null);
    }

    onNotify(`Статус изменен на «${nextStatus}»`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeDetailsTask) return;

    const newComment: Comment = {
      id: Date.now(),
      author: currentUser.name,
      text: commentText,
      date: '2026-05-31 ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedTasks = tasks.map(t => {
      if (t.id === activeDetailsTask.id) {
        const revised = { ...t, comments: [...t.comments, newComment] };
        setActiveDetailsTask(revised);
        return revised;
      }
      return t;
    });

    setTasks(updatedTasks);
    setCommentText('');
    onNotify('Комментарий успешно добавлен');
    onActivityLog({
      user: currentUser.name,
      action: 'добавил комментарий к задаче',
      target: activeDetailsTask.title
    });
  };

  // Mock File Drag Drop Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!activeDetailsTask) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      appendMockFile(files[0].name, (files[0].size / 1024 / 1024).toFixed(1) + ' МБ');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeDetailsTask || !e.target.files?.length) return;
    const selectedFile = e.target.files[0];
    appendMockFile(selectedFile.name, (selectedFile.size / 1024 / 1024).toFixed(1) + ' МБ');
  };

  const appendMockFile = (name: string, size: string) => {
    if (!activeDetailsTask) return;

    const newFile = {
      id: Date.now(),
      name,
      size: size === '0.0 МБ' ? '0.1 МБ' : size,
    };

    const updatedTasks = tasks.map(t => {
      if (t.id === activeDetailsTask.id) {
        const revised = { ...t, files: [...t.files, newFile] };
        setActiveDetailsTask(revised);
        return revised;
      }
      return t;
    });

    setTasks(updatedTasks);
    onNotify(`Файл «${name}» успешно прикреплён`);
    onActivityLog({
      user: currentUser.name,
      action: 'прикрепил файл к задаче',
      target: activeDetailsTask.title
    });
  };

  return (
    <div id="tasks-view" className="space-y-6 animate-fade-in relative">
      {/* Search and Advanced Filters Dashboard */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Main query & creation triggers */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по названию или описанию задачи..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* My Tasks quick filter badge */}
            <button
              onClick={() => setOnlyMyTasks(!onlyMyTasks)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                onlyMyTasks 
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Только мои задачи
            </button>

            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4.5 py-2 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Новая задача</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown selectors list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Проект</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold p-2 rounded-xl outline-none"
            >
              <option value="Все">Все проекты</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Исполнитель</label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold p-2 rounded-xl outline-none"
            >
              <option value="Все">Все сотрудники</option>
              {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Статус</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold p-2 rounded-xl outline-none"
            >
              <option value="Все">Все статусы</option>
              <option value="Открыта">Открыта</option>
              <option value="В работе">В работе</option>
              <option value="На проверке">На проверке</option>
              <option value="Готово">Готово</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Приоритет</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold p-2 rounded-xl outline-none"
            >
              <option value="Все">Все приоритеты</option>
              <option value="Низкий">Низкий</option>
              <option value="Средний">Средний</option>
              <option value="Высокий">Высокий</option>
              <option value="Критический">Критический</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main tasks flex listing */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => {
            const corrProject = projects.find(p => p.id === t.projectId);
            const isRedOverdue = t.status !== 'Готово' && t.deadline && new Date(t.deadline) < new Date('2026-05-31');

            return (
              <div 
                key={t.id}
                onClick={() => setActiveDetailsTask(t)}
                className="bg-white p-4.5 rounded-xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md cursor-pointer transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Left priority border indicator */}
                  <div className={`w-1.5 h-10 shrink-0 rounded-full ${
                    t.priority === 'Критический' 
                      ? 'bg-red-500 shadow-xs' 
                      : t.priority === 'Высокий' 
                      ? 'bg-orange-500' 
                      : t.priority === 'Средний' 
                      ? 'bg-blue-500' 
                      : 'bg-slate-300'
                  }`}></div>

                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                      {t.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Folder className="w-3.5 h-3.5" />
                        {corrProject?.title || 'Проект удален'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <UserIcon className="w-3.5 h-3.5" />
                        {t.assignee}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4.5 self-end md:self-center">
                  {/* Deadline Indicator */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-mono font-medium ${
                    isRedOverdue 
                      ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>до {t.deadline}</span>
                  </div>

                  {/* Task Comments Count */}
                  {t.comments.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="font-bold font-mono">{t.comments.length}</span>
                    </div>
                  )}

                  {/* Task Files Count */}
                  {t.files.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span className="font-bold font-mono">{t.files.length}</span>
                    </div>
                  )}

                  {/* Action Status Selection Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    t.status === 'Готово' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : t.status === 'На проверке' 
                      ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                      : t.status === 'В работе'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'bg-slate-50 text-slate-600 border border-slate-205'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs font-medium border border-slate-200">
            Задачи по выбранным параметрам фильтрации не найдены
          </div>
        )}
      </div>

      {/* Slide-over panel: Task Detailed Overlay / Comments / Visually Attaching Files */}
      {activeDetailsTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50 p-0 animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl animate-slide-in relative border-l border-slate-200">
            {/* Panel header controls */}
            <div className="p-5.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <span className="font-extrabold text-slate-900 uppercase tracking-widest text-[10px]">
                  Карточка задачи
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">
                  ID {activeDetailsTask.id.toString().substring(0, 5)}
                </span>
              </div>
              <button 
                onClick={() => setActiveDetailsTask(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-150 p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details wrapper */}
            <div className="flex-1 overflow-y-auto p-6.5 space-y-6.5">
              {/* Task Title & Project context */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Проект: {projects.find(p => p.id === activeDetailsTask.projectId)?.title || 'Не указан'}
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-snug mt-1">
                  {activeDetailsTask.title}
                </h3>
              </div>

              {/* Task specs table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block mb-1">Приоритет</span>
                  <span className={`font-bold inline-block px-1.5 py-0.5 rounded text-[10px] uppercase text-white ${
                    activeDetailsTask.priority === 'Критический' ? 'bg-red-500' :
                    activeDetailsTask.priority === 'Высокий' ? 'bg-orange-500' :
                    activeDetailsTask.priority === 'Средний' ? 'bg-blue-500' : 'bg-slate-400'
                  }`}>
                    {activeDetailsTask.priority}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Исполнитель</span>
                  <span className="text-slate-800 text-xs font-bold block truncate">{activeDetailsTask.assignee}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Крайний срок</span>
                  <span className="text-slate-700 block font-mono text-xs font-bold">{activeDetailsTask.deadline}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Статус</span>
                  <select
                    value={activeDetailsTask.status}
                    onChange={(e) => handleChangeTaskStatus(activeDetailsTask.id, e.target.value as TaskStatus)}
                    className="bg-white border text-xs font-bold p-1 rounded-md outline-none"
                  >
                    <option value="Открыта">Открыта</option>
                    <option value="В работе">В работе</option>
                    <option value="На проверке">На проверке</option>
                    <option value="Готово">Готово</option>
                  </select>
                </div>
              </div>

              {/* Description body */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Описание задачи</h5>
                <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50/20 p-3.5 border border-slate-100 rounded-xl">
                  {activeDetailsTask.desc || 'Описание для данной задачи отсутствует.'}
                </p>
              </div>

              {/* Attachments Section - Visually File Upload Area */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Вложения ({activeDetailsTask.files.length})
                </h5>

                {activeDetailsTask.files.length > 0 && (
                  <div className="space-y-2">
                    {activeDetailsTask.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100/50 transition">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">{file.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 shrink-0 px-2">{file.size}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simulated file upload widget */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4.5 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'
                  }`}
                >
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <input 
                      type="file" 
                      onChange={handleFileInputChange}
                      className="hidden" 
                    />
                    <UploadCloud className="w-7 h-7 text-blue-500 mb-1.5 animate-bounce" />
                    <span className="text-xs font-bold text-slate-800">Перетащите файлы сюда или нажмите</span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">поддерживаются PNG, PDF, DOCX до 10 МБ</span>
                  </label>
                </div>
              </div>

              {/* Discussions block */}
              <div className="space-y-4">
                <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Комментарии ({activeDetailsTask.comments.length})
                </h5>

                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {activeDetailsTask.comments.length > 0 ? (
                    activeDetailsTask.comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{comm.author}</span>
                          <span className="font-mono text-[10px] text-slate-400">{comm.date}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 leading-normal">{comm.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-slate-400 text-xs font-medium">Комментариев пока нет. Напишите первый!</p>
                  )}
                </div>

                {/* Comment input form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Написать комментарий..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-xs font-medium p-2.5 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shrink-0 flex items-center justify-center transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creator Modal Box */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-extrabold text-slate-900">Постановка новой задачи</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 uppercase mb-1">Название задачи *</label>
                <input 
                  type="text"
                  required 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Например, Описать роуты авторизации..."
                  className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100" 
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1">Описание задачи</label>
                <textarea 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Задайте чёткие границы выполнения поручения..."
                  className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 h-20 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase mb-1">Проект</label>
                  <select 
                    value={newProjId}
                    onChange={e => setNewProjId(Number(e.target.value))}
                    className="w-full border p-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase mb-1">Исполнитель</label>
                  <select 
                    value={newAssignee}
                    onChange={e => setNewAssignee(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                  >
                    {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase mb-1">Приоритет</label>
                  <select 
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full border p-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="Низкий">Низкий</option>
                    <option value="Средний">Средний</option>
                    <option value="Высокий">Высокий</option>
                    <option value="Критический">Критический</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase mb-1">Крайний срок (Дедлайн)</label>
                  <input 
                    type="date" 
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-xs font-bold text-slate-800 font-mono focus:ring-2 focus:ring-blue-100 bg-white" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-xs text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition"
                >
                  Создать и поручить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
