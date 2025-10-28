# Analytics Service - Инструкция по развёртыванию

## 🚀 Быстрый старт (Development)

### 1. Установка зависимостей

```bash
cd /var/www/boss-ai/backend/analytics-service
npm install
```

### 2. Настройка окружения

Создайте `.env` файл на основе `.env.example`:

```bash
cp env.example .env
```

Настройте переменные:

```env
NODE_ENV=development
PORT=4400
DB_PATH=../../data/boss_ai.db
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

### 3. Сборка проекта

```bash
npm run build
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Сервис будет доступен на `http://localhost:4400`

## 📦 Production развёртывание

### 1. Подготовка сервера

Убедитесь что установлены:
- Node.js 18+
- PM2 (`npm install -g pm2`)
- Nginx

### 2. Клонирование и установка

```bash
cd /var/www/boss-ai/backend/analytics-service
npm install --production
npm run build
```

### 3. Настройка PM2

Analytics Service уже добавлен в `ecosystem.config.js` в корне проекта:

```javascript
{
  name: "boss-ai-analytics-service",
  script: "dist/index.js",
  cwd: "/var/www/boss-ai/backend/analytics-service",
  instances: 1,
  exec_mode: "fork",
  env: {
    NODE_ENV: "production",
    PORT: 4400,
    DB_PATH: "/var/www/boss-ai/data/boss_ai.db",
    LOG_LEVEL: "info",
    CORS_ORIGIN: "https://boss-ai.online",
    JWT_SECRET: "boss-ai-super-secret-jwt-key-2024-production-v1",
  }
}
```

### 4. Запуск через PM2

```bash
# Из корня проекта
cd /var/www/boss-ai
pm2 start ecosystem.config.js --only boss-ai-analytics-service

# Или запустить все сервисы
pm2 start ecosystem.config.js
```

### 5. Проверка статуса

```bash
# Статус всех сервисов
pm2 status

# Логи Analytics Service
pm2 logs boss-ai-analytics-service

# Мониторинг
pm2 monit
```

### 6. Автозапуск при перезагрузке сервера

```bash
pm2 startup
pm2 save
```

## 🔧 Интеграция с API Gateway

Analytics Service автоматически интегрирован с API Gateway:

- **Middleware трекинга**: Автоматически собирает метрики со всех API запросов
- **Proxy endpoints**: Все запросы к `/api/analytics` проксируются через API Gateway
- **WebSocket**: Real-time обновления через Socket.IO

Убедитесь что API Gateway запущен с переменной окружения:

```env
ANALYTICS_SERVICE_URL=http://localhost:4400
```

## 🗄️ База данных

Analytics Service использует общую базу данных `boss_ai.db` (SQLite).

### Миграции

Миграции запускаются автоматически при первом старте сервиса.

Создаваемые таблицы:
- `user_events` - события пользователей
- `user_sessions` - сессии
- `performance_metrics` - метрики производительности
- `service_usage` - использование сервисов
- `aggregated_metrics` - агрегированные метрики
- `speech_analytics` - речевая аналитика (152 ФЗ)

### Backup базы данных

```bash
# Создание бэкапа
sqlite3 /var/www/boss-ai/data/boss_ai.db ".backup '/var/www/boss-ai/data/backups/boss_ai_$(date +%Y%m%d_%H%M%S).db'"

# Восстановление из бэкапа
sqlite3 /var/www/boss-ai/data/boss_ai.db ".restore '/var/www/boss-ai/data/backups/boss_ai_20250127_120000.db'"
```

## 🔍 Health Check

Проверка работоспособности сервиса:

```bash
# Прямой доступ
curl http://localhost:4400/api/analytics/health

# Через API Gateway
curl http://localhost:3000/api/analytics/health
```

Ожидаемый ответ:

```json
{
  "status": "ok",
  "service": "analytics-service",
  "timestamp": "2025-01-27T12:00:00.000Z",
  "gateway": "healthy"
}
```

## 📊 Мониторинг

### Логи

Логи записываются в:
- `/var/www/boss-ai/backend/logs/analytics_service_combined.log` - все логи
- `/var/www/boss-ai/backend/logs/analytics_service_err.log` - только ошибки
- `/var/www/boss-ai/backend/logs/analytics_service_out.log` - stdout

### PM2 мониторинг

```bash
# Real-time мониторинг
pm2 monit

# Метрики
pm2 describe boss-ai-analytics-service

# Логи с фильтрацией
pm2 logs boss-ai-analytics-service --lines 100
pm2 logs boss-ai-analytics-service --err
```

## 🔄 Обновление сервиса

### Без простоя (graceful reload)

```bash
cd /var/www/boss-ai/backend/analytics-service
git pull
npm install --production
npm run build
pm2 reload boss-ai-analytics-service
```

### С перезапуском

```bash
pm2 restart boss-ai-analytics-service
```

## 🐛 Troubleshooting

### Сервис не запускается

```bash
# Проверьте логи
pm2 logs boss-ai-analytics-service --err

# Проверьте порт 4400
netstat -tuln | grep 4400

# Попробуйте запустить напрямую
cd /var/www/boss-ai/backend/analytics-service
node dist/index.js
```

### Ошибки базы данных

```bash
# Проверьте права доступа
ls -la /var/www/boss-ai/data/boss_ai.db

# Проверьте целостность базы
sqlite3 /var/www/boss-ai/data/boss_ai.db "PRAGMA integrity_check;"
```

### Analytics не собирается

1. Проверьте что API Gateway запущен с правильной переменной `ANALYTICS_SERVICE_URL`
2. Проверьте что middleware подключен в API Gateway
3. Проверьте логи API Gateway на ошибки трекинга

```bash
pm2 logs boss-ai-api-gateway | grep analytics
```

## 🔐 Безопасность

### JWT Secret

В production обязательно используйте сильный JWT secret:

```env
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
```

### CORS

Настройте CORS только для доверенных доменов:

```env
CORS_ORIGIN=https://boss-ai.online
```

### Rate Limiting

Analytics Service использует rate limiting через API Gateway. Настройте в API Gateway:

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📈 Performance

### Рекомендуемые ресурсы

- **CPU**: 1-2 ядра
- **RAM**: 512MB - 1GB
- **Disk**: 10GB (для логов и базы данных)

### Оптимизация

1. **Регулярная очистка старых данных**:
```sql
-- Удалить события старше 90 дней
DELETE FROM user_events WHERE created_at < strftime('%s', 'now', '-90 days');

-- Удалить метрики старше 30 дней
DELETE FROM performance_metrics WHERE created_at < strftime('%s', 'now', '-30 days');
```

2. **Индексы базы данных** - уже настроены автоматически при миграции

3. **Агрегация метрик** - используйте таблицу `aggregated_metrics` для быстрого доступа

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `pm2 logs boss-ai-analytics-service`
2. Проверьте health check: `curl http://localhost:4400/api/analytics/health`
3. Проверьте базу данных: `sqlite3 /var/www/boss-ai/data/boss_ai.db`

## 🎯 Roadmap

- [ ] Интеграция с Grafana для визуализации
- [ ] Speech Analytics (152 ФЗ)
- [ ] Экспорт в CSV/Excel
- [ ] Email отчеты
- [ ] Алерты при аномалиях
