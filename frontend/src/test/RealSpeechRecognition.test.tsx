/**
 * Тесты для реального распознавания речи
 */

import { VoiceInterface } from '@/components/Chat/VoiceInterface';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Мокаем Web Speech API
type MockSpeechRecognition = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start: () => void;
    stop: () => void;
    onresult: ((e: any) => void) | null;
    onerror: ((e: any) => void) | null;
    onend: (() => void) | null;
};

const mockSpeechRecognition: MockSpeechRecognition = {
    continuous: false,
    interimResults: false,
    lang: 'ru-RU',
    maxAlternatives: 1,
    start: vi.fn(),
    stop: vi.fn(),
    onresult: null,
    onerror: null,
    onend: null,
};

// Мокаем глобальные объекты
Object.defineProperty(window, 'SpeechRecognition', {
    writable: true,
    configurable: true,
    value: vi.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
    writable: true,
    configurable: true,
    value: vi.fn(() => mockSpeechRecognition),
});

describe('Real Speech Recognition', () => {
    const mockOnTranscriptionComplete = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
        // Восстанавливаем Web Speech моки перед каждым тестом
        Object.defineProperty(window, 'SpeechRecognition', {
            writable: true,
            configurable: true,
            value: vi.fn(() => mockSpeechRecognition),
        });
        Object.defineProperty(window, 'webkitSpeechRecognition', {
            writable: true,
            configurable: true,
            value: vi.fn(() => mockSpeechRecognition),
        });
    });

    test('должен отображать ошибку, если Web Speech API не поддерживается', async () => {
        // Удаляем поддержку Web Speech API
        delete (window as any).SpeechRecognition;
        delete (window as any).webkitSpeechRecognition;

        render(
            <VoiceInterface
                onTranscriptionComplete={mockOnTranscriptionComplete}
                onClose={mockOnClose}
                isVisible={true}
            />
        );

        await waitFor(() => {
            const content = document.querySelector('.transcription-content') as HTMLElement | null;
            expect(content?.textContent || '').toContain('Ошибка: Web Speech API не поддерживается');
        });
    });

    test('должен инициализировать распознавание речи при монтировании', async () => {
        render(
            <VoiceInterface
                onTranscriptionComplete={mockOnTranscriptionComplete}
                onClose={mockOnClose}
                isVisible={true}
            />
        );

        await waitFor(() => {
            expect(mockSpeechRecognition.start).toHaveBeenCalled();
        });
    });

    test('должен обрабатывать результаты распознавания', async () => {
        render(
            <VoiceInterface
                onTranscriptionComplete={mockOnTranscriptionComplete}
                onClose={mockOnClose}
                isVisible={true}
            />
        );

        // Ждем пока компонент навесит обработчик
        await waitFor(() => {
            expect(typeof mockSpeechRecognition.onresult).toBe('function');
        });

        // Симулируем событие результата
        const mockEvent = {
            resultIndex: 0,
            results: [
                Object.assign([
                    {
                        transcript: 'Привет мир',
                        confidence: 0.95,
                    },
                ], { isFinal: true, length: 1 }),
            ],
        };

        // Вызываем обработчик результата
        if (typeof mockSpeechRecognition.onresult === 'function') {
            mockSpeechRecognition.onresult(mockEvent);
        }

        await waitFor(() => {
            const content = document.querySelector('.transcription-content') as HTMLElement | null;
            expect(content?.textContent || '').toContain('Привет мир');
        });
    });

    test('должен обрабатывать промежуточные результаты', async () => {
        render(
            <VoiceInterface
                onTranscriptionComplete={mockOnTranscriptionComplete}
                onClose={mockOnClose}
                isVisible={true}
            />
        );

        await waitFor(() => {
            expect(typeof mockSpeechRecognition.onresult).toBe('function');
        });

        // Симулируем промежуточный результат
        const mockEvent = {
            resultIndex: 0,
            results: [
                Object.assign([
                    {
                        transcript: 'Привет',
                        confidence: 0.8,
                    },
                ], { isFinal: false, length: 1 }),
            ],
        };

        // Вызываем обработчик результата
        if (typeof mockSpeechRecognition.onresult === 'function') {
            mockSpeechRecognition.onresult(mockEvent);
        }

        await waitFor(() => {
            const content = document.querySelector('.transcription-content') as HTMLElement | null;
            expect(content?.textContent || '').toContain('Привет');
        });
    });

    test('должен обрабатывать ошибки распознавания', async () => {
        render(
            <VoiceInterface
                onTranscriptionComplete={mockOnTranscriptionComplete}
                onClose={mockOnClose}
                isVisible={true}
            />
        );

        await waitFor(() => {
            expect(typeof mockSpeechRecognition.onerror).toBe('function');
        });

        // Симулируем ошибку
        const mockErrorEvent = {
            error: 'network',
        };

        // Вызываем обработчик ошибки
        if (typeof mockSpeechRecognition.onerror === 'function') {
            mockSpeechRecognition.onerror(mockErrorEvent);
        }

        await waitFor(() => {
            const content = document.querySelector('.transcription-content') as HTMLElement | null;
            expect(content?.textContent || '').toContain('Ошибка: network');
        });
    });

    test('должен отправлять текст при нажатии кнопки отправки', async () => {
        render(
            <VoiceInterface
                onTranscriptionComplete={mockOnTranscriptionComplete}
                onClose={mockOnClose}
                isVisible={true}
            />
        );

        await waitFor(() => {
            expect(typeof mockSpeechRecognition.onresult).toBe('function');
        });

        // Симулируем результат распознавания
        const mockEvent = {
            resultIndex: 0,
            results: [
                Object.assign([
                    {
                        transcript: 'Тестовый текст',
                        confidence: 0.95,
                    },
                ], { isFinal: true, length: 1 }),
            ],
        };

        if (typeof mockSpeechRecognition.onresult === 'function') {
            mockSpeechRecognition.onresult(mockEvent);
        }

        await waitFor(() => {
            const content = document.querySelector('.transcription-content') as HTMLElement | null;
            expect(content?.textContent || '').toContain('Тестовый текст');
        });

        // Нажимаем кнопку отправки
        const sendButton = screen.getByRole('button', { name: /Отправить текст/i });
        await waitFor(() => {
            expect(sendButton).not.toBeDisabled();
        });
        fireEvent.click(sendButton);

        expect(mockOnTranscriptionComplete).toHaveBeenCalledWith('Тестовый текст');
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('должен перезапускать распознавание при завершении', async () => {
        render(
            <VoiceInterface
                onTranscriptionComplete={mockOnTranscriptionComplete}
                onClose={mockOnClose}
                isVisible={true}
            />
        );

        // Симулируем завершение распознавания
        if (typeof mockSpeechRecognition.onend === 'function') {
            mockSpeechRecognition.onend();
        }

        // Ждем перезапуска
        await waitFor(() => {
            expect(mockSpeechRecognition.start).toHaveBeenCalledTimes(2);
        }, { timeout: 200 });
    });
});
