import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Компонент для загрузки файлов в чат
 */
import { CHAT } from '@/constants';
import { notificationService } from '@/services/NotificationService';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, File, FileText, Image, Upload, X } from 'lucide-react';
import React, { memo, useCallback, useRef, useState } from 'react';
export const FileUpload = memo(({ onFileSelect, className }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);
    const getFileIcon = useCallback((file) => {
        if (file.type.startsWith('image/')) {
            return _jsx(Image, { className: "w-5 h-5 text-text" });
        }
        else if (file.type.startsWith('text/')) {
            return _jsx(FileText, { className: "w-5 h-5 text-green-500" });
        }
        else if (file.type.includes('zip') || file.type.includes('rar')) {
            return _jsx(Archive, { className: "w-5 h-5 text-orange-500" });
        }
        return _jsx(File, { className: "w-5 h-5 text-slate-500" });
    }, []);
    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);
    const validateFile = useCallback((file) => {
        // Проверяем размер файла
        if (file.size > CHAT.FILE_UPLOAD.MAX_SIZE) {
            notificationService.error('Файл слишком большой', `Максимальный размер файла: ${formatFileSize(CHAT.FILE_UPLOAD.MAX_SIZE)}`);
            return false;
        }
        // Проверяем тип файла
        if (!CHAT.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
            notificationService.error('Неподдерживаемый тип файла', `Поддерживаемые типы: ${CHAT.FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`);
            return false;
        }
        return true;
    }, [formatFileSize]);
    const createPreview = useCallback(async (file) => {
        const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let preview;
        if (file.type.startsWith('image/')) {
            preview = URL.createObjectURL(file);
        }
        return {
            file,
            id,
            preview,
        };
    }, []);
    const handleFiles = useCallback(async (files) => {
        const validFiles = [];
        // Валидируем файлы
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (validateFile(file)) {
                validFiles.push(file);
            }
        }
        // Проверяем лимит файлов
        if (previews.length + validFiles.length > CHAT.FILE_UPLOAD.MAX_FILES_PER_MESSAGE) {
            notificationService.warning('Слишком много файлов', `Максимальное количество файлов: ${CHAT.FILE_UPLOAD.MAX_FILES_PER_MESSAGE}`);
            return;
        }
        // Создаем превью для файлов
        const newPreviews = await Promise.all(validFiles.map(file => createPreview(file)));
        setPreviews(prev => [...prev, ...newPreviews]);
        onFileSelect(validFiles);
    }, [previews.length, onFileSelect, validateFile, createPreview]);
    const handleFileInputChange = useCallback((e) => {
        const files = e.target.files;
        if (files) {
            handleFiles(files);
        }
    }, [handleFiles]);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files) {
            handleFiles(files);
        }
    }, [handleFiles]);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);
    const removePreview = useCallback((id) => {
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
    return (_jsxs("div", { className: cn("file-upload-container bg-gradient-to-br from-slate-50 to-gray-50/30 rounded-2xl p-1", className), children: [_jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: CHAT.FILE_UPLOAD.ALLOWED_TYPES.join(','), onChange: handleFileInputChange, className: "hidden", "aria-label": "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u044B \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438", title: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u044B \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438" }), _jsx("div", { className: cn("border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer", "hover:scale-[1.01] active:scale-[0.99] backdrop-blur-sm", isDragOver
                    ? "border-primary bg-primary/80 shadow-xl shadow-primary/50 ring-2 ring-primary"
                    : "border-border hover:border-primary hover:bg-primary/30 hover:shadow-lg hover:shadow-primary/30"), onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onClick: openFileDialog, children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: cn("w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300", isDragOver
                                ? "bg-primary shadow-lg shadow-primary/50"
                                : "bg-surface hover:bg-primary"), children: _jsx(Upload, { className: cn("w-8 h-8 transition-all duration-300", isDragOver ? "text-background scale-110" : "text-text-secondary") }) }), _jsx("p", { className: "text-base font-semibold text-text mb-2", children: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B\u044B \u0441\u044E\u0434\u0430 \u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u0432\u044B\u0431\u043E\u0440\u0430" }), _jsxs("p", { className: "text-sm text-text-secondary bg-surface/50 rounded-lg px-3 py-1 inline-block", children: ["\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C ", CHAT.FILE_UPLOAD.MAX_FILES_PER_MESSAGE, " \u0444\u0430\u0439\u043B\u043E\u0432, \u0434\u043E ", formatFileSize(CHAT.FILE_UPLOAD.MAX_SIZE), " \u043A\u0430\u0436\u0434\u044B\u0439"] })] }) }), _jsx(AnimatePresence, { children: previews.length > 0 && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "mt-6 space-y-3", children: previews.map((preview) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, className: "flex items-center space-x-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200", children: [preview.preview ? (_jsx("img", { src: preview.preview, alt: preview.file.name, className: "w-10 h-10 object-cover rounded-lg border border-slate-200" })) : (_jsx("div", { className: "w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200", children: getFileIcon(preview.file) })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-slate-800 truncate", children: preview.file.name }), _jsx("p", { className: "text-xs text-slate-500 font-medium", children: formatFileSize(preview.file.size) })] }), _jsx("button", { onClick: () => removePreview(preview.id), className: "p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95", "aria-label": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0444\u0430\u0439\u043B", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0444\u0430\u0439\u043B", children: _jsx(X, { className: "w-4 h-4" }) })] }, preview.id))) })) })] }));
});
FileUpload.displayName = 'FileUpload';
export default FileUpload;
//# sourceMappingURL=FileUpload.js.map