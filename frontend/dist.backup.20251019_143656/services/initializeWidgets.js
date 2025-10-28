/**
 * Инициализация виджетов
 * Регистрирует все доступные типы виджетов в системе
 */
import { TimeWidget } from '@/components/Widgets/TimeWidget';
import { VoiceWidget } from '@/components/Widgets/VoiceWidget';
import VideoWidget from '@/components/Widgets/VideoWidget';
import { widgetsService } from './WidgetsService';
/**
 * Инициализация всех виджетов
 */
export function initializeWidgets() {
    // Регистрируем виджет времени
    widgetsService.registerWidgetType({
        id: 'time-widget',
        name: 'Часы',
        description: 'Отображает текущее время и дату',
        icon: 'Clock',
        category: 'utility',
        defaultSize: { width: 200, height: 120 },
        minSize: { width: 150, height: 80 },
        maxSize: { width: 300, height: 200 },
        component: TimeWidget,
        settings: [
            {
                id: 'show-seconds',
                name: 'Показывать секунды',
                type: 'boolean',
                defaultValue: true,
                description: 'Отображать секунды в часах'
            },
            {
                id: 'show-date',
                name: 'Показывать дату',
                type: 'boolean',
                defaultValue: true,
                description: 'Отображать дату под временем'
            },
            {
                id: 'format24h',
                name: '24-часовой формат',
                type: 'boolean',
                defaultValue: true,
                description: 'Использовать 24-часовой формат времени'
            }
        ]
    });
    // Регистрируем виджет голосового ввода
    widgetsService.registerWidgetType({
        id: 'voice-widget',
        name: 'Голосовой ввод',
        description: 'Быстрый доступ к голосовому вводу',
        icon: 'Mic',
        category: 'input',
        defaultSize: { width: 180, height: 100 },
        minSize: { width: 120, height: 60 },
        maxSize: { width: 250, height: 150 },
        component: VoiceWidget,
        settings: [
            {
                id: 'auto-start',
                name: 'Автозапуск',
                type: 'boolean',
                defaultValue: false,
                description: 'Автоматически начинать запись при открытии'
            },
            {
                id: 'show-transcription',
                name: 'Показывать транскрипцию',
                type: 'boolean',
                defaultValue: true,
                description: 'Отображать транскрибированный текст'
            }
        ]
    });
    // Регистрируем видео-виджет с логотипом
    widgetsService.registerWidgetType({
        id: 'video-intro-widget',
        name: 'Вводное видео',
        description: 'Показывает вводное видео один раз, затем заменяется на логотип',
        icon: 'Play',
        category: 'media',
        defaultSize: { width: 400, height: 300 },
        minSize: { width: 300, height: 200 },
        maxSize: { width: 600, height: 400 },
        component: VideoWidget,
        settings: [
            {
                id: 'autoPlay',
                name: 'Автовоспроизведение',
                type: 'boolean',
                defaultValue: true,
                description: 'Автоматически воспроизводить видео'
            },
            {
                id: 'showControls',
                name: 'Показывать элементы управления',
                type: 'boolean',
                defaultValue: false,
                description: 'Показывать элементы управления видео'
            }
        ]
    });
    console.log('Widgets initialized successfully');
}
//# sourceMappingURL=initializeWidgets.js.map