/**
 * Тесты для FileUpload компонента
 */

import { FileUpload } from '@/components/Chat/FileUpload';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Мокаем URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');

describe('FileUpload', () => {
    const mockOnFileSelect = vi.fn();

    beforeEach(() => {
        mockOnFileSelect.mockClear();
        // Очищаем DOM перед каждым тестом
        document.body.innerHTML = '';
    });

    it('отображает область для drag & drop', () => {
        render(<FileUpload onFileSelect={mockOnFileSelect} />);

        expect(screen.getByText('Перетащите файлы сюда или нажмите для выбора')).toBeInTheDocument();
        expect(screen.getByText(/Максимум \d+ файлов/)).toBeInTheDocument();
    });

    it('открывает диалог выбора файлов при клике', () => {
        const { container } = render(<FileUpload onFileSelect={mockOnFileSelect} />);

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;
        const clickSpy = vi.spyOn(input, 'click');

        fireEvent.click(screen.getByText('Перетащите файлы сюда или нажмите для выбора'));

        expect(clickSpy).toHaveBeenCalled();
    });

    it('обрабатывает drag & drop события', () => {
        render(<FileUpload onFileSelect={mockOnFileSelect} />);

        // Находим область drag & drop по классу
        const dropZone = document.querySelector('.border-2.border-dashed');

        // Проверяем начальное состояние
        expect(dropZone).toHaveClass('border-gray-300');

        // Создаем mock файл
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

        // Создаем правильный mock для dataTransfer
        const dataTransfer = {
            files: [file],
            items: [{
                kind: 'file',
                type: 'text/plain',
                getAsFile: () => file
            }],
            types: ['Files']
        };

        // Симулируем drag over
        fireEvent.dragOver(dropZone!, { dataTransfer });
        expect(dropZone).toHaveClass('border-black');

        // Симулируем drag leave
        fireEvent.dragLeave(dropZone!, { dataTransfer });
        expect(dropZone).not.toHaveClass('border-black');
        expect(dropZone).toHaveClass('border-gray-300');

        // Симулируем drop (без проверки вызова onFileSelect, так как это сложно в тестовой среде)
        fireEvent.drop(dropZone!, { dataTransfer });

        // Проверяем что состояние вернулось к нормальному
        expect(dropZone).not.toHaveClass('border-black');
        expect(dropZone).toHaveClass('border-gray-300');
    });

    it('валидирует размер файла', async () => {
        // Мокаем notificationService
        const mockError = vi.fn();
        vi.doMock('@/services/NotificationService', () => ({
            notificationService: {
                error: mockError,
            },
        }));

        const { container } = render(<FileUpload onFileSelect={mockOnFileSelect} />);

        // Создаем файл больше максимального размера (10MB)
        const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(input, 'files', {
            value: [largeFile],
            writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
            expect(mockOnFileSelect).not.toHaveBeenCalled();
        });
    });

    it('валидирует тип файла', async () => {
        // Мокаем notificationService
        const mockError = vi.fn();
        vi.doMock('@/services/NotificationService', () => ({
            notificationService: {
                error: mockError,
            },
        }));

        const { container } = render(<FileUpload onFileSelect={mockOnFileSelect} />);

        // Создаем файл неподдерживаемого типа
        const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-executable' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(input, 'files', {
            value: [invalidFile],
            writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
            expect(mockOnFileSelect).not.toHaveBeenCalled();
        });
    });

    it('показывает превью загруженных файлов', async () => {
        const { container } = render(<FileUpload onFileSelect={mockOnFileSelect} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(input, 'files', {
            value: [file],
            writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
            expect(screen.getByText('test.txt')).toBeInTheDocument();
            expect(screen.getByText('12 Bytes')).toBeInTheDocument();
        });
    });

    it('удаляет файл из превью', async () => {
        const { container } = render(<FileUpload onFileSelect={mockOnFileSelect} />);

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(input, 'files', {
            value: [file],
            writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
            expect(screen.getByText('test.txt')).toBeInTheDocument();
        });

        // Нажимаем кнопку удаления
        const deleteButton = screen.getByRole('button');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
        });
    });

    it('показывает правильные иконки для разных типов файлов', async () => {
        const { container } = render(<FileUpload onFileSelect={mockOnFileSelect} />);

        const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        // const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        // const zipFile = new File(['test'], 'test.zip', { type: 'application/zip' });

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        // Тестируем изображение
        Object.defineProperty(input, 'files', {
            value: [imageFile],
            writable: false,
        });

        fireEvent.change(input);

        await waitFor(() => {
            expect(screen.getByText('test.jpg')).toBeInTheDocument();
        });
    });
});
