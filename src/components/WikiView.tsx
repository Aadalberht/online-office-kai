import React, { useState } from 'react';
import { WikiDoc, User } from '../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  FolderLock, 
  User as UserIcon, 
  Calendar, 
  Lock, 
  Eye, 
  X, 
  FileText,
  AlertTriangle,
  ChevronRight,
  BookMarked
} from 'lucide-react';

interface WikiProps {
  wikiDocs: WikiDoc[];
  setWikiDocs: React.Dispatch<React.SetStateAction<WikiDoc[]>>;
  currentUser: User;
  onNotify: (msg: string) => void;
  onActivityLog: (log: { user: string; action: string; target: string }) => void;
}

const CATEGORIES = ['Все', 'Общие регламенты', 'Проектная документация', 'Инструкции', 'Частые вопросы'] as const;

export default function WikiView({
  wikiDocs,
  setWikiDocs,
  currentUser,
  onNotify,
  onActivityLog,
}: WikiProps) {
  const [selectedCat, setSelectedCat] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals active state
  const [readingDoc, setReadingDoc] = useState<WikiDoc | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCat, setNewCat] = useState<WikiDoc['cat']>('Общие регламенты');
  const [newContent, setNewContent] = useState('');
  const [newAccess, setNewAccess] = useState<WikiDoc['accessLevel']>('Все');

  const isAdmin = currentUser.role === 'Администратор';

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      onNotify('Пожалуйста, заполните заголовок и содержание документа.');
      return;
    }

    const newDoc: WikiDoc = {
      id: Date.now(),
      title: newTitle,
      cat: newCat,
      content: newContent,
      author: currentUser.name,
      date: '2026-05-31',
      accessLevel: newAccess,
    };

    setWikiDocs(prev => [newDoc, ...prev]);
    setShowCreateModal(false);
    onNotify('Документ успешно добавлен в базу знаний');
    onActivityLog({
      user: currentUser.name,
      action: 'опубликовал регламент в Wiki',
      target: newTitle
    });

    // Reset Form states
    setNewTitle('');
    setNewContent('');
    setNewAccess('Все');
  };

  // Check if current user has clearance for this document's clearance level
  const userHasAccess = (doc: WikiDoc) => {
    if (doc.accessLevel === 'Все') return true;
    if (doc.accessLevel === 'Администраторы') {
      return currentUser.role === 'Администратор';
    }
    if (doc.accessLevel === 'Руководство') {
      return currentUser.role === 'Администратор' || 
             currentUser.role === 'Руководитель проекта' || 
             currentUser.role === 'Директор';
    }
    return false;
  };

  const handleDocClick = (doc: WikiDoc) => {
    setReadingDoc(doc);
  };

  const filteredDocs = wikiDocs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'Все' || doc.cat === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="wiki-view" className="space-y-6 animate-fade-in">
      {/* Search & category ribbon controls */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по документам базы знаний..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 transition"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl scrollbar-none overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCat === cat
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать документ</span>
          </button>
        )}
      </div>

      {/* Wiki document list cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => {
            const hasClearance = userHasAccess(doc);

            return (
              <div
                key={doc.id}
                onClick={() => handleDocClick(doc)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md cursor-pointer transition duration-150 flex flex-col justify-between hover:border-blue-300 relative overflow-hidden group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-3.5">
                    <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider font-mono">
                      {doc.cat}
                    </span>
                    
                    {/* Private locks visual badges */}
                    {!hasClearance ? (
                      <span className="bg-red-50 text-red-600 rounded-full p-1 border border-red-100 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : doc.accessLevel !== 'Все' ? (
                      <span className="bg-amber-50 text-amber-600 rounded-full p-1 border border-amber-100 flex items-center justify-center">
                        <FolderLock className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>

                  <h3 className="font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors text-sm mb-2.5">
                    {doc.title}
                  </h3>

                  <p className="text-slate-400 font-medium text-xs line-clamp-3 leading-relaxed mb-4">
                    {doc.content.replace(/###/g, '').replace(/\n/g, ' ')}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5" />
                    {doc.author.split(' ')[0]}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {doc.date}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 text-xs font-semibold border border-slate-200 shadow-xs">
            Распоряжения по данной теме не обнаружены
          </div>
        )}
      </div>

      {/* Wiki detailed document reading overlay */}
      {readingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6.5 shadow-2xl border border-slate-150 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-5.5 h-5.5 text-blue-500" />
                  <span className="text-[10px] bg-blue-100 font-extrabold text-blue-700 px-2 py-0.5 rounded uppercase">
                    {readingDoc.cat}
                  </span>
                </div>
                <button 
                  onClick={() => setReadingDoc(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Clearance Authentication Check */}
              {!userHasAccess(readingDoc) ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 border border-red-200 text-red-500 flex items-center justify-center mx-auto shadow-sm">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950">Доступ заблокирован</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mt-1">
                      Данный нормативный документ имеет уровень доступа «{readingDoc.accessLevel}». Обратитесь к администратору для смены роли.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={() => setReadingDoc(null)}
                      className="bg-slate-100 text-slate-700 font-bold px-5 py-2 rounded-xl text-xs"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {readingDoc.title}
                    </h2>
                    <div className="flex flex-wrap gap-4 mt-3 text-slate-400 text-xs font-semibold select-none">
                      <span className="flex items-center gap-1 text-slate-500">
                        <UserIcon className="w-3.5 h-3.5" />
                        Автор: {readingDoc.author}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        Обновлено: {readingDoc.date}
                      </span>
                    </div>
                  </div>

                  <div className="prose prose-slate max-w-none text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                    {readingDoc.content}
                  </div>
                </div>
              )}
            </div>

            {userHasAccess(readingDoc) && (
              <div className="border-t border-slate-100 pt-4.5 mt-6 flex justify-end">
                <button 
                  onClick={() => setReadingDoc(null)} 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Завершить чтение
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Creator document modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6.5 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-extrabold text-slate-900">Публикация нового Wiki регламента</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Заголовок документа *</label>
                <input 
                  type="text"
                  required 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Например, Правила утилизации токенов безопасности..."
                  className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50 focus:bg-white transition" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Раздел базы знаний</label>
                  <select 
                    value={newCat}
                    onChange={e => setNewCat(e.target.value as WikiDoc['cat'])}
                    className="w-full border p-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="Общие регламенты">Общие регламенты</option>
                    <option value="Проектная документация">Проектная документация</option>
                    <option value="Инструкции">Инструкции</option>
                    <option value="Частые вопросы">Частые вопросы</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Уровень доступа секретности</label>
                  <select 
                    value={newAccess}
                    onChange={e => setNewAccess(e.target.value as WikiDoc['accessLevel'])}
                    className="w-full border p-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="Все">Доступно всем (Публичный)</option>
                    <option value="Руководство">Доступно Руководству (PM/Директора)</option>
                    <option value="Администраторы">Доступно Администраторам</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Содержание (поддерживает текстовое форматирование) *</label>
                <textarea 
                  required
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Пропишите регламент по шагам, с указанием должностей..."
                  className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-105 h-44 resize-none bg-slate-50/50 focus:bg-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-xs text-slate-500 font-bold hover:text-slate-800 transition cursor-pointer"
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition"
                >
                  Добавить документ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
