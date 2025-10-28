# Запуск всех сервисов для разработки
Write-Host "🚀 Запуск Boss AI Platform..." -ForegroundColor Green

# Запуск Ozon Manager
Write-Host "📊 Запуск Ozon Manager (порт 4200)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend\ozon-manager; npm run dev"

# Ждем 3 секунды
Start-Sleep -Seconds 3

# Запуск API Gateway
Write-Host "🌐 Запуск API Gateway (порт 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend\main; npm run dev"

# Ждем 3 секунды
Start-Sleep -Seconds 3

# Запуск Frontend
Write-Host "💻 Запуск Frontend (порт 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ Все сервисы запущены!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Доступные сервисы:" -ForegroundColor Cyan
Write-Host "📊 Ozon Manager: http://localhost:4200" -ForegroundColor Cyan
Write-Host "🌐 API Gateway: http://localhost:3000" -ForegroundColor Cyan
Write-Host "💻 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Health checks:" -ForegroundColor Cyan
Write-Host "🔍 API Gateway Health: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host "🔍 Ozon Manager Health: http://localhost:4200/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Для остановки сервисов закройте окна PowerShell" -ForegroundColor Gray
