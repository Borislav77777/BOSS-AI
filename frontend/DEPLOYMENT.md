# 🚀 Руководство по деплою BARSUKOV OS на VPS с HestiaCP

## 📋 Обзор

Это руководство поможет вам развернуть приложение BARSUKOV OS на VPS с HestiaCP по адресу `ballu-splitsistema.ru`.

**Технические детали:**
- **Сервер:** VPS с HestiaCP
- **IP:** 217.12.38.90
- **Домен:** ballu-splitsistema.ru
- **Пользователь:** admin
- **Пароль:** !UzA*9YS
- **Root пароль:** Aj2*Cg+AChp7

## 🎯 Быстрый старт

### 1. Локальная подготовка

```bash
# Переходим в папку проекта
cd barsukov-platform-ts

# Устанавливаем зависимости
npm install

# Запускаем production сборку
npm run deploy
```

### 2. Перенос файлов

```bash
# Переносим файлы на сервер
scp -r dist/* admin@217.12.38.90:/home/admin/web/ballu-splitsistema.ru/public_html/
```

### 3. Проверка

Откройте http://ballu-splitsistema.ru в браузере.

---

## 📖 Подробная инструкция

### Часть 1: Локальная подготовка

#### 1.1 Проверка окружения

Убедитесь, что у вас установлены:
- Node.js 16+
- npm 8+
- Git

```bash
node --version  # Должно быть v16+
npm --version   # Должно быть 8+
git --version
```

#### 1.2 Клонирование и установка

```bash
# Если проект еще не клонирован
git clone <repository-url> barsukov-platform-ts
cd barsukov-platform-ts

# Установка зависимостей
npm install
```

#### 1.3 Проверка кода

```bash
# Проверка TypeScript
npm run type-check

# Линтинг
npm run lint

# Тесты (если есть)
npm run test
```

#### 1.4 Production сборка

```bash
# Создание production сборки
npm run build:prod

# Или используйте автоматизированный скрипт
npm run deploy
```

#### 1.5 Проверка сборки

```bash
# Предварительный просмотр production сборки
npm run preview:prod

# Откройте http://localhost:4173
# Проверьте что все работает корректно
```

### Часть 2: Подключение к серверу

#### 2.1 SSH подключение

```bash
# Подключение к серверу
ssh admin@217.12.38.90

# Введите пароль: !UzA*9YS
```

#### 2.2 Подготовка директорий

```bash
# Создание структуры директорий HestiaCP
mkdir -p /home/admin/web/ballu-splitsistema.ru/public_html

# Установка правильных прав доступа
chown -R admin:admin /home/admin/web/ballu-splitsistema.ru
chmod -R 755 /home/admin/web/ballu-splitsistema.ru/public_html

# Проверка структуры
ls -la /home/admin/web/ballu-splitsistema.ru/
```

### Часть 3: Перенос файлов

#### 3.1 Вариант A: SCP (рекомендуется)

```bash
# Из локальной машины
scp -r dist/* admin@217.12.38.90:/home/admin/web/ballu-splitsistema.ru/public_html/

# Или используйте архив
scp deploy-archive.tar.gz admin@87.236.16.223:/home/admin/web/ballu-splitsistema.ru/
```

На сервере:
```bash
# Распаковка архива (если использовали архив)
cd /home/admin/web/ballu-splitsistema.ru/
tar -xzf deploy-archive.tar.gz
```

#### 3.2 Вариант B: FileZilla/WinSCP (для Windows)

**Настройки подключения:**
- **Host:** 217.12.38.90
- **Protocol:** SFTP
- **Port:** 22
- **User:** admin
- **Password:** !UzA*9YS
- **Remote path:** `/home/admin/web/ballu-splitsistema.ru/public_html/`

**Действия:**
1. Подключитесь к серверу
2. Перейдите в папку `/home/admin/web/ballu-splitsistema.ru/public_html/`
3. Загрузите все файлы из папки `dist/`

#### 3.3 Проверка загрузки

```bash
# На сервере проверьте что файлы загружены
ls -la /home/admin/web/ballu-splitsistema.ru/public_html/

# Должны быть файлы:
# - index.html
# - assets/ (папка с JS и CSS)
# - services/ (папка с сервисами)
# - logo.svg
```

### Часть 4: Настройка веб-сервера

#### 4.1 Для Nginx (если используется)

```bash
# Копирование конфигурации Nginx
cp /path/to/nginx.conf /etc/nginx/sites-available/ballu-splitsistema.ru

# Создание символической ссылки
ln -s /etc/nginx/sites-available/ballu-splitsistema.ru /etc/nginx/sites-enabled/

# Проверка конфигурации
nginx -t

# Перезапуск Nginx
systemctl restart nginx
```

#### 4.2 Для Apache (если используется)

```bash
# Копирование .htaccess в корень сайта
cp /path/to/.htaccess /home/admin/web/ballu-splitsistema.ru/public_html/

# Перезапуск Apache
systemctl restart apache2
```

#### 4.3 Через HestiaCP (рекомендуется)

1. Войдите в панель HestiaCP: `https://87.236.16.223:8083`
2. Перейдите в раздел "Web"
3. Найдите домен `ballu-splitsistema.ru`
4. Убедитесь что домен активен
5. Проверьте настройки PHP (если нужно)

### Часть 5: Проверка работоспособности

#### 5.1 Базовая проверка

