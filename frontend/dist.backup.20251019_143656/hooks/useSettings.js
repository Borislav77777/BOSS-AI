import { usePlatform } from '@/hooks/usePlatform';
import { settingsService } from '@/services/settings';
import { useCallback, useEffect, useRef, useState } from 'react';
/**
 * УЛУЧШЕННЫЙ хук для работы с настройками
 * Полная интеграция с SettingsService + улучшенный UX
 */
export const useSettings = () => {
    const { updateSettings } = usePlatform();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const timeoutRef = useRef(null);
    // Получаем настройки из сервиса для единого источника истины
    const settings = settingsService.getAllSettings();
    const handleSettingChange = useCallback(async (key, value) => {
        try {
            setIsLoading(true);
            // Обновляем через сервис для правильной логики применения
            await settingsService.setSetting(key, value);
            // Синхронизируем с платформой
            updateSettings(key, value);
            setHasUnsavedChanges(true);
        }
        catch (error) {
            console.error('Ошибка изменения настройки:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [updateSettings]);
    const handleSave = useCallback(() => {
        setHasUnsavedChanges(false);
        setShowSaveSuccess(true);
        // Очищаем предыдущий таймер если он есть
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setShowSaveSuccess(false), 2000);
    }, []);
    const handleReset = useCallback(async () => {
        if (confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
            try {
                setIsLoading(true);
                settingsService.resetSettings();
                setHasUnsavedChanges(false);
                // Принудительно обновляем интерфейс
                window.location.reload();
            }
            catch (error) {
                console.error('Ошибка сброса настроек:', error);
            }
            finally {
                setIsLoading(false);
            }
        }
    }, []);
    const handleExport = useCallback(() => {
        try {
            const settingsJson = settingsService.exportSettings();
            const blob = new Blob([settingsJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `barsukov-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Ошибка экспорта настроек:', error);
        }
    }, []);
    const handleImport = useCallback((event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result;
                    if (settingsService.importSettings(content)) {
                        setHasUnsavedChanges(false);
                        // Плавное обновление без перезагрузки
                        setTimeout(() => window.location.reload(), 100);
                    }
                    else {
                        alert('Ошибка импорта настроек. Проверьте формат файла.');
                    }
                }
                catch (error) {
                    console.error('Ошибка импорта:', error);
                    alert('Ошибка импорта настроек');
                }
            };
            reader.readAsText(file);
        }
    }, []);
    // Функция поиска по настройкам
    const searchSettings = useCallback((query) => {
        setSearchQuery(query);
    }, []);
    // Функция предварительного просмотра изменений
    const previewChanges = useCallback((key, value) => {
        // Временно применяем изменения для предварительного просмотра
        const originalValue = settings[key];
        settingsService.setSetting(key, value);
        // Возвращаем обратно через 3 секунды
        setTimeout(() => {
            settingsService.setSetting(key, originalValue);
        }, 3000);
    }, [settings]);
    // Cleanup при размонтировании компонента
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    return {
        settings,
        hasUnsavedChanges,
        showSaveSuccess,
        isLoading,
        searchQuery,
        handleSettingChange,
        updateSetting: handleSettingChange, // Alias for backward compatibility
        handleSave,
        handleReset,
        handleExport,
        handleImport,
        searchSettings,
        previewChanges,
    };
};
//# sourceMappingURL=useSettings.js.map