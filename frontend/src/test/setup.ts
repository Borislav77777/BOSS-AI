/**
 * Настройка тестовой среды для Vitest
 */

import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';

// Расширения jest-dom работают с Vitest, подключаем типы через tsconfig
declare module 'vitest' {
  // Место для кастомных матчеров при необходимости
}

// Подавляем необработанные ошибки в тестах
const originalError = console.error;
const originalUnhandledRejection = window.onunhandledrejection;

beforeEach(() => {
  // Подавляем console.error для тестовых ошибок
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Test error') ||
       args[0].includes('Uncaught [Error: Test error]'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  // Подавляем необработанные отклонения промисов
  window.onunhandledrejection = (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('Test error')) {
      event.preventDefault();
    }
  };
});

afterEach(() => {
  console.error = originalError;
  window.onunhandledrejection = originalUnhandledRejection;
});

// Мокаем localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Мокаем URL.createObjectURL и URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Мокаем MediaRecorder API
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  ondataavailable: null,
  onstop: null,
  mimeType: 'audio/webm',
};

global.MediaRecorder = vi.fn(() => mockMediaRecorder) as any;

// Мокаем navigator.mediaDevices.getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: vi.fn(() => [
        { stop: vi.fn() }
      ]),
    })),
  },
  writable: true,
});

// Мокаем AudioContext для jsdom среды
class MockAudioContext {
  public sampleRate = 16000;
  public state: 'running' | 'suspended' | 'closed' = 'running';
  createAnalyser() {
    return {
      fftSize: 0,
      smoothingTimeConstant: 0,
      frequencyBinCount: 32,
      getByteFrequencyData: (_arr: Uint8Array) => {},
    } as unknown as AnalyserNode;
  }
  createMediaStreamSource(_stream: MediaStream) {
    return { connect: (_dest: unknown) => {} } as unknown as MediaStreamAudioSourceNode;
  }
  close() { this.state = 'closed'; return Promise.resolve(); }
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  configurable: true,
  value: MockAudioContext as unknown as typeof AudioContext,
});

// scrollTo не реализован в jsdom — замокаем
if (!('scrollTo' in window)) {
  // @ts-expect-error jsdom env
  window.scrollTo = vi.fn();
}

// jsdom: добавляем заглушку для scrollIntoView, которую вызывает Sidebar
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// Мокаем framer-motion для избежания CSS парсинга и window.scrollTo
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    img: 'img',
    svg: 'svg',
    path: 'path',
    circle: 'circle',
    rect: 'rect',
    line: 'line',
    polygon: 'polygon',
    polyline: 'polyline',
    ellipse: 'ellipse',
    g: 'g',
    defs: 'defs',
    clipPath: 'clipPath',
    mask: 'mask',
    pattern: 'pattern',
    linearGradient: 'linearGradient',
    radialGradient: 'radialGradient',
    stop: 'stop',
    text: 'text',
    tspan: 'tspan',
    textPath: 'textPath',
    foreignObject: 'foreignObject',
    switch: 'switch',
    symbol: 'symbol',
    use: 'use',
    view: 'view',
    marker: 'marker',
    metadata: 'metadata',
    title: 'title',
    desc: 'desc',
    animate: vi.fn(),
    useAnimation: vi.fn(),
    useMotionValue: vi.fn(),
    useTransform: vi.fn(),
    useSpring: vi.fn(),
    useInView: vi.fn(),
    useReducedMotion: vi.fn(),
    usePresence: vi.fn(),
    AnimatePresence: 'div',
    LayoutGroup: 'div',
    LayoutId: 'div',
    LazyMotion: 'div',
    domAnimation: {},
    domMax: {},
  },
  AnimatePresence: 'div',
  LayoutGroup: 'div',
  LayoutId: 'div',
  LazyMotion: 'div',
  domAnimation: {},
  domMax: {},
}));

// Мокаем fetch для service JSON (используется в ServiceManager в тестах)
const originalFetch = global.fetch as unknown as ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | undefined;
global.fetch = (async (input: any, init?: RequestInit) => {
  try {
    const url = typeof input === 'string' ? input : input?.url;
    if (typeof url === 'string' && url.startsWith('/services/')) {
      const filename = url.split('/').pop() || 'service.json';
      const id = filename.replace('.json', '');
      const responseBody = {
        id,
        name: id,
        description: `${id} test service`,
        icon: 'Settings',
        version: '0.0.0-test',
        isActive: true,
        tools: [],
        settings: {},
        dependencies: [],
        category: 'test',
        priority: 0,
      };
      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }) as unknown as Response;
    }
  } catch (_) {
    // fallthrough
  }
  if (originalFetch) {
    return originalFetch(input as any, init);
  }
  return new Response('', { status: 404 }) as unknown as Response;
}) as unknown as typeof fetch;
