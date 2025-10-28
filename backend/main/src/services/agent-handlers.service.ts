/**
 * Сервис для обработки сообщений различных агентов
 * @module services/agent-handlers
 */

import { logger } from '../utils/logger';
import { ozonManagerService } from './ozon-manager.service';

/**
 * Интерфейс для данных сообщения
 */
export interface MessageData {
    sessionId: number;
    userId: number;
    agentId: string;
    message: string;
    metadata?: Record<string, any>;
}

/**
 * Интерфейс для ответа агента
 */
export interface AgentResponse {
    text: string;
    data?: any;
    buttons?: Array<{
        id: string;
        text: string;
        action: string;
    }>;
    processingTime?: number;
}

/**
 * Сервис для обработки сообщений агентов
 */
export class AgentHandlersService {
    /**
     * Основной обработчик - маршрутизирует сообщение к нужному агенту
     */
    async processMessage(messageData: MessageData): Promise<AgentResponse> {
        const startTime = Date.now();

        try {
            logger.debug(`Обработка сообщения для агента ${messageData.agentId}`, {
                sessionId: messageData.sessionId,
                userId: messageData.userId
            });

            let response: AgentResponse;

            switch (messageData.agentId) {
                case 'ozon-manager':
                    response = await this.handleOzonManager(messageData);
                    break;

                case 'ai-lawyer':
                    response = await this.handleAILawyer(messageData);
                    break;

                case 'photo-studio':
                    response = await this.handlePhotoStudio(messageData);
                    break;

                default:
                    response = {
                        text: `Агент ${messageData.agentId} пока не поддерживается. Скоро будет добавлен!`
                    };
            }

            const processingTime = Date.now() - startTime;
            response.processingTime = processingTime;

            logger.debug(`Сообщение обработано за ${processingTime}мс`, {
                agentId: messageData.agentId,
                sessionId: messageData.sessionId
            });

            return response;
        } catch (error) {
            logger.error('Ошибка обработки сообщения агентом', error);
            throw error;
        }
    }

    /**
     * Обработчик для OZON Manager
     */
    private async handleOzonManager(messageData: MessageData): Promise<AgentResponse> {
        try {
            const { message, metadata } = messageData;

            // Проверяем action из metadata (клик по кнопке)
            if (metadata?.action) {
                return await this.handleOzonAction(metadata.action, messageData);
            }

            // Обработка текстовых сообщений
            const lowerMessage = message.toLowerCase();

            if (lowerMessage.includes('акци') || lowerMessage.includes('промо')) {
                return {
                    text: 'Начинаю удаление товаров из акций. Получаю список ваших магазинов...',
                    buttons: [
                        { id: 'confirm-promotions', text: 'Подтвердить', action: 'remove_promotions' },
                        { id: 'cancel', text: 'Отмена', action: 'cancel' }
                    ]
                };
            }

            if (lowerMessage.includes('архив') || lowerMessage.includes('разархив')) {
                return {
                    text: 'Начинаю разархивацию товаров. Получаю список ваших магазинов...',
                    buttons: [
                        { id: 'confirm-archive', text: 'Подтвердить', action: 'remove_archive' },
                        { id: 'cancel', text: 'Отмена', action: 'cancel' }
                    ]
                };
            }

            // Приветственное сообщение
            return {
                text: 'Привет! Я Ozon Менеджер. Желаете ли вы автоматически удалить товары из автоархивов или удалить товары из автоакций в Ozon кабинете?',
                buttons: [
                    { id: 'remove-archive', text: 'Да, удалить товары из автоархива', action: 'remove_archive' },
                    { id: 'remove-promotions', text: 'Да, удалить товары из автоакций', action: 'remove_promotions' },
                    { id: 'both', text: 'И то и другое', action: 'both' }
                ]
            };
        } catch (error) {
            logger.error('Ошибка в handleOzonManager', error);
            return {
                text: 'Произошла ошибка при обработке запроса. Попробуйте ещё раз.'
            };
        }
    }

