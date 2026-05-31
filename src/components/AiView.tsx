import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  LineChart, 
  PenSquare, 
  Download, 
  Bot, 
  User as UserIcon,
  Workflow, 
  ChevronRight,
  GitCommit,
  Layers,
  Sparkle
} from 'lucide-react';
import { User } from '../types';

interface AiViewProps {
  currentUser: User;
  onNotify: (msg: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AiView({ currentUser, onNotify }: AiViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'diagram'>('chat');
  
  // Chat state elements
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Приветствую Вас, ${currentUser.name}! Я Ваш корпоративный ИИ-ассистент.\n\nЯ обучен на материалах Вашей Базы Знаний, текущих задачах и статусах проектов. Могу составить сводки, проанализировать дедлайны или подготовить проектную документацию. Кликните на любой из быстрых шаблонов слева или введите свой запрос!`,
      timestamp: '12:00'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Diagram constructor states
  const [schemaText, setSchemaText] = useState('Схема регламента сдачи задач на проверку');
  const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);
  const [showFlowChart, setShowFlowChart] = useState(true);

  // Quick prompt templates definitions
  const PROMPT_TEMPLATES = [
    {
      label: 'Составить краткий отчет по проектам',
      prompt: 'Составь краткий отчет по проекту Разработка корпоративного портала v2.0',
      icon: FileCheck,
      reply: `### СВОДНЫЙ ОТЧЕТ ИИ ПО ПРОЕКТУ v2.0\n\n**Проект:** Разработка корпоративного портала v2.0\n**Прогресс выполнения:** 41% (по бэклогу задач)\n**Дата получения статуса:** 31.05.2026\n\n#### Ключевые показатели:\n- **Завершено задач:** 1 (Настройка структуры БД PostgreSQL)\n- **Задач в работе:** 3 (Разработка бокового меню, REST API уведомлений, Синхронизация Wiki)\n- **Просроченные задачи:** отсутствуют\n\n#### Мнение ИИ-эксперта:\nТекущие темпы разработки стабильны. Основной упор сделан на бэкенд и базовую UI-верстку. Риск просадки сроков минимальный, но рекомендуется уделить внимание интеграции REST API до дедлайна 3 июня.`
    },
    {
      label: 'Сформировать список рисков',
      prompt: 'Сформируй список рисков для редизайна мобильного приложения',
      icon: AlertTriangle,
      reply: `### АНАЛИЗ ПРОЕКТНЫХ РИСКОВ ИИ\n\n**Проект:** Редизайн мобильного приложения\n**Выявленные риски на 31.05.2026:**\n\n1. **Риск рассогласования макетов (вероятность: Высокая)**\n   - *Описание:* Figma-прототипы находятся на стадии проверки дирекцией. Есть риск повторных правок интерфейса.\n   - *Митигация:* Назначить короткую промежуточную сессию синхронизации с Еленой Лебедевой.\n\n2. **Ресурсный голод (вероятность: Средняя)**\n   - *Описание:* На дизайне только один специалист при параллельной поддержке фирменного стиля.\n   - *Митигация:* Автоматизировать экспорт элементов при помощи Figma плагинов.`
    },
    {
      label: 'Напомнить о дедлайнах',
      prompt: 'Напомни о критических дедлайнах на ближайшую неделю',
      icon: Clock,
      reply: `### МОНИТОРИНГ КРИТИЧЕСКИХ ДЕДЛАЙНОВ\n\nНа основе анализа календаря и реестра задач обнаружены следующие важные сроки:\n\n- **03 июня**: Разработка REST API для модуля уведомлений (Исполнитель: Сидоров О. А.). Приоритет: **Критический**. Механизм шлюза отправки писем.\n- **05 июня**: Разработка левого бокового меню (Исполнитель: Сидоров О. А.). Приоритет: **Высокий**.\n- **08 июня**: Автоматическая синхронизация базы документов Wiki. Приоритет: **Средний**.\n\n*Рекомендуется запустить автоматический воркер уведомлений для контроля статусов в работе.*`
    },
    {
      label: 'Построить описание диаграммы',
      prompt: 'Построй описание диаграммы регламента сдачи задач',
      icon: LineChart,
      reply: `### СТРУКТУРНОЕ ОПИСАНИЕ СХЕМЫ РАБОТЫ\n\nСхема сдачи задач на проверку включает в себя 4 последовательных этапа с контуром обратной связи:\n\n1. **Инициация (Открыта)**: Задача описывается согласно регламенту с DoD. Назначается исполнитель.\n2. **Исполнение (В работе)**: Разработчик программирует функционал. Опционально крепятся вложения.\n3. **Контроль качества (На проверке)**: ТЗ отправляется PM на код-ревью или проверку соответствия дизайна.\n4. **Финализация (Готово)**: Проект одобряется, заливается на сервера и отмечается выполненным на 100%. При отклонении возвращается на этап «В работе» с комментариями.`
    },
    {
      label: 'Сгенерировать ТЗ для задачи',
      prompt: 'Сгенерируй текст задачи для верстки UI личного кабинета',
      icon: PenSquare,
      reply: `### ТЕХНИЧЕСКОЕ ЗАДАНИЕ (СГЕНЕРИРОВАНО ИИ)\n\n**Тема:** Верстка UI-экрана личного кабинета сотрудника\n**Приоритет:** Высокий\n**Исполнитель:** Специалист по верстке\n\n#### Требования к реализации (DoD):\n1. Реализовать 3 вкладки: «Профиль», «Задачи», «Безопасность».\n2. Добавить вывод ФИО, должности, аватары и отдела пользователя.\n3. Сделать вывод статистики по задачам в виде круговой CSS диаграммы.\n4. Настроить кнопку «Редактировать» с модальным окном редактирования.\n5. Шрифты: Inter. Сетка адаптивная, поддерживающая мобильные девайсы от 360px.`
    }
  ];

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI logic response simulation
    setTimeout(() => {
      // Check if text matches any templates
      const matched = PROMPT_TEMPLATES.find(p => p.prompt.toLowerCase().includes(textToSend.toLowerCase()) || textToSend.toLowerCase().includes(p.prompt.toLowerCase()));
      
      let aiText = `Я проанализировал Ваш запрос: «${textToSend}».\n\nНа основе текущих данных прототипа Онлайн-Офиса, хочу сообщить, что все системы работают штатно. Количество активных задач — ${messages.length}, пользователи стабильно выполняют KPI. К сожалению, для более точечного ответа сформулируйте вопрос детальнее или выберите один из подготовленных пресетов на боковой панели ИИ.`;

      if (matched) {
        aiText = matched.reply;
      }

      const aiMsg: ChatMessage = {
        sender: 'assistant',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      onNotify('ИИ-помощник сформировал ответ');
    }, 1500);
  };

