export type UserRole = 'Администратор' | 'Руководитель проекта' | 'Сотрудник' | 'Директор';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  dept: string;
  status: 'Активен' | 'Приостановлен';
  avatar?: string;
}

export type ProjectStatus = 'Планирование' | 'В работе' | 'На проверке' | 'Завершено';

export interface Project {
  id: number;
  title: string;
  desc: string;
  lead: string;
  start: string;
  end: string;
  status: ProjectStatus;
  progress: number; // 0 to 100
}

export type TaskStatus = 'Открыта' | 'В работе' | 'На проверке' | 'Готово';
export type TaskPriority = 'Низкий' | 'Средний' | 'Высокий' | 'Критический';

export interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
}

export interface TaskFile {
  id: number;
  name: string;
  size: string;
}

export interface Task {
  id: number;
  title: string;
  desc: string;
  projectId: number;
  assignee: string; // FIO
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  dateCreated: string;
  comments: Comment[];
  files: TaskFile[];
}

export interface WikiDoc {
  id: number;
  title: string;
  cat: 'Общие регламенты' | 'Проектная документация' | 'Инструкции' | 'Частые вопросы';
  content: string;
  author: string;
  date: string;
  accessLevel: 'Все' | 'Администраторы' | 'Руководство';
}

export type EventType = 'Встреча' | 'Дедлайн' | 'Спринт' | 'Контрольная точка';

export interface CalendarEvent {
  id: number;
  title: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  participants: string[];
  desc: string;
}

export interface NotificationLog {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}
