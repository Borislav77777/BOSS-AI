/**
 * Пример динамического сервиса для демонстрации системы
 * Этот файл будет загружаться динамически через DynamicServiceLoader
 */

class ExampleServiceModule {
    constructor() {
        this.name = 'Example Dynamic Service';
        this.version = '1.0.0';
        this.initialized = false;
    }

    /**
     * Инициализация сервиса
     */
    async initialize() {
        console.log(`${this.name} v${this.version} инициализируется...`);

        // Имитация асинхронной инициализации
        await new Promise(resolve => setTimeout(resolve, 100));

        this.initialized = true;
        console.log(`${this.name} успешно инициализирован`);
    }

    /**
     * Выполнение инструмента
     */
    async execute(toolId, params = {}) {
        if (!this.initialized) {
            throw new Error('Сервис не инициализирован');
        }

        console.log(`Выполнение инструмента ${toolId} с параметрами:`, params);

        switch (toolId) {
            case 'greet':
                return {
                    success: true,
                    message: `Привет, ${params.name || 'Пользователь'}!`,
                    data: {
                        timestamp: new Date().toISOString(),
                        toolId,
                        params
                    }
                };

            case 'calculate':
                const { a = 0, b = 0, operation = 'add' } = params;
                let result;

                switch (operation) {
                    case 'add':
                        result = a + b;
                        break;
                    case 'subtract':
                        result = a - b;
                        break;
                    case 'multiply':
                        result = a * b;
                        break;
                    case 'divide':
                        result = b !== 0 ? a / b : null;
                        break;
                    default:
                        throw new Error(`Неизвестная операция: ${operation}`);
                }

                return {
                    success: true,
                    message: `${a} ${operation} ${b} = ${result}`,
                    data: {
                        result,
                        operation,
                        operands: { a, b }
                    }
                };

            case 'getTime':
                return {
                    success: true,
                    message: `Текущее время: ${new Date().toLocaleString()}`,
                    data: {
                        timestamp: new Date().toISOString(),
                        localTime: new Date().toLocaleString()
                    }
                };

            default:
                throw new Error(`Неизвестный инструмент: ${toolId}`);
        }
    }

    /**
     * Очистка ресурсов
     */
    async cleanup() {
        console.log(`${this.name} очищает ресурсы...`);
        this.initialized = false;

        // Имитация асинхронной очистки
        await new Promise(resolve => setTimeout(resolve, 50));

        console.log(`${this.name} успешно очищен`);
    }

    /**
     * Получение информации о сервисе
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            initialized: this.initialized
        };
    }
}

// Экспортируем модуль как default
export default new ExampleServiceModule();
