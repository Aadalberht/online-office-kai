import React, { useState } from 'react';
import { CalendarEvent, EventType, User } from '../types';
import { 
  Plus, 
  Calendar as CalIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User as UserIcon, 
  X,
  MapPin,
  CalendarDays,
  ListCollapse
} from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  currentUser: User;
  users: User[];
  onNotify: (msg: string) => void;
  onActivityLog: (log: { user: string; action: string; target: string }) => void;
}

export default function CalendarView({
  events,
  setEvents,
  currentUser,
  users,
  onNotify,
  onActivityLog,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'День' | 'Неделя' | 'Месяц'>('Месяц');
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('2026-06-01');

  // Form State Values
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Встреча');
  const [date, setDate] = useState('2026-06-01');
  const [time, setTime] = useState('11:00');
  const [desc, setDesc] = useState('');
  const [participantsText, setParticipantsText] = useState('');

  // June 2026 calculations
  // Starts on Monday 1st June, terminates on Tuesday 30th June.
  const totalDays = 30;
  const daysInJune = Array.from({ length: totalDays }, (_, i) => i + 1);

  const canPlan = currentUser.role === 'Руководитель проекта' || currentUser.role === 'Администратор';

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onNotify('Пожалуйста, укажите название события');
      return;
    }

    const arrParticipants = participantsText
      ? participantsText.split(',').map(p => p.trim())
      : [currentUser.name];

    const newEvent: CalendarEvent = {
      id: Date.now(),
      title,
      type,
      date,
      time,
      participants: arrParticipants,
      desc
    };

    setEvents(prev => [...prev, newEvent]);
    setShowModal(false);
    onNotify('Событие успешно запланировано и добавлено в календарь');
    onActivityLog({
      user: currentUser.name,
      action: 'запланировал новое событие',
      target: title
    });

    // Reset Form state
    setTitle('');
    setType('Встреча');
    setDate('2026-06-01');
    setTime('11:00');
    setDesc('');
    setParticipantsText('');
  };

  const getTypeBadgeStyles = (t: EventType) => {
    switch (t) {
      case 'Встреча': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Дедлайн': return 'bg-red-50 text-red-700 border-red-100';
      case 'Спринт': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Контрольная точка': return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  // Filter events for the currently selected list day
  const dailyEvents = events.filter(e => e.date === selectedDay);

  const selectDayCell = (day: number) => {
    const padded = day < 10 ? `0${day}` : day;
    setSelectedDay(`2026-06-${padded}`);
  };

  return (
    <div id="calendar-view" className="space-y-6 animate-fade-in">
      {/* Visual toggle & plan controller */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5.5 h-5.5 text-blue-600 shrink-0" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Расписание: Июнь 2026</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Выбранная дата: {selectedDay}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Day / Week / Month selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['День', 'Неделя', 'Месяц'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {canPlan && (
            <button
              onClick={() => {
                setDate(selectedDay);
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать событие</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Grid View (Месяц) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          {viewMode === 'Месяц' ? (
            <div>
              {/* Day of Week Labels */}
              <div className="grid grid-cols-7 text-center pb-2.5 border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase select-none">
                <span>Пн</span>
                <span>Вт</span>
                <span>Ср</span>
                <span>Чт</span>
                <span>Пт</span>
                <span className="text-red-400/90">Сб</span>
                <span className="text-red-400/90">Вс</span>
              </div>

              {/* Month Cell Grid (starts on Monday for June 2026!) */}
              <div className="grid grid-cols-7 border-l border-t border-slate-100 mt-2.5">
                {daysInJune.map((day) => {
                  const dayPadded = day < 10 ? `0${day}` : day;
                  const dateStr = `2026-06-${dayPadded}`;
                  const isSelected = selectedDay === dateStr;
                  const dayEvents = events.filter(e => e.date === dateStr);

                  return (
                    <div
                      key={day}
                      onClick={() => selectDayCell(day)}
                      className={`min-h-[90px] p-2 border-r border-b border-slate-100 cursor-pointer transition flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-blue-50/60 ring-2 ring-blue-500 ring-inset' 
                          : 'hover:bg-slate-50/50 bg-white'
                      }`}
                    >
                      <span className={`text-[11px] font-bold self-start w-5.5 h-5.5 flex items-center justify-center rounded-full ${
                        day === 31 ? 'bg-indigo-600 text-white' : 'text-slate-700'
                      }`}>
                        {day}
                      </span>

                      {/* Display small dots or mini badges for day events */}
                      <div className="space-y-1 mt-1.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div 
                            key={ev.id} 
                            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold truncate border ${
                              ev.type === 'Встреча' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              ev.type === 'Дедлайн' ? 'bg-red-50 text-red-700 border-red-100' :
                              ev.type === 'Спринт' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                            }`}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[8px] text-slate-400 font-extrabold pl-1.5 select-none">
                            И ещё {dayEvents.length - 2}...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'Неделя' ? (
            /* Mock week schedule agenda */
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase select-none">Расписание на текущую неделю</h4>
              <div className="divide-y divide-slate-100">
                {[
                  { name: 'Понедельник, 1 июня', date: '2026-06-01' },
                  { name: 'Вторник, 2 июня', date: '2026-06-02' },
                  { name: 'Среда, 3 июня', date: '2026-06-03' },
                  { name: 'Четверг, 4 июня', date: '2026-06-04' },
                  { name: 'Пятница, 5 июня', date: '2026-06-05' },
                ].map((dw, i) => {
                  const weekEvs = events.filter(e => e.date === dw.date);
                  return (
                    <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <span className="text-xs font-semibold text-slate-700 w-44 shrink-0 mt-0.5">{dw.name}</span>
                      <div className="flex-1 space-y-2">
                        {weekEvs.length > 0 ? (
                          weekEvs.map(ev => (
                            <div key={ev.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium">
                              <span className="font-bold text-slate-900 block">{ev.title} ({ev.time})</span>
                              <span className="text-slate-500 font-normal block mt-0.5">{ev.desc}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Событий не запланировано</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Day View (День) for specified day */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase">Повестка дня на {selectedDay}</h4>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{dailyEvents.length} событий</span>
              </div>

              {dailyEvents.length > 0 ? (
                <div className="space-y-3">
                  {dailyEvents.map(ev => (
                    <div key={ev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-xs text-slate-900">{ev.title}</span>
                        <span className="font-mono text-xs font-bold text-blue-600">{ev.time}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 leading-normal">{ev.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  На этот день событий не запланировано
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Date Agenda sidebar drawer */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 select-none">
            <ListCollapse className="w-5 h-5 text-indigo-500" />
            <h3 className="font-black text-slate-950 text-xs uppercase tracking-tight">Повестка выбранного дня</h3>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {dailyEvents.length > 0 ? (
              dailyEvents.map((ev) => (
                <div 
                  key={ev.id} 
                  className="p-4 bg-slate-50 border border-slate-150 rounded-xl hover:border-slate-350 transition-all text-xs font-semibold relative overflow-hidden"
                >
                  {/* Event Type border accent */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                    ev.type === 'Встреча' ? 'bg-blue-500' :
                    ev.type === 'Дедлайн' ? 'bg-red-500' :
                    ev.type === 'Спринт' ? 'bg-purple-500' : 'bg-amber-500'
                  }`}></div>

                  <div className="flex justify-between items-start pl-2">
                    <span className="font-extrabold text-slate-900 leading-snug">{ev.title}</span>
                    <span className="shrink-0 font-mono text-[10px] text-blue-600 font-bold bg-blue-50/70 border border-blue-100 rounded px-1.5 py-0.5">
                      {ev.time}
                    </span>
                  </div>

                  <p className="font-normal text-slate-500 text-xs mt-2 pl-2 line-clamp-3 leading-normal">
                    {ev.desc}
                  </p>

                  <div className="pt-2.5 mt-2.5 border-t border-slate-200/60 pl-2">
                    <div className="flex items-center gap-1 text-[10px] text-slate-700 font-bold">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{ev.participants.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                Нет запланированных событий на {selectedDay}. Выберите другой день на сетке.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creation Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-extrabold text-slate-900">Запланировать новое событие</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Название события *</label>
                <input 
                  type="text"
                  required 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Например, Презентация макетов директору..."
                  className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50 focus:bg-white transition" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Тип события</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as EventType)}
                    className="w-full border p-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="Встреча">Встреча / Митинг</option>
                    <option value="Дедлайн">Дедлайн задачи</option>
                    <option value="Спринт">Спринт (Sprint)</option>
                    <option value="Контрольная точка">Контрольная точка</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Участники (ФИО через запятую)</label>
                  <input 
                    type="text"
                    value={participantsText}
                    onChange={e => setParticipantsText(e.target.value)}
                    placeholder="Петрова А.С., Сидоров О.А."
                    className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50/50" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Дата проведения</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-xs font-bold text-slate-800 font-mono focus:ring-2 focus:ring-blue-100 bg-white" 
                  />
                </div>

                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Время начала</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-xs font-bold text-slate-800 font-mono focus:ring-2 focus:ring-blue-100 bg-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Описание события</label>
                <textarea 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Определите повестку встречи, ссылку на созвон в Google Meet..."
                  className="w-full border px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 h-20 resize-none bg-slate-50/50 focus:bg-white"
                ></textarea>
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
                  Запланировать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
