#!/bin/bash

echo "🔍 Быстрая проверка системы Boss AI Platform"
echo "=============================================="
echo ""

# Проверка PM2
echo "1. Статус PM2 процессов:"
pm2 status | grep -E "boss-ai|online"
echo ""

# Проверка Frontend
echo "2. Frontend (https://boss-ai.online):"
curl -s -I https://boss-ai.online 2>&1 | head -1
echo ""

# Проверка API Gateway
echo "3. API Gateway (localhost:3000):"
curl -s http://localhost:3000/api/health | grep -o '"status":"[^"]*"' || echo "❌ Недоступен"
echo ""

# Проверка Ozon Manager
echo "4. Ozon Manager (localhost:4200):"
curl -s http://localhost:4200/api/health | grep -o '"status":"[^"]*"' || echo "❌ Недоступен"
echo ""

# Проверка БД
echo "5. База данных:"
if [ -f "backend/ozon-manager/data/ozon_manager.db" ]; then
  echo "✅ БД существует: $(ls -lh backend/ozon-manager/data/ozon_manager.db | awk '{print $5}')"
else
  echo "❌ БД не найдена"
fi
echo ""

# Проверка логов на ошибки
echo "6. Последние ошибки в логах:"
pm2 logs --nostream --lines 5 --err 2>/dev/null | grep -E "ERROR|error|Error" | tail -3 || echo "✅ Критических ошибок нет"
echo ""

echo "=============================================="
echo "✅ Проверка завершена!"
echo ""
echo "Для полных логов: pm2 logs --lines 50"
echo "Для рестарта: pm2 restart all"
