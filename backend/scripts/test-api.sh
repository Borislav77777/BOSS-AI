#!/bin/bash

# Ozon Manager Backend - Скрипт тестирования API

echo "🧪 Тестирование Ozon Manager Backend API..."

# Проверяем что API запущен
API_URL="http://localhost:3001"
HEALTH_ENDPOINT="$API_URL/api/health"

echo "🔍 Проверка доступности API..."
if curl -s "$HEALTH_ENDPOINT" > /dev/null; then
    echo "✅ API доступен"
else
    echo "❌ API недоступен. Убедитесь что backend запущен на порту 3001"
    exit 1
fi

# Тестируем health endpoint
echo "🏥 Тестирование health endpoint..."
HEALTH_RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
if echo "$HEALTH_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Health check прошел успешно"
else
    echo "❌ Health check не прошел"
    echo "Ответ: $HEALTH_RESPONSE"
fi

# Тестируем получение магазинов
echo "🏪 Тестирование получения магазинов..."
STORES_RESPONSE=$(curl -s "$API_URL/api/stores")
if echo "$STORES_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Получение магазинов работает"
else
    echo "❌ Ошибка получения магазинов"
    echo "Ответ: $STORES_RESPONSE"
fi

# Тестируем статус планировщика
echo "📅 Тестирование статуса планировщика..."
SCHEDULER_RESPONSE=$(curl -s "$API_URL/api/schedule/status")
if echo "$SCHEDULER_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Статус планировщика получен"
else
    echo "❌ Ошибка получения статуса планировщика"
    echo "Ответ: $SCHEDULER_RESPONSE"
fi

# Тестируем получение логов
echo "📋 Тестирование получения логов..."
LOGS_RESPONSE=$(curl -s "$API_URL/api/logs")
if echo "$LOGS_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Получение логов работает"
else
    echo "❌ Ошибка получения логов"
    echo "Ответ: $LOGS_RESPONSE"
fi

echo ""
echo "🎉 Тестирование завершено!"
echo "💡 Для полного тестирования добавьте магазин через API:"
echo "curl -X POST $API_URL/api/stores \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"name\":\"Test Store\",\"client_id\":\"123\",\"api_key\":\"key\",\"remove_from_promotions\":false,\"unarchive_enabled\":false,\"manual_run_on_startup\":false,\"schedule_times\":{\"remove\":\"09:00\",\"unarchive\":\"10:00\"}}'"
