import { Request, Response, Router } from "express";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.middleware";
import { agentHandlersService } from "../services/agent-handlers.service";
import { agentSessionsService, CreateSessionData, SendMessageData } from "../services/agent-sessions.service";
import { agentsService } from "../services/agents.service";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /api/agents
 * Получить список активных агентов
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const result = await agentsService.getActiveAgents();

        if (result.success) {
            res.json(result);
        } else {
            res.status(result.error?.statusCode || 500).json(result);
        }
    } catch (error) {
        logger.error("Agents routes: Ошибка получения агентов", error);
        res.status(500).json({
            success: false,
            error: {
                message: "Внутренняя ошибка сервера",
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }
});

/**
 * GET /api/agents/:id
 * Получить агента по ID
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await agentsService.getAgentById(id);

        if (result.success) {
            res.json(result);
        } else {
            res.status(result.error?.statusCode || 500).json(result);
        }
    } catch (error) {
        logger.error(`Agents routes: Ошибка получения агента ${req.params.id}`, error);
        res.status(500).json({
            success: false,
            error: {
                message: "Внутренняя ошибка сервера",
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }
});

/**
 * POST /api/agents/:id/session
 * Создать сессию с агентом
 */
router.post("/:id/session", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: agentId } = req.params;
        const userId = parseInt(req.user?.id || '0');

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    message: "Пользователь не авторизован",
                    statusCode: 401,
                    timestamp: new Date().toISOString()
                }
            });
        }

        // Проверяем существование агента
        const agentResult = await agentsService.getAgentById(agentId);
        if (!agentResult.success) {
            return res.status(agentResult.error?.statusCode || 404).json(agentResult);
        }

        // Создаем сессию
        const sessionData: CreateSessionData = {
            userId,
            agentId,
            sessionData: {
                startTime: new Date().toISOString(),
                userAgent: req.get('User-Agent'),
                ip: req.ip
            }
        };

        const result = await agentSessionsService.createSession(sessionData);

        if (result.success) {
            res.json(result);
        } else {
            res.status(result.error?.statusCode || 500).json(result);
        }
    } catch (error) {
        logger.error(`Agents routes: Ошибка создания сессии с агентом ${req.params.id}`, error);
        res.status(500).json({
            success: false,
            error: {
                message: "Внутренняя ошибка сервера",
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }
});

/**
 * GET /api/agents/:id/session
 * Получить активную сессию с агентом
 */
router.get("/:id/session", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: agentId } = req.params;
        const userId = parseInt(req.user?.id || '0');

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    message: "Пользователь не авторизован",
                    statusCode: 401,
                    timestamp: new Date().toISOString()
                }
            });
        }

        const result = await agentSessionsService.getActiveSession(userId, agentId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(result.error?.statusCode || 500).json(result);
        }
    } catch (error) {
        logger.error(`Agents routes: Ошибка получения сессии с агентом ${req.params.id}`, error);
        res.status(500).json({
            success: false,
            error: {
                message: "Внутренняя ошибка сервера",
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }
});

/**
 * POST /api/agents/:id/message
 * Отправить сообщение агенту
 */
router.post("/:id/message", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id: agentId } = req.params;
        const userId = parseInt(req.user?.id || '0');
        const { message, sessionId, action } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    message: "Пользователь не авторизован",
                    statusCode: 401,
                    timestamp: new Date().toISOString()
                }
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Сообщение не может быть пустым",
                    statusCode: 400,
                    timestamp: new Date().toISOString()
                }
            });
        }

        // Если sessionId не передан, создаем новую сессию
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const sessionResult = await agentSessionsService.createSession({
                userId,
                agentId,
                sessionData: {
                    startTime: new Date().toISOString(),
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                }
            });

            if (!sessionResult.success) {
                return res.status(sessionResult.error?.statusCode || 500).json(sessionResult);
            }

            currentSessionId = sessionResult.data!.id;
        }

        // Отправляем сообщение пользователя
        const userMessageData: SendMessageData = {
            sessionId: currentSessionId,
            userId,
            agentId,
            messageText: message,
            senderType: 'user',
            messageData: {
                timestamp: new Date().toISOString(),
                userAgent: req.get('User-Agent'),
                ip: req.ip
            }
        };

        const userMessageResult = await agentSessionsService.sendMessage(userMessageData);
        if (!userMessageResult.success) {
            return res.status(userMessageResult.error?.statusCode || 500).json(userMessageResult);
        }

        // Обрабатываем сообщение через агента
        const agentResponse = await agentHandlersService.processMessage({
            sessionId: currentSessionId,
            userId,
            agentId,
            message,
            metadata: action ? { action } : undefined
        });

        // Отправляем ответ агента
        const agentMessageData: SendMessageData = {
            sessionId: currentSessionId,
            userId,
            agentId,
            messageText: agentResponse.text,
            senderType: 'agent',
            messageData: {
                timestamp: new Date().toISOString(),
                processingTime: agentResponse.processingTime || 0,
                buttons: agentResponse.buttons,
                data: agentResponse.data
            }
        };

        const agentMessageResult = await agentSessionsService.sendMessage(agentMessageData);
        if (!agentMessageResult.success) {
            return res.status(agentMessageResult.error?.statusCode || 500).json(agentMessageResult);
        }

        res.json({
            success: true,
            data: {
                sessionId: currentSessionId,
                userMessage: userMessageResult.data,
                agentMessage: agentMessageResult.data
            }
        });
    } catch (error) {
        logger.error(`Agents routes: Ошибка отправки сообщения агенту ${req.params.id}`, error);
        res.status(500).json({
            success: false,
            error: {
                message: "Внутренняя ошибка сервера",
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }
});

/**
 * GET /api/agents/:id/messages/:sessionId
 * Получить историю сообщений сессии
 */
router.get("/:id/messages/:sessionId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { sessionId } = req.params;
        const userId = parseInt(req.user?.id || '0');
        const limit = parseInt(req.query.limit as string) || 50;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    message: "Пользователь не авторизован",
                    statusCode: 401,
                    timestamp: new Date().toISOString()
                }
            });
        }

        const result = await agentSessionsService.getSessionMessages(Number(sessionId), limit);

        if (result.success) {
            res.json(result);
        } else {
            res.status(result.error?.statusCode || 500).json(result);
        }
    } catch (error) {
        logger.error(`Agents routes: Ошибка получения сообщений сессии ${req.params.sessionId}`, error);
        res.status(500).json({
            success: false,
            error: {
                message: "Внутренняя ошибка сервера",
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }
});

/**
 * GET /api/agents/sessions/my
 * Получить все сессии пользователя
 */
router.get("/sessions/my", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = parseInt(req.user?.id || '0');
        const limit = parseInt(req.query.limit as string) || 20;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    message: "Пользователь не авторизован",
                    statusCode: 401,
                    timestamp: new Date().toISOString()
                }
            });
        }

        const result = await agentSessionsService.getUserSessions(userId, limit);

        if (result.success) {
            res.json(result);
        } else {
            res.status(result.error?.statusCode || 500).json(result);
        }
    } catch (error) {
        logger.error("Agents routes: Ошибка получения сессий пользователя", error);
        res.status(500).json({
            success: false,
            error: {
                message: "Внутренняя ошибка сервера",
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }
});

/**
 * GET /api/agents/stats/usage
 * Получить статистику использования агентов (admin only)
 */
router.get("/stats/usage", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = parseInt(req.user?.id || '0');
        const agentId = req.query.agentId as string;
        const days = parseInt(req.query.days as string) || 30;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    message: "Пользователь не авторизован",
                    statusCode: 401,
                    timestamp: new Date().toISOString()
                }
            });
        }

        // TODO: Добавить проверку admin прав
        // if (!req.user?.isAdmin) {
        //     return res.status(403).json({
        //         success: false,
        //         error: {
        //             message: "Недостаточно прав",
        //             statusCode: 403,
        //             timestamp: new Date().toISOString()
        //         }
        //     });
        // }

        const result = await agentSessionsService.getAgentUsageStats(agentId, days);

        if (result.success) {
            res.json(result);
        } else {
            res.status(result.error?.statusCode || 500).json(result);
        }
    } catch (error) {
        logger.error("Agents routes: Ошибка получения статистики", error);
        res.status(500).json({
            success: false,
            error: {
                message: "Внутренняя ошибка сервера",
                statusCode: 500,
                timestamp: new Date().toISOString()
            }
        });
    }
});

export default router;
