/**
 * Утилиты для получения иконок с трендами 2025
 */
import * as LucideIcons from 'lucide-react';
/**
 * Получает иконку для категории настроек
 * @param categoryId - ID категории
 * @returns Lucide иконка
 */
export const getCategoryIcon = (categoryId) => {
    const iconMap = {
        'appearance': LucideIcons.Monitor,
        'interface': LucideIcons.Layout,
        'chat': LucideIcons.MessageCircle,
        'notifications': LucideIcons.Bell,
        'advanced': LucideIcons.Cog,
        'account': LucideIcons.User,
        'security': LucideIcons.Shield,
        'privacy': LucideIcons.EyeOff,
        'accessibility': LucideIcons.Accessibility,
        'performance': LucideIcons.Gauge,
        'storage': LucideIcons.HardDrive,
        'network': LucideIcons.Wifi,
        'backup': LucideIcons.Cloud,
        'sync': LucideIcons.RefreshCw,
        'updates': LucideIcons.Download,
        'licenses': LucideIcons.FileText,
        'support': LucideIcons.HelpCircle,
        'feedback': LucideIcons.MessageSquare,
        'about': LucideIcons.Info,
    };
    return iconMap[categoryId] || LucideIcons.Settings;
};
/**
 * Получает иконку для типа сообщения
 * @param sender - Тип отправителя
 * @returns Lucide иконка
 */
export const getMessageIcon = (sender) => {
    const iconMap = {
        'user': LucideIcons.User,
        'assistant': LucideIcons.Bot,
        'system': LucideIcons.Settings,
        'ai': LucideIcons.Brain,
        'admin': LucideIcons.Shield,
        'moderator': LucideIcons.UserCheck,
        'guest': LucideIcons.UserX,
    };
    return iconMap[sender] || LucideIcons.MessageCircle;
};
/**
 * Получает иконку для типа элемента рабочего пространства
 * @param type - Тип элемента
 * @returns Lucide иконка
 */
export const getItemIconType = (type) => {
    const iconMap = {
        'document': LucideIcons.FileText,
        'image': LucideIcons.Image,
        'folder': LucideIcons.Folder,
        'video': LucideIcons.Video,
        'audio': LucideIcons.Music,
        'archive': LucideIcons.Archive,
        'code': LucideIcons.Code,
        'spreadsheet': LucideIcons.FileSpreadsheet,
        'presentation': LucideIcons.Presentation,
        'pdf': LucideIcons.FileText,
        'database': LucideIcons.Database,
        'config': LucideIcons.Settings,
        'log': LucideIcons.FileText,
        'backup': LucideIcons.Cloud,
        'temp': LucideIcons.Clock,
    };
    return iconMap[type] || LucideIcons.File;
};
/**
 * Получает иконку для действий
 * @param action - Название действия
 * @returns Lucide иконка
 */
export const getActionIcon = (action) => {
    const iconMap = {
        'save': LucideIcons.Save,
        'open': LucideIcons.FolderOpen,
        'new': LucideIcons.Plus,
        'edit': LucideIcons.Edit,
        'delete': LucideIcons.Trash2,
        'copy': LucideIcons.Copy,
        'cut': LucideIcons.Scissors,
        'paste': LucideIcons.Clipboard,
        'undo': LucideIcons.Undo,
        'redo': LucideIcons.Redo,
        'refresh': LucideIcons.RefreshCw,
        'reload': LucideIcons.RotateCcw,
        'close': LucideIcons.X,
        'minimize': LucideIcons.Minimize2,
        'maximize': LucideIcons.Maximize2,
        'search': LucideIcons.Search,
        'filter': LucideIcons.Filter,
        'sort': LucideIcons.ArrowUpDown,
        'export': LucideIcons.Download,
        'import': LucideIcons.Upload,
        'share': LucideIcons.Share2,
        'print': LucideIcons.Printer,
        'email': LucideIcons.Mail,
        'download': LucideIcons.Download,
        'upload': LucideIcons.Upload,
        'sync': LucideIcons.RefreshCw,
        'backup': LucideIcons.Cloud,
        'restore': LucideIcons.RotateCcw,
        'settings': LucideIcons.Settings,
        'preferences': LucideIcons.Sliders,
        'help': LucideIcons.HelpCircle,
        'info': LucideIcons.Info,
        'warning': LucideIcons.AlertTriangle,
        'error': LucideIcons.AlertCircle,
        'success': LucideIcons.CheckCircle,
        'loading': LucideIcons.Loader2,
    };
    return iconMap[action] || LucideIcons.Circle;
};
/**
 * Получает иконку для статуса
 * @param status - Статус
 * @returns Lucide иконка
 */
export const getStatusIcon = (status) => {
    const iconMap = {
        'online': LucideIcons.Circle,
        'offline': LucideIcons.Circle,
        'away': LucideIcons.Clock,
        'busy': LucideIcons.XCircle,
        'invisible': LucideIcons.EyeOff,
        'idle': LucideIcons.Moon,
        'active': LucideIcons.Activity,
        'inactive': LucideIcons.Pause,
        'pending': LucideIcons.Clock,
        'processing': LucideIcons.Loader2,
        'completed': LucideIcons.CheckCircle,
        'failed': LucideIcons.XCircle,
        'warning': LucideIcons.AlertTriangle,
        'error': LucideIcons.AlertCircle,
        'success': LucideIcons.CheckCircle,
        'info': LucideIcons.Info,
    };
    return iconMap[status] || LucideIcons.Circle;
};
//# sourceMappingURL=iconUtils.js.map