/**
 * Модуль настроек макета
 */
export class LayoutSettings {
    constructor() {
        this.name = 'layout';
        this.category = 'layout';
        this.dependencies = ['chatWidth', 'sidebarWidth'];
        this.settings = {
            chatWidth: 400,
            chatInputHeight: 300,
            sidebarWidth: 280,
            sidebarCollapsed: false,
            chatVisible: true
        };
        this.validators = {
            chatWidth: (value) => {
                return typeof value === 'number' &&
                    value >= 250 && value <= 2000;
            },
            chatInputHeight: (value) => {
                return typeof value === 'number' &&
                    value >= 256 && value <= 800;
            },
            sidebarWidth: (value) => {
                return typeof value === 'number' &&
                    value >= 200 && value <= 600;
            },
            sidebarCollapsed: (value) => {
                return typeof value === 'boolean';
            },
            chatVisible: (value) => {
                return typeof value === 'boolean';
            }
        };
    }
    getSetting(key) {
        return this.settings[key];
    }
    setSetting(key, value) {
        if (this.validators[key] && this.validators[key](value)) {
            this.settings[key] = value;
            return true;
        }
        return false;
    }
    getAllSettings() {
        return { ...this.settings };
    }
    resetSettings() {
        this.settings = {
            chatWidth: 400,
            chatInputHeight: 300,
            sidebarWidth: 280,
            sidebarCollapsed: false,
            chatVisible: true
        };
    }
    validateSetting(key, value) {
        const validator = this.validators[key];
        return validator ? validator(value) : false;
    }
    getChatWidthRange() {
        return { min: 250, max: 2000 };
    }
    getChatInputHeightRange() {
        return { min: 200, max: 800 };
    }
    getSidebarWidthRange() {
        return { min: 200, max: 600 };
    }
    getChatWidth() {
        return this.settings.chatWidth;
    }
    getChatInputHeight() {
        return this.settings.chatInputHeight;
    }
    getSidebarWidth() {
        return this.settings.sidebarWidth;
    }
    isSidebarCollapsed() {
        return this.settings.sidebarCollapsed;
    }
    isChatVisible() {
        return this.settings.chatVisible;
    }
    toggleSidebarCollapsed() {
        this.settings.sidebarCollapsed = !this.settings.sidebarCollapsed;
    }
    toggleChatVisible() {
        this.settings.chatVisible = !this.settings.chatVisible;
    }
}
//# sourceMappingURL=LayoutSettings.js.map