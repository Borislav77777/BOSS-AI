import { serviceManager } from '@/services/ServiceManager';
import type { ServiceConfig, ServiceModule } from '@/types/services';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ServiceManager config validation and normalization', () => {
  beforeEach(() => {
    // reset services list
    (serviceManager as any).services = [];
    // Очищаем DOM перед каждым тестом
    document.body.innerHTML = '';
  });

  const makeService = (config: Partial<ServiceConfig>): ServiceModule => {
    const full: ServiceConfig = {
      id: 'test-service',
      name: 'Test Service',
      description: 'desc',
      icon: 'Settings',
      version: '0.0.0',
      isActive: true,
      tools: [
        {
          id: 'toolA',
          name: 'Tool A',
          description: 'd',
          isEnabled: true,
          action: 'toolA',
          isChatFunction: true,
        } as unknown as any,
      ],
      settings: {},
      dependencies: [],
      category: 'test',
      priority: 0,
      ...config,
    };
    return { config: full, module: null, isLoaded: false } as ServiceModule;
  };

  it('defaults chatButtons position to top and enables when missing', () => {
    const mod = makeService({
      chatButtons: [
        { id: 'b1', name: 'B1', icon: 'Square', description: 'd', action: 'toolA' } as any,
        { id: 'b2', name: 'B2', icon: 'Square', description: 'd', action: 'toolA', position: 'invalid' as any } as any,
      ],
    });

    (serviceManager as any).services = [mod];
    serviceManager.validateAllServices();

    const cfg = (serviceManager.getService('test-service') as ServiceModule).config;
    expect(cfg.chatButtons).toBeTruthy();
    const [b1, b2] = cfg.chatButtons!;
    expect(b1.isEnabled).toBe(true);
    expect(b1.position).toBe('top');
    expect(b2.position).toBe('top');
  });

  it('groups chat buttons by position and service', () => {
    const mod = makeService({
      chatButtons: [
        { id: 't', name: 'Top', icon: 'Square', description: 'd', action: 'toolA', position: 'top', isEnabled: true },
        { id: 'b', name: 'Bottom', icon: 'Square', description: 'd', action: 'toolA', position: 'bottom', isEnabled: true },
      ] as any,
    });

    (serviceManager as any).services = [mod];
    serviceManager.validateAllServices();
    const grouped = serviceManager.getChatButtonsGrouped();
    expect(grouped.top.length).toBe(1);
    expect(grouped.bottom.length).toBe(1);
    expect(grouped.top[0].buttons[0].id).toBe('t');
    expect(grouped.bottom[0].buttons[0].id).toBe('b');
  });
  it('normalizes tool.action, chatButtons.position and warns on mismatches', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const config: ServiceConfig = {
      id: 'validator-test',
      name: 'Validator Test',
      description: 'Service for validation tests',
      icon: 'Zap',
      version: '1.0.0',
      isActive: true,
      category: 'utility',
      priority: 1,
      author: 'Test',
      tools: [
        {
          id: 'no-action',
          name: 'No Action',
          description: 'Should get action=id',
          icon: 'Settings',
          // action intentionally omitted
          isEnabled: true,
          category: 'main',
        } as unknown as any,
        {
          id: 'mismatch',
          name: 'Mismatch',
          description: 'action differs',
          icon: 'Settings',
          action: 'different',
          isEnabled: true,
          category: 'main',
        } as unknown as any,
      ],
      settings: {},
      dependencies: [],
      chatFunctions: [
        {
          id: 'cf-1',
          name: 'CF1',
          description: 'chat fn',
          isChatFunction: true,
          chatPrompt: 'Do it',
        } as unknown as any,
      ],
      chatButtons: [
        {
          id: 'btn-top',
          name: 'Top',
          icon: 'Zap',
          description: 'top button',
          action: 'no-action',
          isEnabled: true,
          position: 'invalid' as unknown as any,
        },
        {
          id: 'btn-missing',
          name: 'Missing',
          icon: 'Zap',
          description: 'invalid action',
          action: 'not-exists',
          isEnabled: true,
          position: 'bottom',
        },
      ],
    };

    const module: ServiceModule = { config, module: null, isLoaded: false };
    (serviceManager as any).services = [module];

    serviceManager.validateAllServices();

    const updated = (serviceManager as any).services[0].config as ServiceConfig;
    // no-action tool should acquire action=id
    const normalizedTool = updated.tools.find(t => t.id === 'no-action');
    expect(normalizedTool?.action).toBe('no-action');

    // mismatch should warn
    expect(warnSpy).toHaveBeenCalled();

    // invalid position should default to top
    const btnTop = updated.chatButtons?.find(b => b.id === 'btn-top');
    expect(btnTop?.position).toBe('top');

    // missing action should warn but stay as-is
    const btnMissing = updated.chatButtons?.find(b => b.id === 'btn-missing');
    expect(btnMissing?.action).toBe('not-exists');

    warnSpy.mockRestore();
  });
});
