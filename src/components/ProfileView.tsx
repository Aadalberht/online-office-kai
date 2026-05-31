import React, { useState } from 'react';
import { User, Task } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  ShieldAlert, 
  Briefcase, 
  Milestone, 
  FileCheck, 
  Edit3, 
  Save, 
  Layout, 
  Clock, 
  MessageSquare,
  Building
} from 'lucide-react';

interface ProfileProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  tasks: Task[];
  onNotify: (msg: string) => void;
  onActivityLog: (log: { user: string; action: string; target: string }) => void;
  setAllUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ProfileView({
  user,
  setUser,
  tasks,
  onNotify,
  onActivityLog,
  setAllUsers,
}: ProfileProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [dept, setDept] = useState(user.dept);

  // Compute Personal statistics
  const myAssignedTasks = tasks.filter(t => t.assignee === user.name);
  const activeTasksCount = myAssignedTasks.filter(t => t.status !== 'Готово').length;
  const doneTasksCount = myAssignedTasks.filter(t => t.status === 'Готово').length;

  // Closest personal deadlines (incomplete tasks containing sorted deadlines)
  const personalDeadlines = [...myAssignedTasks]
    .filter(t => t.status !== 'Готово')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  // Collect comments written by this user across all tasks
  const myComments: { taskTitle: string; text: string; date: string }[] = [];
  tasks.forEach(t => {
    t.comments.forEach(c => {
      if (c.author === user.name) {
        myComments.push({
          taskTitle: t.title,
          text: c.text,
          date: c.date,
        });
      }
    });
  });

  const oldestComments = myComments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const revisedUser = { ...user, name, dept };
    setUser(revisedUser);

    // Sync to all-users list if editing
    setAllUsers(prev => prev.map(u => u.email === user.email ? { ...u, name, dept } : u));

    // Also need to rewrite assignee names on tasks to ensure consistency
    // But since this is a prototype, we just update local states.
    setEditing(false);
    onNotify('Профиль успешно обновлен в системе');
    onActivityLog({
      user: name,
      action: 'изменил личную информацию в профиле',
      target: user.email
    });
  };

  return (
    <div id="profile-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in font-medium">
      
      {/* Profile Card & Info Form */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="text-center space-y-3 pt-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/10 mx-auto select-none">
            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>

          <div>
            <h3 className="font-extrabold text-slate-950 text-base">{user.name}</h3>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-full uppercase border border-blue-100 inline-block mt-1.5 select-none">
              {user.role}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4 pt-2 text-xs font-semibold">
            <div>
              <label className="block text-slate-400 uppercase mb-1">ФИО сотрудника</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border p-2.5 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-105" 
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase mb-1">Департамент / Отдел</label>
              <input 
                type="text" 
                value={dept}
                onChange={e => setDept(e.target.value)}
                className="w-full border p-2.5 rounded-xl font-bold text-slate-850 outline-none focus:ring-2 focus:ring-blue-105" 
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить профиль</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4.5 pt-2 text-xs font-semibold select-none">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-slate-400 text-[9px] block uppercase font-bold">Электронная почта</span>
                <span className="font-mono text-xs font-bold text-slate-800">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700">
              <Building className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[9px] block uppercase font-bold">Подразделение</span>
                <span className="text-slate-800 font-bold block">{user.dept}</span>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-slate-150 hover:bg-slate-205 text-slate-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Редактировать ФИО</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile statistics and detailed info */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Statistics highlights box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Задач в работе</span>
              <Clock className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <span className="text-2xl font-black text-slate-900 block mt-2 font-mono">
              {activeTasksCount}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Сдано вовремя</span>
              <FileCheck className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-slate-900 block mt-2 font-mono">
              {doneTasksCount}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500">Всего поручено</span>
              <Layout className="w-4.5 h-4.5 text-indigo-500" />
            </div>
            <span className="text-2xl font-black text-slate-900 block mt-2 font-mono">
              {myAssignedTasks.length}
            </span>
          </div>
        </div>

        {/* Closest deadlines widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ближайшие личные дедлайны</h4>

          <div className="space-y-3.5">
            {personalDeadlines.length > 0 ? (
              personalDeadlines.map((t) => (
                <div key={t.id} className="p-3 bg-red-50/20 border border-red-105 rounded-xl flex items-center justify-between text-xs font-bold">
                  <div>
                    <span className="text-slate-900 block font-bold truncate max-w-[280px] sm:max-w-md">{t.title}</span>
                    <span className="text-slate-400 font-semibold block text-[10px] mt-0.5 uppercase tracking-wide">
                      Приоритет: {t.priority}
                    </span>
                  </div>

                  <span className="font-mono text-red-650 bg-red-55 px-2.5 py-1 rounded font-black shrink-0">
                    до {t.deadline}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">Все назначенные на вас задачи успешно сданы!</p>
            )}
          </div>
        </div>

        {/* Comments stream summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">История ваших комментариев</h4>

          <div className="space-y-4">
            {oldestComments.length > 0 ? (
              oldestComments.map((c, i) => (
                <div key={i} className="pb-4.5 border-b border-slate-50 last:border-0 last:pb-0 text-xs text-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blue-600 truncate max-w-[320px]">к задаче «{c.taskTitle}»</span>
                    <span className="font-mono text-[9px] text-slate-400">{c.date}</span>
                  </div>
                  <p className="font-normal leading-normal text-slate-500 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 mt-1">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">Вы пока не комментировали задачи.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
