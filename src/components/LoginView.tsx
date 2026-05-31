import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Briefcase, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ChevronsRight, 
  Bot, 
  Info,
  Key
} from 'lucide-react';

interface LoginViewProps {
  testUsers: User[];
  onLogin: (user: User) => void;
  onNotify: (msg: string) => void;
}

export default function LoginView({ testUsers, onLogin, onNotify }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [errorText, setErrorText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorText('Пожалуйста, введите корректный email и пароль');
      return;
    }

    const matchedUser = testUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (matchedUser) {
      setErrorText('');
      onNotify(`Успешный вход: ${matchedUser.name} (${matchedUser.role})`);
      onLogin(matchedUser);
    } else {
      setErrorText('Пользователь с таким Email не зарегистрирован. Используйте ссылки быстрого входа ниже.');
    }
  };

  const handleQuickLogin = (usr: User) => {
    setEmail(usr.email);
    setPassword('••••••••');
    setErrorText('');
    setTimeout(() => {
      onNotify(`Быстрый вход: ${usr.name} (${usr.role})`);
      onLogin(usr);
    }, 400); // short tactile delay
  };

  return (
    <div id="login-screen" className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-8 relative font-medium overflow-hidden select-none">
      
      {/* Decorative ambient background blur vectors */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 z-10">
        
        {/* Brand info */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
            <Briefcase className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Онлайн-Офис</h1>
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">Единая система управления проектами</p>
          </div>
        </div>

        {/* Real Form Box */}
        <div id="login-form-card" className="bg-slate-900 border border-slate-800 p-6 sm:p-7.5 rounded-3xl shadow-2xl space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Авторизация сотрудника</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">Используйте логины тестовых учетных записей</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5 text-xs font-semibold">
            {errorText && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start gap-2 leading-relaxed">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-red-400" />
                <span>{errorText}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-400 uppercase mb-1.5 font-bold tracking-wider">Электронный адрес *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@office.ru"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-xs font-semibold text-white outline-none focus:border-blue-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 uppercase mb-1.5 font-bold tracking-wider">Пароль доступа *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3.5 text-xs font-semibold text-white outline-none focus:border-blue-500 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs py-3.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              <span>Войти в корпоративную сеть</span>
              <ChevronsRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Test links lists */}
          <div className="pt-5.5 border-t border-slate-800 space-y-3">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-blue-500" />
              Быстрый демо-вход по ролям (1 клик):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {testUsers.slice(0, 4).map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => handleQuickLogin(usr)}
                  id={`quick-login-${usr.role}`}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl hover:border-blue-500/40 transition text-left cursor-pointer group"
                >
                  <p className="font-extrabold text-[10px] text-white group-hover:text-blue-400 transition-colors">{usr.role}</p>
                  <p className="text-[9px] text-slate-500 font-semibold block truncate leading-normal mt-0.5">{usr.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Informative credentials footer */}
        <div className="flex items-start gap-2 p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-[10px] text-slate-500 font-semibold leading-relaxed">
          <Info className="w-4 h-4 shrink-0 text-blue-400" />
          <span>Данный прототип запущен в защищённом тестовом режиме и сохраняет все добавляемые сущности исключительно в локальное хранилище Вашего браузера. Серверный бэкенд не задействован.</span>
        </div>
      </div>
    </div>
  );
}
