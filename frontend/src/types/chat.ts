/**
 * Типы для интеграции с чатом
 */

import { GPTSettings } from './gpt-settings';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isGenerating?: boolean;
  isStopped?: boolean;
  metadata?: {
    promptId?: string;
    originalPrompt?: string;
    improvedPrompt?: string;
    suggestions?: string[];
    explanation?: string;
  };
}

export interface PromptImprovementData {
  originalPrompt: string;
  improvedPrompt: string;
  suggestions: string[];
  explanation: string;
}

export interface PromptWithSettings {
  id: string;
  title: string;
  body: string;
  settings?: GPTSettings;
}

export interface ChatEventData {
  type: 'insert-prompt' | 'improve-prompt' | 'start-generation' | 'stop-generation';
  data: Record<string, unknown>;
}

export interface GenerationState {
  isGenerating: boolean;
  currentMessageId?: string;
  stopGeneration?: () => void;
}

// События чата
export interface ChatEvents {
  'chat:insert-prompt': CustomEvent<{ id: string; body: string; title?: string }>;
  'chat:improve-prompt': CustomEvent<PromptImprovementData>;
  'chat:start-generation': CustomEvent<{ messageId: string; prompt: string }>;
  'chat:stop-generation': CustomEvent<{ messageId: string }>;
  'chat:update-message': CustomEvent<{ messageId: string; content: string; isGenerating?: boolean }>;
  'chat:attach-context': CustomEvent<ChatContextButton>;
  'chat:detach-context': CustomEvent<{ id: string }>;
}

// Контекстные кнопки для чата
export interface ChatContextButton {
  id: string;
  type: 'project' | 'document' | 'file' | 'image' | 'prompt';
  title: string;
  icon: string;
  content?: string; // Для документов и промптов
  metadata?: Record<string, unknown>;
  removable: boolean;
  source: 'workspace' | 'prompts' | 'manual';
}

// Контекст чата
export interface ChatContext {
  attachedItems: ChatContextButton[];
  activeProject?: {
    id: string;
    title: string;
    type: 'project';
  };
  activeDocument?: {
    id: string;
    title: string;
    type: 'document';
    content?: string;
  };
  userLocation: 'workspace' | 'project' | 'document';
}
