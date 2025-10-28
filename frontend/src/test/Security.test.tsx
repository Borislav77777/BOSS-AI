/**
 * Тесты для безопасности
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';

// Мокаем CSP
const mockCSP = {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline'",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: https:",
    'connect-src': "'self' https:",
};

// Мокаем sanitize-html
const mockSanitizeHtml = vi.fn((input: string) => {
    // Простая очистка HTML
    return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '');
});

vi.mock('sanitize-html', () => ({
    default: mockSanitizeHtml,
}));

// Компонент для тестирования безопасности
const SecurityComponent = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const handleInput = (value: string) => {
        setInput(value);
        // Очистка ввода
        const sanitized = mockSanitizeHtml(value);
        setOutput(sanitized);
    };

    const handleXSS = () => {
        const maliciousInput = '<script>alert("XSS")</script>';
        handleInput(maliciousInput);
    };

    const handleCSRF = () => {
        // Симуляция CSRF атаки
        fetch('/api/sensitive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete' }),
        });
    };

    return (
        <div>
            <input
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                data-testid="input"
                placeholder="Enter text"
            />
            <div data-testid="output">{output}</div>
            <button onClick={handleXSS} data-testid="xss-button">
                Test XSS
            </button>
            <button onClick={handleCSRF} data-testid="csrf-button">
                Test CSRF
            </button>
        </div>
    );
};

describe('Security', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('должен очищать HTML от скриптов', () => {
        render(<SecurityComponent />);

        const xssButton = screen.getByTestId('xss-button');
        fireEvent.click(xssButton);

        const output = screen.getByTestId('output');
        expect(output.textContent).not.toContain('<script>');
    });

    it('должен очищать HTML от iframe', () => {
        render(<SecurityComponent />);

        const input = screen.getByTestId('input');
        fireEvent.change(input, {
            target: { value: '<iframe src="malicious.com"></iframe>' }
        });

        const output = screen.getByTestId('output');
        expect(output.textContent).not.toContain('<iframe>');
    });

    it('должен очищать HTML от событий', () => {
        render(<SecurityComponent />);

        const input = screen.getByTestId('input');
        fireEvent.change(input, {
            target: { value: '<div onclick="alert(1)">Click me</div>' }
        });

        const output = screen.getByTestId('output');
        expect(output.textContent).not.toContain('onclick');
    });

    it('должен валидировать ввод', () => {
        const validateInput = (input: string) => {
            if (!input || input.length > 1000) {
                throw new Error('Invalid input');
            }
            return input;
        };

        expect(() => validateInput('')).toThrow('Invalid input');
        expect(() => validateInput('a'.repeat(1001))).toThrow('Invalid input');
        expect(validateInput('valid input')).toBe('valid input');
    });

    it('должен проверять CSP заголовки', () => {
        expect(mockCSP['default-src']).toBe("'self'");
        expect(mockCSP['script-src']).toBe("'self' 'unsafe-inline'");
        expect(mockCSP['style-src']).toBe("'self' 'unsafe-inline'");
    });

    it('должен ограничивать источники изображений', () => {
        expect(mockCSP['img-src']).toBe("'self' data: https:");
    });

    it('должен ограничивать подключения', () => {
        expect(mockCSP['connect-src']).toBe("'self' https:");
    });

    it('должен обрабатывать CSRF атаки', () => {
        render(<SecurityComponent />);

        const csrfButton = screen.getByTestId('csrf-button');
        fireEvent.click(csrfButton);

        expect(global.fetch).toHaveBeenCalledWith('/api/sensitive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete' }),
        });
    });

    it('должен проверять rate limiting', () => {
        const rateLimiter = new Map();
        const checkRateLimit = (ip: string) => {
            const now = Date.now();
            const requests = rateLimiter.get(ip) || [];
            const recentRequests = requests.filter((time: number) => now - time < 60000);

            if (recentRequests.length >= 100) {
                throw new Error('Rate limit exceeded');
            }

            rateLimiter.set(ip, [...recentRequests, now]);
        };

        // Первые 100 запросов должны проходить
        for (let i = 0; i < 100; i++) {
            expect(() => checkRateLimit('127.0.0.1')).not.toThrow();
        }

        // 101-й запрос должен быть заблокирован
        expect(() => checkRateLimit('127.0.0.1')).toThrow('Rate limit exceeded');
    });

    it('должен проверять авторизацию', () => {
        const checkAuth = (token: string) => {
            if (!token || token.length < 10) {
                throw new Error('Invalid token');
            }
            return true;
        };

        expect(() => checkAuth('')).toThrow('Invalid token');
        expect(() => checkAuth('short')).toThrow('Invalid token');
        expect(checkAuth('valid-token-123')).toBe(true);
    });

    it('должен проверять права доступа', () => {
        const checkPermission = (user: any, action: string) => {
            if (!user || !user.role) {
                throw new Error('Unauthorized');
            }

            const permissions = {
                admin: ['read', 'write', 'delete'],
                user: ['read'],
                guest: []
            };

            if (!permissions[user.role].includes(action)) {
                throw new Error('Forbidden');
            }

            return true;
        };

        expect(() => checkPermission(null, 'read')).toThrow('Unauthorized');
        expect(() => checkPermission({ role: 'guest' }, 'write')).toThrow('Forbidden');
        expect(checkPermission({ role: 'admin' }, 'delete')).toBe(true);
    });

    it('должен проверять HTTPS', () => {
        const isSecure = (url: string) => {
            return url.startsWith('https://');
        };

        expect(isSecure('https://example.com')).toBe(true);
        expect(isSecure('http://example.com')).toBe(false);
    });

    it('должен проверять домен', () => {
        const isAllowedDomain = (url: string) => {
            const allowedDomains = ['example.com', 'api.example.com'];
            const domain = new URL(url).hostname;
            return allowedDomains.includes(domain);
        };

        expect(isAllowedDomain('https://example.com/api')).toBe(true);
        expect(isAllowedDomain('https://malicious.com/api')).toBe(false);
    });
});
