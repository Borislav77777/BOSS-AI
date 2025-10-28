/**
 * Компонент для загрузки файлов в чат
 */

import { CHAT } from '@/constants';
import { notificationService } from '@/services/NotificationService';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, File, FileText, Image, Upload, X } from 'lucide-react';
import React, { memo, useCallback, useRef, useState } from 'react';

interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
    className?: string;
}

interface FilePreview {
    file: File;
    id: string;
    preview?: string;
}

export const FileUpload: React.FC<FileUploadProps> = memo(({ onFileSelect, className }: FileUploadProps) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [previews, setPreviews] = useState<FilePreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFileIcon = useCallback((file: File) => {
        if (file.type.startsWith('image/')) {
            return <Image className="w-5 h-5 text-text" />;
        } else if (file.type.startsWith('text/')) {
            return <FileText className="w-5 h-5 text-green-500" />;
        } else if (file.type.includes('zip') || file.type.includes('rar')) {
            return <Archive className="w-5 h-5 text-orange-500" />;
        }
        return <File className="w-5 h-5 text-slate-500" />;
    }, []);

    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const validateFile = useCallback((file: File): boolean => {
        // Проверяем размер файла
        if (file.size > CHAT.FILE_UPLOAD.MAX_SIZE) {
            notificationService.error(
                'Файл слишком большой',
                `Максимальный размер файла: ${formatFileSize(CHAT.FILE_UPLOAD.MAX_SIZE)}`
            );
            return false;
        }

        // Проверяем тип файла
        if (!(CHAT.FILE_UPLOAD.ALLOWED_TYPES as readonly string[]).includes(file.type)) {
            notificationService.error(
                'Неподдерживаемый тип файла',
                `Поддерживаемые типы: ${CHAT.FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`
            );
            return false;
        }

        return true;
    }, [formatFileSize]);

    const createPreview = useCallback(async (file: File): Promise<FilePreview> => {
        const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
            preview = URL.createObjectURL(file);
        }

        return {
            file,
            id,
            preview,
        };
    }, []);

    const handleFiles = useCallback(async (files: FileList) => {
        const validFiles: File[] = [];

        // Валидируем файлы
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (validateFile(file)) {
                validFiles.push(file);
            }
        }

        // Проверяем лимит файлов
        if (previews.length + validFiles.length > CHAT.FILE_UPLOAD.MAX_FILES_PER_MESSAGE) {
            notificationService.warning(
                'Слишком много файлов',
                `Максимальное количество файлов: ${CHAT.FILE_UPLOAD.MAX_FILES_PER_MESSAGE}`
            );
            return;
        }

        // Создаем превью для файлов
        const newPreviews = await Promise.all(
            validFiles.map(file => createPreview(file))
        );

        setPreviews(prev => [...prev, ...newPreviews]);
        onFileSelect(validFiles);
    }, [previews.length, onFileSelect, validateFile, createPreview]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            handleFiles(files);
        }
    }, [handleFiles]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files) {
            handleFiles(files);
        }
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const removePreview = useCallback((id: string) => {
        setPreviews(prev => {
            const updated = prev.filter(p => p.id !== id);
            const files = updated.map(p => p.file);
            onFileSelect(files);
            return updated;
        });
    }, [onFileSelect]);

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div className={cn("file-upload-container bg-gradient-to-br from-slate-50 to-gray-50/30 rounded-2xl p-1", className)}>
            {/* Скрытый input для выбора файлов */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={CHAT.FILE_UPLOAD.ALLOWED_TYPES.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
                aria-label="Выберите файлы для загрузки"
                title="Выберите файлы для загрузки"
            />

            {/* Область для drag & drop */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer",
                    "hover:scale-[1.01] active:scale-[0.99] backdrop-blur-sm",
                    isDragOver
                        ? "border-primary bg-primary/80 shadow-xl shadow-primary/50 ring-2 ring-primary"
                        : "border-border hover:border-primary hover:bg-primary/30 hover:shadow-lg hover:shadow-primary/30"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
            >
                <div className="text-center">
                    <div className={cn(
                        "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300",
                        isDragOver
                            ? "bg-primary shadow-lg shadow-primary/50"
                            : "bg-surface hover:bg-primary"
                    )}>
                        <Upload className={cn(
                            "w-8 h-8 transition-all duration-300",
                            isDragOver ? "text-background scale-110" : "text-text-secondary"
                        )} />
                    </div>
                    <p className="text-base font-semibold text-text mb-2">
                        Перетащите файлы сюда или нажмите для выбора
                    </p>
                    <p className="text-sm text-text-secondary bg-surface/50 rounded-lg px-3 py-1 inline-block">
                        Максимум {CHAT.FILE_UPLOAD.MAX_FILES_PER_MESSAGE} файлов, до {formatFileSize(CHAT.FILE_UPLOAD.MAX_SIZE)} каждый
                    </p>
                </div>
            </div>

            {/* Превью загруженных файлов */}
            <AnimatePresence>
                {previews.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-3"
                    >
                        {previews.map((preview) => (
                            <motion.div
                                key={preview.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center space-x-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                {preview.preview ? (
                                    <img
                                        src={preview.preview}
                                        alt={preview.file.name}
                                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                                    />
                                ) : (
                                    <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200">
                                        {getFileIcon(preview.file)}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">
                                        {preview.file.name}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {formatFileSize(preview.file.size)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => removePreview(preview.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                                    aria-label="Удалить файл"
                                    title="Удалить файл"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;
