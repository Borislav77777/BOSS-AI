#!/bin/bash

# Ozon Manager Backend - Скрипт запуска

echo "🚀 Запуск Ozon Manager Backend API..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 18+ и попробуйте снова."
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js версии 18 или выше. Текущая версия: $(node -v)"
    exit 1
fi

# Проверяем наличие package.json
if [ ! -f "package.json" ]; then
    echo "❌ package.json не найден. Запустите скрипт из папки backend."
    exit 1
fi

# Создаем необходимые папки
echo "📁 Создание необходимых папок..."
mkdir -p data
mkdir -p logs

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  .env файл не найден. Создаем из примера..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ .env файл создан. Отредактируйте его при необходимости."
    else
        echo "❌ env.example файл не найден."
        exit 1
    fi
fi

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка при установке зависимостей."
        exit 1
    fi
fi

# Проверяем режим запуска
if [ "$1" = "dev" ]; then
    echo "🔧 Запуск в режиме разработки..."
    npm run dev
elif [ "$1" = "prod" ]; then
    echo "🏭 Запуск в продакшен режиме..."
    npm run build
    npm start
else
    echo "🔧 Запуск в режиме разработки (по умолчанию)..."
    echo "💡 Используйте 'dev' для разработки или 'prod' для продакшена"
    npm run dev
fi