    /**
     * Обработчик действий OZON (кнопки)
     */
    private async handleOzonAction(action: string, messageData: MessageData): Promise<AgentResponse> {
        try {
            // Получаем список магазинов пользователя
            const storesResult = await ozonManagerService.getStores();

            if (!storesResult.success || !storesResult.data) {
                return {
                    text: 'Не удалось получить список ваших магазинов. Пожалуйста, добавьте магазины в настройках.'
                };
            }

            const stores = Array.isArray(storesResult.data) ? storesResult.data : [];

            if (stores.length === 0) {
                return {
                    text: 'У вас пока нет добавленных магазинов. Добавьте магазин в настройках, чтобы начать работу.'
                };
            }

            const storeNames = stores.map((store: any) => store.name);

            switch (action) {
                case 'remove_archive': {
                    const result = await ozonManagerService.unarchiveProducts(storeNames);

                    if (result.success) {
                        const summary = this.formatOzonResults(result.data, 'разархивация');
                        return {
                            text: `✅ Разархивация завершена!\n\n${summary}`,
                            data: result.data
                        };
                    } else {
                        return {
                            text: `❌ Ошибка при разархивации: ${result.error?.message || 'Неизвестная ошибка'}`
                        };
                    }
                }

                case 'remove_promotions': {
                    const result = await ozonManagerService.removeFromPromotions(storeNames);

                    if (result.success) {
                        const summary = this.formatOzonResults(result.data, 'удаление из акций');
                        return {
                            text: `✅ Удаление из акций завершено!\n\n${summary}`,
                            data: result.data
                        };
                    } else {
                        return {
                            text: `❌ Ошибка при удалении из акций: ${result.error?.message || 'Неизвестная ошибка'}`
                        };
                    }
                }

                case 'both': {
                    // Выполняем обе операции последовательно
                    const archiveResult = await ozonManagerService.unarchiveProducts(storeNames);
                    const promotionsResult = await ozonManagerService.removeFromPromotions(storeNames);

                    const archiveSummary = archiveResult.success
                        ? this.formatOzonResults(archiveResult.data, 'разархивация')
                        : `❌ Ошибка разархивации: ${archiveResult.error?.message}`;

                    const promotionsSummary = promotionsResult.success
                        ? this.formatOzonResults(promotionsResult.data, 'удаление из акций')
                        : `❌ Ошибка удаления из акций: ${promotionsResult.error?.message}`;

                    return {
                        text: `Выполнено!\n\n**Разархивация:**\n${archiveSummary}\n\n**Удаление из акций:**\n${promotionsSummary}`,
                        data: {
                            archive: archiveResult.data,
                            promotions: promotionsResult.data
                        }
                    };
                }

                case 'cancel':
                    return {
                        text: 'Операция отменена. Чем ещё могу помочь?'
                    };

                default:
                    return {
                        text: `Неизвестное действие: ${action}`
                    };
            }
        } catch (error) {
            logger.error('Ошибка в handleOzonAction', error);
            return {
                text: 'Произошла ошибка при выполнении операции. Попробуйте ещё раз.'
            };
        }
    }

    /**
     * Форматирование результатов OZON операций
     */
    private formatOzonResults(data: any, operationType: string): string {
        if (!data || !Array.isArray(data)) {
            return 'Нет данных';
        }

        let summary = '';
        let totalSuccess = 0;
        let totalFailed = 0;

        for (const result of data) {
            if (result.success) {
                totalSuccess++;
                const count = result.products_removed || result.products_unarchived || 0;
                summary += `✅ ${result.store}: ${count} товаров\n`;
            } else {
                totalFailed++;
                summary += `❌ ${result.store}: ${result.error}\n`;
            }
        }

        return `${operationType}\n${summary}\n**Успешно:** ${totalSuccess} | **Ошибок:** ${totalFailed}`;
    }

    /**
     * Обработчик для AI Lawyer (заглушка)
     */
    private async handleAILawyer(messageData: MessageData): Promise<AgentResponse> {
        return {
            text: `Понял ваш запрос: "${messageData.message}"\n\nAI Lawyer скоро будет подключен. Сейчас идёт интеграция с ChatGPT/Claude API.`,
            buttons: [
                { id: 'contract-review', text: 'Проверить договор', action: 'contract_review' },
                { id: 'legal-advice', text: 'Получить консультацию', action: 'legal_advice' }
            ]
        };
    }

    /**
     * Обработчик для Photo Studio (заглушка)
     */
    private async handlePhotoStudio(messageData: MessageData): Promise<AgentResponse> {
        return {
            text: `Понял ваш запрос: "${messageData.message}"\n\nPhoto Studio скоро будет подключен. Сейчас идёт поиск подходящего API для обработки изображений.`,
            buttons: [
                { id: 'enhance-photo', text: 'Улучшить фото', action: 'enhance_photo' },
                { id: 'remove-background', text: 'Удалить фон', action: 'remove_background' }
            ]
        };
    }
}

// Экспортируем singleton
export const agentHandlersService = new AgentHandlersService();
