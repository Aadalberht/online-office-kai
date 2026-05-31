import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Plus, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Briefcase, 
  ToggleLeft, 
  ToggleRight, 
  X, 
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface UsersViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onNotify: (msg: string) => void;
  onActivityLog: (log: { user: string; action: string; target: string }) => void;
  adminName: string;
}

export default function UsersView({
  users,
  setUsers,
  onNotify,
  onActivityLog,
  adminName,
}: UsersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Creation State elements
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Сотрудник');
  const [dept, setDept] = useState('Отдел разработки');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onNotify('Пожалуйста, заполните основные поля ФИО и Email');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name,
      email,
      role,
      dept,
      status: 'Активен'
    };

    setUsers(prev => [...prev, newUser]);
    setShowModal(false);
    onNotify(`Пользователю ${name} выдан доступ`);
    onActivityLog({
      user: adminName,
      action: 'зарегистрировал аккаунт сотрудника',
      target: name
    });

    // Reset Form state
    setName('');
    setEmail('');
    setRole('Сотрудник');
    setDept('Отдел разработки');
  };

  const handleChangeRole = (userId: number, nextRole: UserRole) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        onNotify(`Сотруднику ${u.name} предоставлена роль «${nextRole}»`);
        onActivityLog({
          user: adminName,
          action: `предоставил роль «${nextRole}» пользователю`,
          target: u.name
        });
        return { ...u, role: nextRole };
      }
      return u;
    }));
  };

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Активен' ? 'Приостановлен' : 'Активен';

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        onNotify(`Доступ сотрудника ${u.name} переведен в статус «${nextStatus}»`);
        onActivityLog({
          user: adminName,
          action: `сменил статус доступа на «${nextStatus}» у пользователя`,
          target: u.name
        });
        return { ...u, status: nextStatus as any };
      }
      return u;
    }));
  };

  const filteredUsers = users.filter(u => {
    return u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
           u.dept.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div id="users-view" className="space-y-6 animate-fade-in font-medium">
      {/* Search & register employee buttons */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 select-none">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск сотрудников по ФИО, отделу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 transition"
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Добавить сотрудника</span>
        </button>
      </div>

      {/* Corporate staff roster grid table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                <th className="px-6 py-4.5">ФИО сотрудника</th>
                <th className="px-6 py-4.5">Учётная запись (Email)</th>
                <th className="px-6 py-4.5">Системная Роль</th>
                <th className="px-6 py-4.5">Департамент / Отдел</th>
                <th className="px-6 py-4.5">Статус</th>
                <th className="px-6 py-4.5 text-right">Управление</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8.5 h-8.5 bg-blue-105 border border-blue-200 text-blue-700 flex items-center justify-center font-bold rounded-lg text-xs">
                          {u.name.split('')[0] || 'U'}
                        </div>
                        <span className="font-bold text-slate-950 text-xs sm:text-sm">{u.name}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select 
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                        className="bg-slate-50 border text-xs font-semibold px-2 py-1.5 rounded-lg outline-none"
                      >
                        <option value="Администратор">Администратор</option>
                        <option value="Руководитель проекта">Руководитель проекта</option>
                        <option value="Сотрудник">Сотрудник</option>
                        <option value="Директор">Директор</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {u.dept}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'Активен' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-red-50 text-red-600 border border-red-100' 
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[10px] uppercase font-bold py-1 px-2 border ${
                          u.status === 'Активен'
                            ? 'bg-red-50 text-red-500 hover:bg-red-100/70 border-red-150'
                            : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100/70 border-emerald-150'
                        }`}
                        title={u.status === 'Активен' ? 'Деактивировать' : 'Активировать'}
                      >
                        {u.status === 'Активен' ? 'Блок' : 'Разблок'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs font-semibold">
                    Сотрудники с заданными параметрами не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-semibold">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Регистрация в Единой Системе</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 uppercase mb-1.5">ФИО сотрудника *</label>
                <input 
                  type="text"
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Например, Петров Николай Сергеевич..."
                  className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100" 
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Рабочий Email адрес *</label>
                <input 
                  type="email"
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nikolay@office.ru"
                  className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-850 outlook-none focus:ring-2 focus:ring-blue-100 font-mono" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Роль доступа</label>
                  <select 
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full border p-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="Сотрудник">Сотрудник</option>
                    <option value="Руководитель проекта">Руководитель проекта</option>
                    <option value="Директор">Директор / Руководитель отдела</option>
                    <option value="Администратор">Администратор</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Отдел / Департамент</label>
                  <input 
                    type="text"
                    value={dept}
                    onChange={e => setDept(e.target.value)}
                    placeholder="Маркетинг, Бухгалтерия..."
                    className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50" 
                  />
                </div>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition"
                >
                  Выдать доступ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