  const handleCreateDiagram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schemaText.trim()) return;

    setIsGeneratingSchema(true);
    onNotify('Обработка запроса разметки блок-схемы...');

    setTimeout(() => {
      setIsGeneratingSchema(false);
      setShowFlowChart(true);
      onNotify('Блок-схема сгенерирована успешно');
    }, 1500);
  };

  const handleExportDiagram = (format: 'png' | 'pdf') => {
    const ext = format === 'png' ? 'PNG' : 'PDF';
    onNotify(`Файл схемы подготовлен. Старт скачивания: chart_structure.${format}`);
  };

  return (
    <div id="ai-view" className="space-y-6 animate-fade-in">
      {/* Top tab router */}
      <div className="flex bg-slate-200/65 p-1 rounded-2xl w-full max-w-sm shrink-0 select-none border border-slate-350">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ИИ Чат-Ассистент
        </button>

        <button
          onClick={() => setActiveTab('diagram')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'diagram'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Конструктор диаграмм
        </button>
      </div>

      {activeTab === 'chat' ? (
        /* Chat view dashboard panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prompt Templates Sidebar on the Left */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-slate-100 select-none">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              Шаблоны запросов ИИ
            </h4>

            <div className="space-y-2.5">
              {PROMPT_TEMPLATES.map((tpl, i) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(tpl.prompt)}
                    className="w-full p-3 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-xl hover:border-blue-200 transition text-left flex items-start gap-2.5 group"
                  >
                    <Icon className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-blue-500 transition-colors shrink-0" />
                    <span className="text-slate-700 text-xs font-bold leading-normal group-hover:text-slate-950">
                      {tpl.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assistant Chat Interface on the Right */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
            {/* Active partner bar */}
            <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5 select-none">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold relative">
                  <Bot className="w-4.5 h-4.5" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white"></span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-xs block">
                    Ассистент Онлайн-Офиса
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block">
                    В сети
                  </span>
                </div>
              </div>

              <span className="text-[9px] bg-slate-150 text-slate-500 px-2 py-1 rounded-full font-bold uppercase tracking-tight">
                Gemini LLM
              </span>
            </div>

            {/* Chat Messages scroll area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, i) => {
                const isAI = m.sender === 'assistant';
                return (
                  <div 
                    key={i} 
                    className={`flex gap-3 max-w-[85%] ${
                      isAI ? 'self-start' : 'self-end flex-row-reverse ml-auto'
                    }`}
                  >
                    <div className={`w-8.5 h-8.5 rounded-lg border flex items-center justify-center text-xs font-extrabold shrink-0 select-none ${
                      isAI 
                        ? 'bg-blue-600/10 border-blue-500/10 text-blue-600' 
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      {isAI ? <Bot className="w-4.5 h-4.5" /> : <UserIcon className="w-4 h-4" />}
                    </div>

                    <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-3xs border whitespace-pre-wrap ${
                      isAI 
                        ? 'bg-blue-50/40 border-blue-200/30 text-slate-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      {m.text}
                      <span className="block text-[8px] text-slate-400 font-mono text-right mt-1 font-semibold">{m.timestamp}</span>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
                  <div className="w-8.5 h-8.5 rounded-lg bg-blue-105 border text-blue-600 flex items-center justify-center text-xs font-black">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="p-3.5 bg-slate-100 border rounded-2xl text-xs font-bold text-slate-500">
                    ИИ-ассистент обдумывает ответ...
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Form Control bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="p-4 border-t border-slate-100 bg-slate-50/30 flex gap-2"
            >
              <input
                type="text"
                placeholder="Сформулируйте свой запрос на русском..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !inputText.trim()}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-3 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Diagram constructor visualizer */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
            <Workflow className="w-5.5 h-5.5 text-indigo-500" />
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Генератор структурных блок-схем</h4>
              <p className="text-xs text-slate-400 font-medium">Опишите процесс, и ИИ смоделирует наглядную карту переходов и узлов</p>
            </div>
          </div>

          {/* Form input schema */}
          <form onSubmit={handleCreateDiagram} className="flex gap-2.5 max-w-2xl">
            <input
              type="text"
              value={schemaText}
              onChange={e => setSchemaText(e.target.value)}
              placeholder="Схема регламента сдачи задач на проверку..."
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={isGeneratingSchema || !schemaText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              {isGeneratingSchema ? 'Моделирование...' : 'Сгенерировать'}
            </button>
          </form>

          {/* Chart Board Container */}
          {showFlowChart && (
            <div className="border border-slate-200 bg-slate-50/50 p-6 rounded-2xl flex flex-col justify-between space-y-6">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                  <span>{schemaText} (Генерация ИИ)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleExportDiagram('png')}
                    className="p-1.5 bg-white border rounded-lg text-slate-500 hover:text-slate-800 text-xs shadow-3xs flex items-center gap-1"
                    title="PNG Экспорт"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </button>
                  <button 
                    onClick={() => handleExportDiagram('pdf')}
                    className="p-1.5 bg-white border rounded-lg text-slate-500 hover:text-slate-800 text-xs shadow-3xs flex items-center gap-1"
                    title="PDF Экспорт"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Render structure cards flow chart */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-6 px-2">
                
                {/* Node 1 */}
                <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm text-center max-w-44 border-t-4 border-t-blue-500 relative shrink-0">
                  <span className="text-[9px] bg-blue-50 text-blue-700 font-extrabold px-1.5 py-0.5 rounded uppercase block mb-1 hover:animate-pulse">
                    Шаг 1: Старт
                  </span>
                  <span className="text-xs font-black text-slate-800 font-sans block">Открытие задачи</span>
                  <p className="text-[10px] text-slate-400 font-medium block mt-1 leading-normal">Заполнение ТЗ по критериям DoD</p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center shrink-0">
                  <ChevronRight className="w-5 h-5 text-slate-400 rotate-90 md:rotate-0" />
                  <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase mt-0.5">Взятие</span>
                </div>

                {/* Node 2 */}
                <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm text-center max-w-44 border-t-4 border-t-amber-500 relative shrink-0 font-sans">
                  <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded uppercase block mb-1">
                    Шаг 2: В работе
                  </span>
                  <span className="text-xs font-black text-slate-800 block">Разработка ПО</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">Прикрепление выполненных файлов</p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center shrink-0">
                  <ChevronRight className="w-5 h-5 text-slate-400 rotate-90 md:rotate-0" />
                  <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase mt-0.5">Ревью</span>
                </div>

                {/* Node 3 */}
                <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm text-center max-w-44 border-t-4 border-t-purple-500 relative shrink-0">
                  <span className="text-[9px] bg-purple-50 text-purple-700 font-extrabold px-1.5 py-0.5 rounded uppercase block mb-1">
                    Шаг 3: На проверке
                  </span>
                  <span className="text-xs font-black text-slate-800 block">Код-ревью PM</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">Контроль соответствия макету</p>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center shrink-0">
                  <ChevronRight className="w-5 h-5 text-slate-400 rotate-90 md:rotate-0" />
                  <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase mt-0.5">Приём</span>
                </div>

                {/* Node 4 */}
                <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm text-center max-w-44 border-t-4 border-t-emerald-500 relative shrink-0">
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded uppercase block mb-1 animate-pulse">
                    Шаг 4: Финал
                  </span>
                  <span className="text-xs font-black text-slate-800 block">Закрытие задачи</span>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">Изменения залиты на продакшн</p>
                </div>

              </div>

              <span className="text-[10px] text-slate-400 block text-center font-medium mt-4">
                Схема смоделирована с помощью алгоритмов глубокого анализа корпоративных паттернов.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