```bash
# Проверка доступности домена
ping ballu-splitsistema.ru

# Проверка HTTP ответа
curl -I http://ballu-splitsistema.ru
```

#### 5.2 Проверка в браузере

1. Откройте http://ballu-splitsistema.ru
2. Проверьте загрузку главной страницы
3. Проверьте переходы между разделами (Chat, Settings, Workspace)
4. Откройте Developer Tools (F12)
5. Проверьте Console на наличие ошибок
6. Проверьте Network tab на загрузку ресурсов

#### 5.3 Проверка функциональности

- [ ] Загружается главная страница
- [ ] Работает навигация между разделами
- [ ] Загружаются все статические файлы (CSS, JS, изображения)
- [ ] Нет ошибок в консоли браузера
- [ ] Работает чат
- [ ] Работают настройки
- [ ] Работает рабочее пространство

### Часть 6: Настройка SSL (HTTPS)

#### 6.1 Через HestiaCP

1. Войдите в панель HestiaCP
2. Перейдите в раздел "Web"
3. Найдите домен `ballu-splitsistema.ru`
4. Нажмите "SSL"
5. Выберите "Let's Encrypt"
6. Нажмите "Save"

#### 6.2 Через командную строку

```bash
# Установка SSL сертификата
v-add-letsencrypt-domain admin ballu-splitsistema.ru

# Проверка SSL
curl -I https://ballu-splitsistema.ru
```

#### 6.3 Проверка SSL

1. Откройте https://ballu-splitsistema.ru
2. Проверьте что сайт загружается по HTTPS
3. Проверьте сертификат в браузере
4. Проверьте рейтинг SSL: [SSL Labs](https://www.ssllabs.com/ssltest/)

### Часть 7: Мониторинг и аналитика

#### 7.1 Настройка аналитики

Добавьте в код приложения (если нужно):

```javascript
// Google Analytics
gtag('config', 'GA_TRACKING_ID');

// Яндекс.Метрика
ym('YANDEX_METRIKA_ID', 'init', {
    // настройки
});
```

#### 7.2 Настройка мониторинга ошибок

```javascript
// Sentry
import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    environment: "production"
});
```

#### 7.3 Проверка производительности

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

---

## 🔧 Устранение неполадок

### Проблема: Сайт не загружается

**Проверьте:**
1. DNS записи настроены корректно
2. Файлы загружены в правильную директорию
3. Веб-сервер запущен
4. Права доступа установлены правильно

```bash
# Проверка DNS
nslookup ballu-splitsistema.ru

# Проверка файлов
ls -la /home/admin/web/ballu-splitsistema.ru/public_html/

# Проверка веб-сервера
systemctl status nginx  # или apache2
```

### Проблема: 404 ошибки при переходе по ссылкам

**Решение:** Убедитесь что настроен SPA routing:

**Для Nginx:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Для Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Проблема: Статические файлы не загружаются

**Проверьте:**
1. Пути к файлам в `index.html`
2. Права доступа на файлы
3. Настройки кэширования

```bash
# Проверка прав доступа
chmod -R 644 /home/admin/web/ballu-splitsistema.ru/public_html/assets/
chmod -R 755 /home/admin/web/ballu-splitsistema.ru/public_html/assets/
```

### Проблема: Медленная загрузка

**Оптимизации:**
1. Включите gzip сжатие
2. Настройте кэширование
3. Оптимизируйте изображения
4. Используйте CDN (опционально)

---

## 📊 Мониторинг после деплоя

### Ежедневные проверки

- [ ] Сайт доступен
- [ ] Нет ошибок в логах
- [ ] Производительность в норме
- [ ] SSL сертификат действителен

### Еженедельные проверки

- [ ] Обновления безопасности
- [ ] Анализ производительности
- [ ] Проверка backup'ов
- [ ] Обновление зависимостей

### Ежемесячные проверки

- [ ] Анализ использования
- [ ] Планирование обновлений
- [ ] Проверка безопасности
- [ ] Оптимизация производительности

---

## 🔄 Обновление приложения

### Процесс обновления

1. **Локальная подготовка:**
   ```bash
   git pull origin main
   npm install
   npm run deploy
   ```

2. **Backup текущей версии:**
   ```bash
   # На сервере
   cp -r /home/admin/web/ballu-splitsistema.ru/public_html /home/admin/web/ballu-splitsistema.ru/public_html.backup.$(date +%Y%m%d)
   ```

3. **Перенос новой версии:**
   ```bash
   scp -r dist/* admin@217.12.38.90:/home/admin/web/ballu-splitsistema.ru/public_html/
   ```

4. **Проверка:**
   - Откройте сайт в браузере
   - Проверьте функциональность
   - Проверьте консоль на ошибки

5. **Откат (если нужно):**
   ```bash
   # На сервере
   rm -rf /home/admin/web/ballu-splitsistema.ru/public_html
   mv /home/admin/web/ballu-splitsistema.ru/public_html.backup.$(date +%Y%m%d) /home/admin/web/ballu-splitsistema.ru/public_html
   ```

---

## 📞 Поддержка

### Контакты

- **Техническая поддержка:** [ваш email]
- **Документация:** [ссылка на документацию]
- **Issues:** [ссылка на GitHub issues]

### Полезные ссылки

- [HestiaCP Documentation](https://hestiacp.com/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Apache Documentation](https://httpd.apache.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Удачного деплоя! 🚀**
