<!-- 3fabc98c-7325-4487-bd85-6c744f7dce06 64ecaf2c-89f2-48f1-888a-debd9b7e5a1a -->
# Комплексный план: PULS Platform + Anti-Procrastination OS + Деплой

## Структура проекта

Все работы выполняются в директории `C:\Users\BAZA\PULS\`

## Приоритет 1: Anti-Procrastination OS (Tiktik аналог)

### Архитектура сервиса

**Интеграция в:** `barsukov-platform-ts`

**База данных:** LocalStorage (без авторизации)

**Микросервисы:** Python для AI-функций

### Файлы для создания:

1. **Компоненты React** в `barsukov-platform-ts/src/components/AntiProcrastination/`:

   - `AntiProcrastinationService.tsx` - главный компонент
   - `TaskDecomposer.tsx` - декомпозиция задач с AI
   - `TimeBlockPlanner.tsx` - планировщик временных блоков
   - `SmartTimer.tsx` - таймер с уведомлениями
   - `ProgressTracker.tsx` - отслеживание прогресса
   - `HelpSystem.tsx` - система помощи с кнопками
   - `MicroActionsList.tsx` - список микро-действий

2. **Типы** в `barsukov-platform-ts/src/types/anti-procrastination.ts`

3. **Сервисы** в `barsukov-platform-ts/src/services/antiProcrastination/`:

   - `taskService.ts` - управление задачами
   - `timeEstimationService.ts` - оценка времени
   - `notificationService.ts` - уведомления
   - `localStorageService.ts` - работа с LocalStorage

4. **Python микросервисы** в `C:\Users\BAZA\PULS\microservices\`:

   - `task_decomposer.py` - AI декомпозиция через OpenAI
   - `time_estimator.py` - оценка времени задач
   - `motivation_engine.py` - генерация мотивационных сообщений

5. **Регистрация сервиса** в `barsukov-platform-ts/public/services/anti-procrastination.json`

### Ключевые функции:

- Автоматическая декомпозиция задач на блоки 10-40 минут
- Таймеры с техникой Pomodoro (25/5)
- Кнопки помощи для каждой задачи
- Микро-действия с отметкой выполнения
- Прогресс-бар и геймификация
- Детокс-режим (блокировка отвлекающих факторов)
- Ежедневные отчеты

## Приоритет 2: Исправление багов CARAT

### Файл: `C:\Users\BAZA\CARAT\babylon_configurator.html`

**Баги из TODO.md для исправления:**

1. **Критические:**

   - Система материалов: добавить проверку инициализации перед использованием
   - Загрузка моделей: добавить retry механизм для GLB
   - Камера: исправить lowerBetaLimit и upperBetaLimit

2. **Средние:**

   - Поиск материалов: улучшить алгоритм поиска (fuzzy search)
   - AR режим: интеграция QR-кода через библиотеку qrcode.js
   - Сравнение диванов: добавить кнопку "Выйти из сравнения"

3. **Оптимизация:**

   - Добавить LOD систему для производительности
   - Кэширование загруженных моделей
   - Асинхронная загрузка текстур

## Приоритет 3: Подготовка деплоя

### 3.1 CARAT → carat-factory3d.store

**DNS уже настроен:** 217.12.38.90

**Инструкция деплоя** (`C:\Users\BAZA\PULS\deploy\carat-deploy-guide.md`):

1. SSH подключение к серверу beget
2. Создание директории проекта
3. Копирование файлов через FTP/SFTP
4. Настройка nginx конфигурации
5. SSL сертификат (Let's Encrypt)
6. Проверка работоспособности

**Файлы для подготовки:**

- `deploy-carat.sh` - скрипт автоматического деплоя
- `nginx-carat.conf` - конфигурация nginx
- `.htaccess` - если используется Apache
- `deploy-checklist.md` - чек-лист проверок

### 3.2 Platform → ballu-splitsistema.ru

**DNS уже настроен:** 87.236.16.223

**Инструкция деплоя** (`C:\Users\BAZA\PULS\deploy\platform-deploy-guide.md`):

1. Build production версии: `npm run build`
2. SSH подключение
3. Копирование dist/ директории
4. Настройка nginx для SPA
5. SSL сертификат
6. Настройка микросервисов (если нужны на проде)

**Файлы для подготовки:**

- `deploy-platform.sh`
- `nginx-platform.conf`
- `ecosystem.config.js` - для PM2 (Node.js процесс-менеджер)

## Приоритет 4: Скрипты продаж

### Структура: `C:\Users\BAZA\PULS\sales-scripts\`

**HTML страницы с интерактивными элементами:**

1. **3D-Конфигуратор** (`sales-3d-configurator.html`)

   - Описание продукта
   - Демо-видео/скриншоты
   - Цены (от 200к)
   - Примеры работ (CARAT)
   - Форма заказа

2. **AR-Маскоты** (`sales-ar-mascots.html`)

3. **AI-Юрист** (`sales-ai-lawyer.html`)

4. **AI-Продавец** (`sales-ai-seller.html`)

5. **AI-Звонилка** (`sales-ai-caller.html`)

6. **AI-HR** (`sales-ai-hr.html`)

7. **Telegram-магазин** (`sales-telegram-shop.html`)

8. **Автопарсинг товаров** (`sales-autoparser.html`)

9. **Модуль 152-ФЗ** (`sales-152fz.html`)

10. **Бот рассылок** (`sales-newsletter-bot.html`)

11. **Контент-завод** (`sales-content-factory.html`)

12. **Лидогенератор** (`sales-leadgen.html`)

13. **Парсер-лидогенератор** (`sales-lead-parser.html`)

14. **CRM** (`sales-crm.html`)

15. **Мессенджер** (`sales-messenger.html`)

**Общий шаблон:** `_template.html` с переиспользуемыми компонентами

**Интерактивные элементы:**

- Калькулятор стоимости
- Демо-режим (try before buy)
- Видео-туры
- FAQ аккордеон
- Форма заказа с автоматической отправкой в CRM

## Приоритет 5: Регламенты компании

### Структура: `C:\Users\BAZA\PULS\company-regulations\`

**HTML документы с навигацией:**

### 5.1 Организационная структура (`org-structure.html`)

**Отделы и роли:**

1. **Отдел продаж**

   - Head of Sales (начальник отдела продаж)
   - Sales Manager (менеджер по продажам)
   - Lead Generation Specialist (менеджер по лояльности)

2. **Отдел разработки**

   - CTO (технический директор)
   - Frontend Developer
   - Backend Developer
   - DevOps Engineer
   - QA Engineer

3. **Отдел маркетинга**

   - Head of Marketing
   - Content Manager
   - SMM Manager
   - SEO Specialist

4. **Отдел поддержки**

   - Support Team Lead
   - Customer Success Manager
   - Technical Support Specialist

5. **Административный отдел**

   - CEO (генеральный директор)
   - Project Manager
   - HR Manager
   - Finance Manager

### 5.2 Должностные инструкции

**Для каждой роли** (`role-{name}.html`):

- Обязанности
- KPI
- Зона ответственности
- Взаимодействие с другими отделами
- Инструменты работы

### 5.3 Бизнес-процессы (`processes/`)

1. `sales-process.html` - Процесс продаж
2. `development-process.html` - Процесс разработки
3. `support-process.html` - Процесс поддержки
4. `onboarding-process.html` - Онбординг сотрудников
5. `crisis-management.html` - Антикризисное управление

### 5.4 Сценарии встреч (`meeting-scenarios/`)

1. `installation-meeting.html` - Установочная встреча (театр переговоров)
2. `daily-standup.html` - Ежедневный стендап
3. `weekly-review.html` - Еженедельный ревью
4. `monthly-planning.html` - Месячное планирование

### 5.5 Философия "Машина Идей" (`philosophy.html`)

- Три столпа: престиж команды, лидера, проекта
- Принципы лидерства
- Человекоцентричный подход
- Использование Boss AI

## Приоритет 6: Контент-генерация и постинг

### Структура: `C:\Users\BAZA\PULS\content-factory\`

### 6.1 Python микросервисы

**Файлы в `microservices/content/`:**

1. `content_generator.py` - генерация контента через OpenAI
2. `seo_optimizer.py` - SEO оптимизация статей
3. `telegram_poster.py` - постинг в Telegram
4. `vk_poster.py` - постинг в VK
5. `instagram_poster.py` - постинг в Instagram
6. `youtube_uploader.py` - загрузка на YouTube
7. `article_formatter.py` - форматирование статей

### 6.2 Типы контента

**Конфигурация** (`content-config.json`):

```json
{
  "telegram": {
    "types": ["posts", "stories", "polls"],
    "frequency": "daily",
    "topics": ["продукты", "кейсы", "советы"]
  },
  "vk": {
    "types": ["posts", "articles", "videos"],
    "frequency": "daily"
  },
  "instagram": {
    "types": ["posts", "reels", "stories"],
    "frequency": "2x daily"
  },
  "youtube": {
    "types": ["tutorials", "demos", "interviews"],
    "frequency": "weekly"
  },
  "website": {
    "types": ["seo-articles", "case-studies", "guides"],
    "frequency": "3x weekly"
  }
}
```

### 6.3 Шаблоны контента

**Директория `templates/`:**

1. `post-template.txt` - шаблон поста
2. `article-template.html` - шаблон статьи
3. `video-script-template.txt` - скрипт видео
4. `case-study-template.md` - кейс-стади

### 6.4 Планировщик

`content_scheduler.py` - автоматическое планирование и публикация

## Приоритет 7: Бизнес-план и архитектура

### Файлы в `C:\Users\BAZA\PULS\business\`

1. **`business-plan.html`** - полный бизнес-план

   - Executive Summary
   - Описание продуктов (все 15 сервисов)
   - Целевая аудитория
   - Конкурентный анализ
   - Маркетинговая стратегия
   - Финансовый план (текущее состояние + прогноз)
   - План развития до НГ

2. **`product-catalog.html`** - каталог всех продуктов

   - Готовые продукты на продажу
   - Кастомная разработка
   - Сервисы по подписке
   - Готовые бизнесы под ключ

3. **`pricing-strategy.html`** - ценообразование

   - Разовые продажи
   - Подписки (месяц/год)
   - Пакеты услуг
   - Специальные предложения

4. **`sales-funnel.html`** - воронка продаж

   - Холодный трафик → Лидогенерация
   - Прогрев → Демонстрация
   - Закрытие → Продажа
   - Удержание → Апсейл

## Технические детали реализации

### Anti-Procrastination OS - ключевые функции

**LocalStorage schema:**

```typescript
interface APOSData {
  tasks: Task[];
  currentBlock: TimeBlock | null;
  completedBlocks: TimeBlock[];
  dailyStats: DailyStats;
  settings: UserSettings;
}
```

**Python микросервис API:**

```python
# task_decomposer.py
@app.route('/api/decompose', methods=['POST'])
def decompose_task():
    task = request.json['task']
    context = request.json.get('context', '')
    
    # OpenAI API call
    subtasks = ai_decompose(task, context)
    
    return jsonify({
        'subtasks': subtasks,
        'estimated_time': calculate_time(subtasks)
    })
