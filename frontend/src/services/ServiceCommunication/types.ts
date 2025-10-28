/**
 * Типы для прямого взаимодействия между сервисами
 */

export interface ServiceCommunicationChannel {
  id: string;
  name: string;
  type: 'direct' | 'broadcast' | 'multicast' | 'unicast';
  participants: string[];
  isActive: boolean;
  metadata: {
    createdAt: Date;
    lastActivity: Date;
    messageCount: number;
  };
}

export interface ServiceMessage {
  id: string;
  channelId: string;
  senderId: string;
  recipientId?: string;
  type: 'request' | 'response' | 'notification' | 'data' | 'command';
  content: any;
  timestamp: Date;
  ttl?: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  metadata: {
    correlationId?: string;
    replyTo?: string;
    tags: string[];
    encryption?: boolean;
  };
}

export interface ServiceCommunicationManager {
  // Управление каналами
  createChannel(name: string, type: 'direct' | 'broadcast' | 'multicast' | 'unicast', participants: string[]): ServiceCommunicationChannel;
  joinChannel(channelId: string, serviceId: string): boolean;
  leaveChannel(channelId: string, serviceId: string): boolean;
  getChannel(channelId: string): ServiceCommunicationChannel | null;
  getServiceChannels(serviceId: string): ServiceCommunicationChannel[];

  // Отправка сообщений
  sendMessage(message: ServiceMessage): Promise<boolean>;
  sendDirectMessage(recipientId: string, content: any, type?: string): Promise<boolean>;
  broadcastMessage(content: any, type?: string): Promise<boolean>;
  multicastMessage(recipients: string[], content: any, type?: string): Promise<boolean>;

  // Получение сообщений
  getMessages(channelId: string, limit?: number): ServiceMessage[];
  getServiceMessages(serviceId: string, limit?: number): ServiceMessage[];
  getUnreadCount(serviceId: string): number;

  // Подписки
  subscribeToChannel(channelId: string, serviceId: string, callback: (message: ServiceMessage) => void): string;
  subscribeToService(serviceId: string, callback: (message: ServiceMessage) => void): string;
  unsubscribe(subscriptionId: string): void;

  // События
  onMessageReceived: (callback: (message: ServiceMessage) => void) => void;
  onChannelCreated: (callback: (channel: ServiceCommunicationChannel) => void) => void;
  onChannelDestroyed: (callback: (channelId: string) => void) => void;
  onServiceJoined: (callback: (channelId: string, serviceId: string) => void) => void;
  onServiceLeft: (callback: (channelId: string, serviceId: string) => void) => void;

  // Управление состоянием
  getServiceStatus(serviceId: string): 'online' | 'offline' | 'busy' | 'away';
  setServiceStatus(serviceId: string, status: 'online' | 'offline' | 'busy' | 'away'): void;
  getOnlineServices(): string[];

  // Синхронизация данных
  syncServiceData(serviceId: string, data: any): void;
  getServiceData(serviceId: string): any;
  subscribeToServiceData(serviceId: string, callback: (data: any) => void): string;

  // Управление
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getStats(): ServiceCommunicationStats;
}

export interface ServiceCommunicationStats {
  totalChannels: number;
  totalMessages: number;
  activeServices: number;
  onlineServices: string[];
  messageRate: number;
  averageLatency: number;
  errorRate: number;
}

export interface ServiceDataSync {
  serviceId: string;
  data: any;
  version: number;
  timestamp: Date;
  checksum: string;
}

export interface ServiceStatus {
  serviceId: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen: Date;
  capabilities: string[];
  metadata: Record<string, any>;
}
