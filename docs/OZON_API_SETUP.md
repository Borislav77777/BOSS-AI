# 🔧 Настройка Ozon Seller API

## 📋 Получение API токенов

### 1. Регистрация в Ozon Seller

1. Перейдите на [Ozon Seller](https://seller.ozon.ru/)
2. Зарегистрируйтесь или войдите в аккаунт
3. Перейдите в раздел **"Настройки"** → **"API"**

### 2. Создание API ключей

1. В разделе API нажмите **"Создать ключ"**
2. Выберите права доступа:
   - ✅ **Товары** (Products) - для работы с товарами
   - ✅ **Заказы** (Orders) - для работы с заказами
   - ✅ **Аналитика** (Analytics) - для получения статистики
   - ✅ **Склад** (Warehouse) - для управления остатками

3. Скопируйте полученные данные:
   - **Client ID** (например: `123456`)
   - **API Key** (например: `abc123def456...`)

### 3. Настройка в проекте

#### 3.1 Добавление в .env файл

```bash
# /var/www/boss-ai/.env
OZON_CLIENT_ID=ваш_client_id
OZON_API_KEY=ваш_api_key
OZON_MOCK_MODE=false  # true для тестирования без API
```

#### 3.2 Обновление ecosystem.config.js

```javascript
// ozon-manager env
OZON_CLIENT_ID: "ваш_client_id",
OZON_API_KEY: "ваш_api_key",
OZON_MOCK_MODE: "false"
```

---

## 🧪 Тестирование API

### 1. Mock режим (для разработки)

```bash
# Включить mock режим
OZON_MOCK_MODE=true

# Перезапустить сервис
pm2 restart boss-ai-ozon-manager
```

**Mock режим возвращает тестовые данные:**
- Магазины: "Тестовый магазин"
- Товары: "Тестовый товар" (1000₽, 10 шт)
- Заказы: "mock-order-1" (1500₽, доставлен)

### 2. Реальное API тестирование

```bash
# Отключить mock режим
OZON_MOCK_MODE=false

# Перезапустить сервис
pm2 restart boss-ai-ozon-manager

# Проверить логи
pm2 logs boss-ai-ozon-manager --lines 20
```

**Ожидаемые логи:**
```
✅ API подключение успешно: статус 200
✅ Создан OzonAPIClient для Client-Id: 12345678...
```

---

## 📚 Документация Ozon API

### Официальная документация
- **Основная:** https://docs.ozon.ru/
- **Seller API:** https://docs.ozon.ru/api/seller/
- **Аутентификация:** https://docs.ozon.ru/api/seller/#section/Avtorizaciya

### Основные эндпоинты

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| `POST` | `/v3/product/list` | Список товаров |
| `POST` | `/v3/product/info` | Информация о товаре |
| `POST` | `/v3/product/update` | Обновление товара |
| `POST` | `/v3/order/list` | Список заказов |
| `POST` | `/v3/order/info` | Информация о заказе |

### Примеры запросов

#### Получение списка товаров
```javascript
const response = await ozonClient.makeRequest('POST', '/v3/product/list', {
  filter: {},
  limit: 100
});
```

#### Получение заказов
```javascript
const response = await ozonClient.makeRequest('POST', '/v3/order/list', {
  filter: {
    since: '2024-01-01T00:00:00Z',
    to: '2024-12-31T23:59:59Z'
  },
  limit: 100
});
```

---

## ⚠️ Ограничения и лимиты

### Rate Limiting
- **Лимит:** 50 запросов в секунду
- **Окно:** 1 секунда
- **Обработка:** Автоматическая задержка при превышении

### Квоты
- **Товары:** до 1000 товаров за запрос
- **Заказы:** до 100 заказов за запрос
- **Аналитика:** до 30 дней данных

### Обработка ошибок
```javascript
// Автоматическая обработка в OzonAPIClient
if (response.status === 429) {
  // Rate limit exceeded - автоматическая задержка
  await this.rateLimiter.waitIfNeeded();
}
```

---

## 🔍 Отладка проблем

### 1. Проверка токенов
```bash
# Проверить переменные окружения
pm2 show boss-ai-ozon-manager | grep OZON
```

### 2. Логи API запросов
```bash
# Смотреть логи в реальном времени
pm2 logs boss-ai-ozon-manager --lines 50

# Искать ошибки API
pm2 logs boss-ai-ozon-manager | grep -i "error\|fail\|401\|403"
```

### 3. Тест подключения
```bash
# Проверить health check
curl http://localhost:4200/api/health

# Проверить API через прокси
curl http://localhost:3000/api/ozon/stores
```

### 4. Частые ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `401 Unauthorized` | Неверный API ключ | Проверить OZON_API_KEY |
| `403 Forbidden` | Недостаточно прав | Обновить права в Ozon Seller |
| `429 Too Many Requests` | Превышен лимит | Подождать или уменьшить частоту |
| `500 Internal Server Error` | Ошибка Ozon API | Повторить запрос позже |

---

## 🚀 Готовые конфигурации

### Для разработки (Mock)
```env
OZON_MOCK_MODE=true
OZON_CLIENT_ID=mock-client
OZON_API_KEY=mock-key
```

### Для production
```env
OZON_MOCK_MODE=false
OZON_CLIENT_ID=реальный_client_id
OZON_API_KEY=реальный_api_key
```

### Для тестирования с реальным API
```env
OZON_MOCK_MODE=false
OZON_CLIENT_ID=тестовый_client_id
OZON_API_KEY=тестовый_api_key
```

---

## 📞 Поддержка

- **Ozon Seller Support:** https://seller.ozon.ru/support
- **API Документация:** https://docs.ozon.ru/
- **Telegram поддержка:** @OzonSellerSupport

---

**💡 Совет:** Начните с mock режима для разработки, затем переходите на реальное API для тестирования.
