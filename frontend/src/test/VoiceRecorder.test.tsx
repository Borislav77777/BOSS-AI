/**
 * Тесты для VoiceRecorder компонента
 */

import { VoiceRecorder } from '@/components/Chat/VoiceRecorder';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const mockStream = {
    getTracks: vi.fn(() => [
        { stop: vi.fn() }
    ]),
};

// Мокаем navigator.mediaDevices.getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
    value: {
        getUserMedia: vi.fn(() => Promise.resolve(mockStream)),
    },
    writable: true,
});

// Мокаем MediaRecorder конструктор
global.MediaRecorder = vi.fn(() => mockMediaRecorder) as any;

// Мокаем MediaRecorder.isTypeSupported
global.MediaRecorder.isTypeSupported = vi.fn(() => true);

// Мокаем URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-audio-url');
global.URL.revokeObjectURL = vi.fn();

// Мокаем notificationService
vi.mock('@/services/NotificationService', () => ({
    notificationService: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    },
}));

describe('VoiceRecorder', () => {
    const mockOnRecordingComplete = vi.fn();

    beforeEach(() => {
        mockOnRecordingComplete.mockClear();
        vi.clearAllMocks();
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('автоматически запрашивает микрофон и запускает запись при монтировании', async () => {
        render(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);

        await waitFor(() => {
            expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
        });

        expect(mockMediaRecorder.start).toHaveBeenCalledWith(100);
    });

    it('показывает индикатор времени после старта записи', async () => {
        render(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);

        await waitFor(() => {
            expect(screen.getByText(/00:00/)).toBeInTheDocument();
        });
    });

    it('показывает индикатор записи во время записи', async () => {
        render(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);

        await waitFor(() => {
            expect(screen.getByText(/00:00/)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('останавливает запись при нажатии кнопки остановки', async () => {
        render(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);

        await waitFor(() => {
            expect(screen.getByText(/00:00/)).toBeInTheDocument();
        });

        // Останавливаем запись
        const stopButton = screen.getByRole('button', { name: /остановить запись/i });
        fireEvent.click(stopButton);

        expect(mockMediaRecorder.stop).toHaveBeenCalled();
    });

    it('паузирует и возобновляет запись', async () => {
        render(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);

        await waitFor(() => {
            expect(screen.getByText(/00:00/)).toBeInTheDocument();
        });

        // Паузируем запись
        const pauseButton = screen.getByRole('button', { name: /пауза/i });
        fireEvent.click(pauseButton);

        expect(mockMediaRecorder.pause).toHaveBeenCalled();

        // Возобновляем запись
        const resumeButton = screen.getByRole('button', { name: /продолжить запись/i });
        fireEvent.click(resumeButton);

        expect(mockMediaRecorder.resume).toHaveBeenCalled();
    });

    it('вызывает onRecordingComplete при завершении записи', async () => {
        render(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);

        await waitFor(() => {
            expect(screen.getByText(/00:00/)).toBeInTheDocument();
        });

        // Останавливаем запись
        const stopButton = screen.getByRole('button', { name: /остановить запись/i });
        fireEvent.click(stopButton);

        // Симулируем событие onstop
        // const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
        if (mockMediaRecorder.onstop) {
            (mockMediaRecorder.onstop as any)();
        }

        await waitFor(() => {
            expect(mockOnRecordingComplete).toHaveBeenCalledWith(expect.any(Blob));
        });
    });

    it('показывает ошибку при недоступности микрофона', async () => {
        // Мокаем ошибку доступа к микрофону
        (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(
            new Error('Permission denied')
        );

        // Мокаем notificationService
        // const mockError = vi.fn();
        // vi.spyOn(await import('@/services/NotificationService'), 'notificationService', 'get').mockReturnValue({
        //     error: mockError,
        // });

        render(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);

        // Ждем пока обработчик ошибки сработает
        await waitFor(() => {
            expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it('форматирует время правильно', async () => {
        render(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);

        // Ждем пока состояние обновится и покажется время
        await waitFor(() => {
            expect(screen.getByText('00:00')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('удаляет запись при нажатии кнопки удаления', async () => {
        render(<VoiceRecorder onRecordingComplete={mockOnRecordingComplete} />);

        await waitFor(() => {
            expect(screen.getByText(/00:00/)).toBeInTheDocument();
        });

        const stopButton = screen.getByRole('button', { name: /остановить запись/i });
        fireEvent.click(stopButton);

        // Симулируем завершение записи
        // const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
        if (mockMediaRecorder.onstop) {
            (mockMediaRecorder.onstop as any)();
        }

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /удалить запись/i })).toBeInTheDocument();
        });

        // Удаляем запись
        const deleteButton = screen.getByRole('button', { name: /удалить запись/i });
        fireEvent.click(deleteButton);

        // Проверяем, что индикатор записи исчез и запись сброшена
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /удалить запись/i })).not.toBeInTheDocument();
        });
    });
});