```

### Интеграция APOS в платформу

**Регистрация в** `barsukov-platform-ts/public/services/anti-procrastination.json`:

```json
{
  "id": "anti-procrastination",
  "name": "Anti-Procrastination OS",
  "version": "1.0.0",
  "description": "Система борьбы с прокрастинацией через микро-действия",
  "icon": "⚡",
  "component": "AntiProcrastinationService",
  "category": "productivity",
  "features": [
    "AI декомпозиция задач",
    "Временные блоки",
    "Таймеры Pomodoro",
    "Геймификация"
  ]
}
```

## Структура директории PULS

```
C:\Users\BAZA\PULS\
├── microservices/
│   ├── content/
│   │   ├── content_generator.py
│   │   ├── seo_optimizer.py
│   │   ├── telegram_poster.py
│   │   ├── vk_poster.py
│   │   ├── instagram_poster.py
│   │   └── youtube_uploader.py
│   ├── anti_procrastination/
│   │   ├── task_decomposer.py
│   │   ├── time_estimator.py
│   │   └── motivation_engine.py
│   └── requirements.txt
├── sales-scripts/
│   ├── _template.html
│   ├── sales-3d-configurator.html
│   ├── sales-ai-lawyer.html
│   └── ... (15 продуктов)
├── company-regulations/
│   ├── index.html
│   ├── org-structure.html
│   ├── philosophy.html
│   ├── roles/
│   │   └── role-{name}.html (15+ ролей)
│   ├── processes/
│   │   └── {process}.html
│   └── meetings/
│       └── {scenario}.html
├── content-factory/
│   ├── content-config.json
│   ├── templates/
│   └── scheduler-config.json
├── business/
│   ├── business-plan.html
│   ├── product-catalog.html
│   ├── pricing-strategy.html
│   └── sales-funnel.html
├── deploy/
│   ├── carat-deploy-guide.md
│   ├── platform-deploy-guide.md
│   ├── deploy-carat.sh
│   ├── deploy-platform.sh
│   ├── nginx-carat.conf
│   └── nginx-platform.conf
└── README.md
```

## Порядок выполнения

1. **Создание структуры** `C:\Users\BAZA\PULS\` с поддиректориями
2. **Anti-Procrastination OS** - интеграция в платформу
3. **Исправление багов CARAT** по списку TODO.md
4. **Скрипты продаж** - все 15 HTML страниц
5. **Регламенты компании** - структура и роли
6. **Контент-генерация** - Python микросервисы
7. **Бизнес-план** - полная документация
8. **Инструкции деплоя** - готовые скрипты и гайды

## Ожидаемые результаты

- ✅ Anti-Procrastination OS работает в платформе
- ✅ CARAT без критических багов, готов к деплою
- ✅ Инструкции для деплоя обоих проектов
- ✅ 15 HTML страниц скриптов продаж
- ✅ Полная структура компании с ролями
- ✅ Python микросервисы для контент-генерации
- ✅ Бизнес-план и архитектура управления
- ✅ Все в директории PULS с удобной навигацией

### To-dos

- [ ] Блок 1: Проверка AI Lawyer сервиса (15-20 мин)
- [ ] Блок 2.1: CARAT Визуализация (пунктир, модели на полу, камера, размеры, линейки)
- [ ] Блок 2.2: CARAT Интерфейс (кнопки, подсказки, AR, hover)
- [ ] Блок 2.3: CARAT Логика модулей (размещение, наложение, список)
- [ ] Блок 3.1: CARAT Материалы (вкладки, файл рекомендаций, поиск, прокрутка)
- [ ] Блок 3.2: CARAT UX (загрузка, сравнение диванов)
- [ ] Блок 3.3: CARAT Контент (убрать слово Коллекция)
- [ ] Блок 4: Финальная проверка, список багов, отчет