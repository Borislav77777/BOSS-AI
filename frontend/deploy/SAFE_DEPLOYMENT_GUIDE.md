# 🛡️ БЕЗОПАСНЫЙ ДЕПЛОЙ - Не ломаем существующие настройки!

## ⚠️ КРИТИЧЕСКИ ВАЖНО

**Этот гайд гарантирует что мы:**
- ✅ НЕ сломаем другие сайты на сервере
- ✅ НЕ изменим существующие DNS записи
- ✅ НЕ затронем базы данных других сайтов
- ✅ НЕ изменим глобальные настройки сервера
- ✅ Работаем ТОЛЬКО с нашим доменом

---

## 📋 Предварительная проверка (ОБЯЗАТЕЛЬНО!)

### 1. Проверка текущей конфигурации сервера

```bash
# Подключаемся к серверу
ssh admin@217.12.38.90

# Проверяем список сайтов на сервере
v-list-web-domains admin

# Смотрим какие сайты уже есть
ls -la /home/admin/web/

# Проверяем конфигурацию nginx/apache
ls -la /etc/nginx/sites-enabled/
# или
ls -la /etc/apache2/sites-enabled/
```

**Результат:** Убедитесь что `ballu-splitsistema.ru` либо еще не существует, либо это ваш домен.

### 2. Проверка DNS записей

```bash
# Проверяем что DNS записи УЖЕ настроены
nslookup ballu-splitsistema.ru

# Должно показать: 217.12.38.90
# Если показывает другой IP - НЕ ПРОДОЛЖАЙТЕ!
```

### 3. Проверка существующих файлов

```bash
# Проверяем что будет в директории
ls -la /home/admin/web/ballu-splitsistema.ru/public_html/

# Если там уже есть файлы - сделайте BACKUP!
```

---

## 🔒 Безопасный процесс деплоя

### Шаг 1: Создание BACKUP (ОБЯЗАТЕЛЬНО!)

```bash
# На сервере - создаем backup если домен уже существует
cd /home/admin/web/

# Проверяем существует ли домен
if [ -d "ballu-splitsistema.ru" ]; then
    # Создаем backup с датой
    cp -r ballu-splitsistema.ru ballu-splitsistema.ru.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup создан!"
else
    echo "✅ Домен не существует, backup не нужен"
fi
```

### Шаг 2: Работа ТОЛЬКО с нашим доменом

**❌ НЕ ДЕЛАЙТЕ:**
```bash
# НЕ изменяйте глобальные конфиги!
nano /etc/nginx/nginx.conf  # ❌ ОПАСНО!
nano /etc/apache2/apache2.conf  # ❌ ОПАСНО!

# НЕ трогайте другие сайты!
cd /home/admin/web/other-site/  # ❌ ОПАСНО!
```

**✅ ДЕЛАЙТЕ:**
```bash
# Работаем ТОЛЬКО с нашим доменом
cd /home/admin/web/ballu-splitsistema.ru/public_html/

# Создаем директорию если её нет
mkdir -p /home/admin/web/ballu-splitsistema.ru/public_html
```

### Шаг 3: Использование HestiaCP (РЕКОМЕНДУЕТСЯ!)

**Самый безопасный способ - через панель управления:**

1. **Откройте HestiaCP:**
   ```
   https://217.12.38.90:8083
   Login: admin
   Password: !UzA*9YS
   ```

2. **Проверьте что домен существует:**
   - Перейдите в раздел "WEB"
   - Найдите `ballu-splitsistema.ru`
   - Если домена нет - создайте его через HestiaCP!

3. **Используйте встроенный File Manager:**
   - Перейдите в "WEB" → `ballu-splitsistema.ru` → "File Manager"
   - Загрузите файлы через интерфейс
   - **Это гарантирует правильные права доступа!**

### Шаг 4: Безопасный перенос файлов

**Вариант A: Через HestiaCP File Manager (САМЫЙ БЕЗОПАСНЫЙ)**
1. Откройте File Manager в HestiaCP
2. Перейдите в `public_html/`
3. Загрузите файлы из вашей папки `dist/`
4. HestiaCP автоматически установит правильные права

**Вариант B: Через SCP (если умеете)**
```bash
# Загружаем файлы БЕЗ удаления существующих
scp -r dist/* admin@217.12.38.90:/home/admin/web/ballu-splitsistema.ru/public_html/

# На сервере проверяем права
ls -la /home/admin/web/ballu-splitsistema.ru/public_html/
```

---

## 🚫 Что НЕ нужно менять

### 1. Конфигурация Nginx/Apache

**❌ НЕ НУЖНО вручную менять конфиги веб-сервера!**

HestiaCP **автоматически** создает правильную конфигурацию для вашего домена.

**Файлы nginx.conf и .htaccess из папки deploy/ - это СПРАВОЧНЫЕ файлы!**

Они нужны только если:
- Вы хотите посмотреть какие настройки должны быть
- Нужно добавить специфичные правила (тогда делайте через HestiaCP)

### 2. DNS записи

**❌ НЕ МЕНЯЙТЕ DNS записи если они уже настроены!**

Ваши текущие DNS записи:
```
ballu-splitsistema.ru         A    217.12.38.90
www.ballu-splitsistema.ru     A    217.12.38.90
autoconfig.ballu-splitsistema.ru  CNAME  autoconfig.beget.com.
autodiscover.ballu-splitsistema.ru CNAME autoconfig.beget.com.
```

