import React, { useState, useEffect } from 'react';
import { User, Project, Task, WikiDoc, CalendarEvent, NotificationLog } from './types';
import { 
  INITIAL_USERS, 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_WIKI, 
  INITIAL_EVENTS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';

// Modular Component imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import ProjectsView from './components/ProjectsView';
import TasksView from './components/TasksView';
import KanbanView from './components/KanbanView';
import CalendarView from './components/CalendarView';
import WikiView from './components/WikiView';
import ReportsView from './components/ReportsView';
import AiView from './components/AiView';
import UsersView from './components/UsersView';
import ProfileView from './components/ProfileView';

// Toast interface
interface SystemToast {
  id: number;
  message: string;
}

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('office_auth_user');
    return cached ? JSON.parse(cached) : null;
  });

  // Global states populated from LocalStorage or default fallback mock datasets
  const [users, setUsers] = useState<User[]>(() => {
    const cached = localStorage.getItem('office_users');
    return cached ? JSON.parse(cached) : INITIAL_USERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const cached = localStorage.getItem('office_projects');
    return cached ? JSON.parse(cached) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const cached = localStorage.getItem('office_tasks');
    return cached ? JSON.parse(cached) : INITIAL_TASKS;
  });

  const [wikiDocs, setWikiDocs] = useState<WikiDoc[]>(() => {
    const cached = localStorage.getItem('office_wiki');
    return cached ? JSON.parse(cached) : INITIAL_WIKI;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const cached = localStorage.getItem('office_events');
    return cached ? JSON.parse(cached) : INITIAL_EVENTS;
  });

  const [activityLogs, setActivityLogs] = useState<NotificationLog[]>(() => {
    const cached = localStorage.getItem('office_activity');
    return cached ? JSON.parse(cached) : INITIAL_NOTIFICATIONS;
  });

  // Views switcher state
  const [currentView, setCurrentView] = useState('dashboard');

  // Toasts notifier lists
  const [toasts, setToasts] = useState<SystemToast[]>([]);

  // Synchronizers Effect
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('office_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('office_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('office_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('office_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('office_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('office_wiki', JSON.stringify(wikiDocs));
  }, [wikiDocs]);

  useEffect(() => {
    localStorage.setItem('office_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('office_activity', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Push audit action item dynamically
  const pushActivityLog = (log: { user: string; action: string; target: string }) => {
    const newLog: NotificationLog = {
      id: Date.now(),
      user: log.user,
      action: log.action,
      target: log.target,
      time: 'только что'
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 19)]); // cap to 20 logs for size limits
  };

  // Toast dispatch helper
  const triggerNotify = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Login handler
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    triggerNotify('До свидания! Сессия успешно завершена.');
  };

  // Nav routing constraint checkers
  const checkNavRoutingClearance = (view: string) => {
    if (!currentUser) return false;
    if (view === 'reports' && !(currentUser.role === 'Руководитель проекта' || currentUser.role === 'Директор')) {
      triggerNotify('У вас нет прав для совершения данного перехода');
      return false;
    }
    if (view === 'users' && currentUser.role !== 'Администратор') {
      triggerNotify('Доступ к разделу Пользователи ограничен Системным Администратором');
      return false;
    }
    return true;
  };

  const handleViewChange = (view: string) => {
    if (checkNavRoutingClearance(view)) {
      setCurrentView(view);
    }
  };

  // Auth Guard
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between relative overflow-hidden">
        <LoginView 
          testUsers={users} 
          onLogin={handleLogin} 
          onNotify={triggerNotify} 
        />

        {/* Global Toasts notifier drawer overlay */}
        <div className="fixed bottom-5 right-5 space-y-3.5 z-55 max-w-sm pointer-events-none">
          {toasts.map((t) => (
            <div 
              key={t.id} 
              className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-xl select-none flex items-center gap-3.5 transition duration-200 border-l-4 border-l-blue-500 animate-slide-in pointer-events-auto"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
              <p className="text-xs font-bold leading-normal">{t.message}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="office-app-wrapper" className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Side menus panel on the Left */}
      <Sidebar 
        user={currentUser} 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        onLogout={handleLogout} 
      />

      {/* Main panel views container on the Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation header */}
        <Header user={currentUser} currentView={currentView} />

        {/* Content routing wrapper cards */}
        <main className="flex-1 overflow-y-auto p-8 max-w-[1600px] w-full mx-auto pb-16">
          {currentView === 'dashboard' && (
            <DashboardView 
              projects={projects} 
              tasks={tasks} 
              events={events} 
              activityLogs={activityLogs} 
              onViewChange={handleViewChange} 
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView 
              projects={projects} 
              setProjects={setProjects} 
              currentUser={currentUser} 
              onNotify={triggerNotify} 
              onActivityLog={pushActivityLog} 
            />
          )}

          {currentView === 'tasks' && (
            <TasksView 
              tasks={tasks} 
              setTasks={setTasks} 
              projects={projects} 
              users={users} 
              currentUser={currentUser} 
              onNotify={triggerNotify} 
              onActivityLog={pushActivityLog} 
            />
          )}

          {currentView === 'kanban' && (
            <KanbanView 
              tasks={tasks} 
              setTasks={setTasks} 
              projects={projects} 
              onNotify={triggerNotify} 
              onActivityLog={pushActivityLog} 
              username={currentUser.name} 
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView 
              events={events} 
              setEvents={setEvents} 
              currentUser={currentUser} 
              users={users} 
              onNotify={triggerNotify} 
              onActivityLog={pushActivityLog} 
            />
          )}

          {currentView === 'wiki' && (
            <WikiView 
              wikiDocs={wikiDocs} 
              setWikiDocs={setWikiDocs} 
              currentUser={currentUser} 
              onNotify={triggerNotify} 
              onActivityLog={pushActivityLog} 
            />
          )}

          {currentView === 'reports' && (
            <ReportsView 
              tasks={tasks} 
              projects={projects} 
              onNotify={triggerNotify} 
            />
          )}

          {currentView === 'ai' && (
            <AiView 
              currentUser={currentUser} 
              onNotify={triggerNotify} 
            />
          )}

          {currentView === 'users' && (
            <UsersView 
              users={users} 
              setUsers={setUsers} 
              onNotify={triggerNotify} 
              onActivityLog={pushActivityLog} 
              adminName={currentUser.name} 
            />
          )}

          {currentView === 'profile' && (
            <ProfileView 
              user={currentUser} 
              setUser={setCurrentUser} 
              tasks={tasks} 
              onNotify={triggerNotify} 
              onActivityLog={pushActivityLog} 
              setAllUsers={setUsers} 
            />
          )}
        </main>
      </div>

      {/* Global Interactive Toast Notification overlays */}
      <div className="fixed bottom-6 right-6 space-y-3 z-55 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl select-none flex items-center gap-3.5 transition duration-200 border-l-4 border-l-blue-500 pointer-events-auto"
            style={{ animation: 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="w-2 h-2 rounded-full bg-blue-550 shrink-0"></div>
            <p className="text-xs font-bold leading-normal">{t.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
