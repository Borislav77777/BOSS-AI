import { serviceManager } from '@/services/ServiceManager';
import type { ServiceConfig, ServiceModule } from '@/types/services';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ServiceManager chat buttons grouping', () => {
  beforeEach(() => {
    (serviceManager as any).services = [];
    // Очищаем DOM перед каждым тестом
    document.body.innerHTML = '';
  });

  it('groups chat buttons by position and service', () => {
    const s1: ServiceConfig = {
      id: 'svc-1', name: 'Svc1', description: '', icon: 'Zap', version: '1.0.0', isActive: true,
      category: 'ai', priority: 1, author: 't', tools: [], settings: {}, dependencies: [],
      chatButtons: [
        { id: 'a', name: 'A', icon: 'Zap', description: '', action: 'a', isEnabled: true, position: 'top' },
        { id: 'b', name: 'B', icon: 'Zap', description: '', action: 'b', isEnabled: true, position: 'bottom' },
      ],
    };
    const s2: ServiceConfig = {
      id: 'svc-2', name: 'Svc2', description: '', icon: 'Zap', version: '1.0.0', isActive: true,
      category: 'ai', priority: 2, author: 't', tools: [], settings: {}, dependencies: [],
      chatButtons: [
        { id: 'c', name: 'C', icon: 'Zap', description: '', action: 'c', isEnabled: true, position: 'top' },
      ],
    };
    (serviceManager as any).services = [
      { config: s1, module: null, isLoaded: false },
      { config: s2, module: null, isLoaded: false },
    ] as ServiceModule[];

    const grouped = (serviceManager as any).getChatButtonsGrouped();
    expect(grouped.top.length).toBe(2);
    expect(grouped.bottom.length).toBe(1);
    const topServiceIds = grouped.top.map((g: any) => g.serviceId);
    expect(topServiceIds).toContain('svc-1');
    expect(topServiceIds).toContain('svc-2');
  });
});