**Это правильные записи! Не трогайте их!**

### 3. Другие домены

**❌ НЕ ТРОГАЙТЕ другие домены на сервере!**

Список команд которые НЕЛЬЗЯ использовать:
```bash
# ❌ НЕ делайте это!
v-delete-web-domain admin other-domain.com
v-change-web-domain-* admin other-domain.com
rm -rf /home/admin/web/other-domain.com/
```

### 4. Базы данных

**❌ НЕ ТРОГАЙТЕ базы данных!**

Ваш проект - это frontend приложение (React/Vite).
Оно **НЕ использует** базы данных на сервере.

```bash
# ❌ Эти команды НЕ НУЖНЫ!
v-list-databases admin
mysql -u root -p
```

---

## ✅ Пошаговая безопасная процедура

### Шаг 1: Подготовка локально
```bash
cd barsukov-platform-ts
npm install
npm run build:prod
```

### Шаг 2: Проверка на сервере
```bash
ssh admin@217.12.38.90

# Проверяем что домен существует в HestiaCP
v-list-web-domains admin | grep ballu-splitsistema.ru

# Если домен НЕ найден - создайте через HestiaCP Web панель!
```

### Шаг 3: Backup (если нужно)
```bash
# На сервере
if [ -d "/home/admin/web/ballu-splitsistema.ru/public_html" ]; then
    cd /home/admin/web/
    tar -czf ballu-splitsistema.ru.backup.$(date +%Y%m%d_%H%M%S).tar.gz ballu-splitsistema.ru/public_html/
    echo "✅ Backup создан"
fi
```

### Шаг 4: Загрузка файлов (выберите один способ)

**Способ 1: HestiaCP File Manager (РЕКОМЕНДУЕТСЯ)**
1. Откройте https://217.12.38.90:8083
2. WEB → ballu-splitsistema.ru → File Manager
3. Перейдите в public_html/
4. Загрузите все файлы из dist/
5. Готово!

**Способ 2: SCP**
```bash
# С локальной машины
cd barsukov-platform-ts
scp -r dist/* admin@217.12.38.90:/home/admin/web/ballu-splitsistema.ru/public_html/
```

**Способ 3: FileZilla/WinSCP**
- Host: 217.12.38.90
- Protocol: SFTP
- User: admin
- Password: !UzA*9YS
- Remote: /home/admin/web/ballu-splitsistema.ru/public_html/

### Шаг 5: Проверка прав доступа
```bash
# На сервере
cd /home/admin/web/ballu-splitsistema.ru/
chown -R admin:admin public_html/
find public_html/ -type d -exec chmod 755 {} \;
find public_html/ -type f -exec chmod 644 {} \;
```

### Шаг 6: Проверка работы
```bash
# Проверяем в браузере
# http://ballu-splitsistema.ru
```

---

## 🔍 Проверка что ничего не сломали

### 1. Проверка других сайтов
```bash
# На сервере
v-list-web-domains admin

# Проверьте что все сайты в статусе "active"
# Если какой-то сайт "suspended" - это проблема!
```

### 2. Проверка веб-сервера
```bash
# Проверяем что nginx/apache работает
systemctl status nginx
# или
systemctl status apache2

# Если показывает "failed" - НЕ ПАНИКУЙТЕ!
# Смотрим логи:
tail -f /var/log/nginx/error.log
# или
tail -f /var/log/apache2/error.log
```

### 3. Проверка логов
```bash
# Смотрим логи ТОЛЬКО нашего домена
tail -f /home/admin/web/ballu-splitsistema.ru/logs/access.log
tail -f /home/admin/web/ballu-splitsistema.ru/logs/error.log
```

---

## 🆘 План отката (если что-то пошло не так)

### Быстрый откат
```bash
# На сервере
cd /home/admin/web/

# Находим последний backup
ls -lt | grep ballu-splitsistema.ru.backup

# Восстанавливаем
rm -rf ballu-splitsistema.ru/public_html/*
tar -xzf ballu-splitsistema.ru.backup.YYYYMMDD_HHMMSS.tar.gz
mv ballu-splitsistema.ru/public_html/* ballu-splitsistema.ru/public_html/
```

### Контакты для экстренной помощи
- **HestiaCP Support:** https://forum.hestiacp.com/
- **Beget Support:** https://beget.com/ru/kb

---

## 📌 Чеклист безопасности

Перед деплоем убедитесь:
- [ ] Я создал backup текущих файлов
- [ ] Я НЕ буду менять глобальные конфиги сервера
- [ ] Я НЕ буду трогать другие домены
- [ ] Я НЕ буду менять DNS записи (они уже настроены)
- [ ] Я НЕ буду трогать базы данных
- [ ] Я буду работать ТОЛЬКО с /home/admin/web/ballu-splitsistema.ru/
- [ ] Я использую HestiaCP интерфейс (рекомендуется)
- [ ] У меня есть план отката

---

## ✨ Главные правила безопасного деплоя

1. **Работайте ТОЛЬКО с вашим доменом**
2. **Используйте HestiaCP панель управления**
3. **НЕ меняйте глобальные конфиги вручную**
4. **Всегда делайте backup перед изменениями**
5. **Проверяйте логи после деплоя**
6. **Имейте план отката**

---

**При соблюдении этих правил - деплой будет безопасным и не затронет другие сайты! 🛡️**
