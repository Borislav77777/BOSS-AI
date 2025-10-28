/**
 * Типы для Anti-Procrastination OS
 * Система борьбы с прокрастинацией через микро-действия
 */

export interface MicroAction {
  id: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface TimeBlock {
  id: string;
  taskId: string;
  title: string;
  duration: number; // минуты
  microActions: MicroAction[];
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  actualDuration?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  timeBlocks: TimeBlock[];
  tags?: string[];
  context?: string; // Контекст для AI декомпозиции
}

export interface PomodoroSettings {
  workDuration: number; // 25 минут по умолчанию
  shortBreak: number;   // 5 минут
  longBreak: number;    // 15 минут
  sessionsBeforeLongBreak: number; // 4 сессии
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

export interface DailyStats {
  date: string; // ISO date
  completedTasks: number;
  completedBlocks: number;
  totalMinutes: number;
  focusScore: number; // 0-100
  pomodorosCompleted: number;
  distractions: number;
}

export interface UserSettings {
  pomodoro: PomodoroSettings;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  detoxMode: {
    enabled: boolean;
    blockedSites: string[];
  };
  theme: 'light' | 'dark' | 'auto';
  language: 'ru' | 'en';
}

export interface APOSData {
  tasks: Task[];
  currentBlock: TimeBlock | null;
  completedBlocks: TimeBlock[];
  dailyStats: DailyStats[];
  settings: UserSettings;
  lastSync: Date;
}

export interface DecompositionRequest {
  task: string;
  context?: string;
  targetDuration?: number; // желаемая длительность блоков
}

export interface DecompositionResponse {
  subtasks: MicroAction[];
  estimatedTime: number;
  suggestedBlocks: number;
  complexity: 'easy' | 'medium' | 'hard';
}

export interface MotivationMessage {
  type: 'encouragement' | 'reminder' | 'achievement' | 'warning';
  message: string;
  action?: () => void;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number; // 0-100
  requirement: number;
}

// Интерфейс для работы с API микросервисов
export interface APOSApi {
  decomposeTask(request: DecompositionRequest): Promise<DecompositionResponse>;
  estimateTime(task: string): Promise<number>;
  getMotivation(context: string): Promise<MotivationMessage>;
}

// Типы для компонентов
export interface TaskBlockProps {
  task: Task;
  onStart: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onHelp: (taskId: string) => void;
  onDecompose: (taskId: string) => void;
}

export interface TimerProps {
  duration: number;
  onComplete: () => void;
  onPause?: () => void;
  onResume?: () => void;
  autoStart?: boolean;
}

export interface ProgressTrackerProps {
  tasks: Task[];
  dailyStats: DailyStats;
  achievements: Achievement[];
}
