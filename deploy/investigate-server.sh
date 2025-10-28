#!/bin/bash

# 🔍 Скрипт исследования конфигурации сервера
# Автоматически определяет настройки сервера для адаптации Boss AI Platform

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Параметры командной строки
INTERACTIVE=false
VERBOSE=false
OUTPUT_DIR="/tmp/boss-ai-investigation"

# Обработка аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --interactive|-i)
            INTERACTIVE=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --output|-o)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --help|-h)
            echo "Использование: $0 [опции]"
            echo "Опции:"
            echo "  --interactive, -i    Интерактивный режим"
            echo "  --verbose, -v        Подробный вывод"
            echo "  --output, -o DIR     Директория для результатов"
            echo "  --help, -h           Показать справку"
            exit 0
            ;;
        *)
            error "Неизвестный параметр: $1"
            exit 1
            ;;
    esac
done

# Функция для интерактивного ввода
ask_question() {
    local question="$1"
    local default="$2"
    local answer

    if [ "$INTERACTIVE" = true ]; then
        if [ -n "$default" ]; then
            read -p "$question [$default]: " answer
            echo "${answer:-$default}"
        else
            read -p "$question: " answer
            echo "$answer"
        fi
    else
        echo "$default"
    fi
}

# Функция для проверки доступности порта извне
check_port_external() {
    local port="$1"
    local hostname="$2"

    if command -v nc &> /dev/null; then
        timeout 5 nc -z "$hostname" "$port" 2>/dev/null && echo "true" || echo "false"
    else
        echo "unknown"
    fi
}

# Создать директорию для результатов
mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

log "🔍 Начинаем исследование сервера..."

# Переменные для хранения результатов
HOSTING_TYPE=""
CONTROL_PANEL=""
FIREWALL_TYPE=""
EXTERNAL_ACCESS=""

# 1. Исследование типа хостинга и прав доступа
log "1. Определение типа хостинга и прав доступа..."

# Проверка прав доступа
if [ "$EUID" -eq 0 ]; then
    ACCESS_LEVEL="root"
    success "Запущено с правами root"
elif sudo -n true 2>/dev/null; then
    ACCESS_LEVEL="sudo"
    success "Доступны права sudo"
else
    ACCESS_LEVEL="limited"
    warn "Ограниченные права доступа"
fi

# Определение типа хостинга
if [ -d "/var/cpanel" ] || [ -d "/usr/local/cpanel" ]; then
    HOSTING_TYPE="shared_cpanel"
    CONTROL_PANEL="cPanel"
    success "Обнаружен cPanel"
elif [ -d "/var/www/clients" ] || [ -d "/usr/local/ispconfig" ]; then
    HOSTING_TYPE="shared_ispconfig"
    CONTROL_PANEL="ISPConfig"
    success "Обнаружен ISPConfig"
elif [ -d "/usr/local/psa" ]; then
    HOSTING_TYPE="shared_plesk"
    CONTROL_PANEL="Plesk"
    success "Обнаружен Plesk"
elif [ -d "/usr/share/webmin" ]; then
    HOSTING_TYPE="vps_webmin"
    CONTROL_PANEL="Webmin"
    success "Обнаружен Webmin"
elif [ "$ACCESS_LEVEL" = "root" ] || [ "$ACCESS_LEVEL" = "sudo" ]; then
    HOSTING_TYPE="vps_full"
    CONTROL_PANEL="none"
    success "VPS с полным доступом"
else
    HOSTING_TYPE="shared_limited"
    CONTROL_PANEL="unknown"
    warn "Shared hosting с ограниченным доступом"
fi

# 2. Исследование веб-сервера
log "2. Определение веб-сервера..."

WEB_SERVER=""
NGINX_VERSION=""
APACHE_VERSION=""

if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d' ' -f3)
    if pgrep nginx > /dev/null; then
        WEB_SERVER="nginx"
        success "Nginx обнаружен: $NGINX_VERSION (запущен)"
    else
        warn "Nginx установлен ($NGINX_VERSION), но не запущен"
    fi
fi

if command -v apache2 &> /dev/null; then
    APACHE_VERSION=$(apache2 -v 2>&1 | head -n1 | cut -d' ' -f3)
    if pgrep apache2 > /dev/null; then
        if [ -z "$WEB_SERVER" ]; then
            WEB_SERVER="apache2"
        else
            WEB_SERVER="$WEB_SERVER,apache2"
        fi
        success "Apache2 обнаружен: $APACHE_VERSION (запущен)"
    else
        warn "Apache2 установлен ($APACHE_VERSION), но не запущен"
    fi
fi

if [ -z "$WEB_SERVER" ]; then
    error "Веб-сервер не обнаружен!"
    exit 1
fi

# 3. Исследование firewall
log "3. Определение firewall..."

if command -v ufw &> /dev/null; then
    FIREWALL_TYPE="ufw"
    if ufw status | grep -q "Status: active"; then
        success "UFW активен"
        ufw status >> firewall_status.txt
    else
        warn "UFW установлен, но не активен"
    fi
elif command -v firewall-cmd &> /dev/null; then
    FIREWALL_TYPE="firewalld"
    if systemctl is-active firewalld &>/dev/null; then
        success "Firewalld активен"
        firewall-cmd --list-all >> firewall_status.txt
    else
        warn "Firewalld установлен, но не активен"
    fi
elif command -v iptables &> /dev/null; then
    FIREWALL_TYPE="iptables"
    if iptables -L | grep -q "ACCEPT\|DROP\|REJECT"; then
        success "iptables настроен"
        iptables -L >> firewall_status.txt
    else
        warn "iptables установлен, но правила не найдены"
    fi
else
    FIREWALL_TYPE="none"
    warn "Firewall не обнаружен"
fi

# 4. Исследование структуры директорий
log "4. Исследование структуры директорий..."

DOCUMENT_ROOT=""
WEB_DIRS=()

# Поиск корневых директорий
if [ "$WEB_SERVER" = "nginx" ] || [[ "$WEB_SERVER" == *"nginx"* ]]; then
    log "Поиск Nginx конфигураций..."
    find /etc/nginx -name "*.conf" -exec grep -l "root" {} \; 2>/dev/null | while read -r file; do
        grep -n "root" "$file" 2>/dev/null | head -5 >> nginx_roots.txt
    done
fi

if [ "$WEB_SERVER" = "apache2" ] || [[ "$WEB_SERVER" == *"apache2"* ]]; then
    log "Поиск Apache конфигураций..."
    find /etc/apache2 -name "*.conf" -exec grep -l "DocumentRoot" {} \; 2>/dev/null | while read -r file; do
        grep -n "DocumentRoot" "$file" 2>/dev/null | head -5 >> apache_roots.txt
    done
fi

# Проверка стандартных директорий
for dir in /var/www/html /var/www /home/*/public_html /var/www/boss-ai.online; do
    if [ -d "$dir" ]; then
        WEB_DIRS+=("$dir")
        log "Найдена директория: $dir"
    fi
done

# 5. Исследование SSL
log "5. Исследование SSL конфигурации..."

SSL_CERTIFICATES=()
SSL_DOMAINS=()

if [ -d "/etc/letsencrypt/live" ]; then
    log "Let's Encrypt сертификаты найдены:"
    for cert_dir in /etc/letsencrypt/live/*; do
        if [ -d "$cert_dir" ]; then
            domain=$(basename "$cert_dir")
            SSL_DOMAINS+=("$domain")
            SSL_CERTIFICATES+=("$cert_dir")
            success "SSL сертификат: $domain"
        fi
    done
else
    warn "Let's Encrypt сертификаты не найдены"
fi

# Проверка существующих SSL конфигураций
if [ "$WEB_SERVER" = "nginx" ] || [[ "$WEB_SERVER" == *"nginx"* ]]; then
    grep -r "ssl_certificate" /etc/nginx/ 2>/dev/null | head -5 > nginx_ssl.txt
fi

if [ "$WEB_SERVER" = "apache2" ] || [[ "$WEB_SERVER" == *"apache2"* ]]; then
    grep -r "SSLCertificate" /etc/apache2/ 2>/dev/null | head -5 > apache_ssl.txt
fi

# 6. Исследование портов
log "6. Исследование занятых портов..."

OCCUPIED_PORTS=()
AVAILABLE_PORTS=()

# Получить список занятых портов
while read -r line; do
    port=$(echo "$line" | awk '{print $4}' | cut -d':' -f2)
    if [[ "$port" =~ ^[0-9]+$ ]]; then
        OCCUPIED_PORTS+=("$port")
    fi
done < <(netstat -tlnp 2>/dev/null | grep LISTEN)

# Найти свободные порты для микросервисов
for port in 3000 3001 4000 4200 5000 8000 8001 8080; do
    if [[ ! " ${OCCUPIED_PORTS[@]} " =~ " ${port} " ]]; then
        AVAILABLE_PORTS+=("$port")
    fi
done

log "Занятые порты: ${OCCUPIED_PORTS[*]}"
log "Доступные порты: ${AVAILABLE_PORTS[*]}"

# 7. Проверка доступности портов извне
log "7. Проверка внешней доступности портов..."

# Получение внешнего IP
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "unknown")
if [ "$EXTERNAL_IP" != "unknown" ]; then
    success "Внешний IP: $EXTERNAL_IP"

    # Проверка доступности портов
    for port in 80 443 3000 4200; do
        if [ -f "occupied_ports.txt" ] && grep -q ":$port" occupied_ports.txt; then
            external_access=$(check_port_external "$port" "$EXTERNAL_IP")
            if [ "$external_access" = "true" ]; then
                success "Порт $port доступен извне"
            elif [ "$external_access" = "false" ]; then
                warn "Порт $port занят, но недоступен извне"
            else
                info "Не удалось проверить доступность порта $port"
            fi
        fi
    done
else
    warn "Не удалось определить внешний IP"
fi

# 8. Исследование Node.js и PM2
log "8. Исследование Node.js окружения..."

NODE_VERSION=""
NPM_VERSION=""
PM2_VERSION=""
NODE_APPS=()

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js: $NODE_VERSION"
else
    warn "Node.js не установлен"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    success "npm: $NPM_VERSION"
else
    warn "npm не установлен"
fi

if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    success "PM2: $PM2_VERSION"

    # Получить список PM2 приложений
    pm2 list --format json 2>/dev/null > pm2_apps.json || true
else
    warn "PM2 не установлен"
fi

# Проверить запущенные Node.js процессы
ps aux | grep node | grep -v grep | while read -r line; do
    NODE_APPS+=("$line")
done

# 6. Исследование .htaccess файлов
log "6. Поиск .htaccess файлов..."

HTACCESS_FILES=()
find /var/www -name ".htaccess" 2>/dev/null | while read -r file; do
    HTACCESS_FILES+=("$file")
    log "Найден .htaccess: $file"
done

# 7. Исследование PHP
log "7. Исследование PHP..."

PHP_VERSION=""
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n1 | cut -d' ' -f2)
    success "PHP: $PHP_VERSION"
else
    warn "PHP не установлен"
fi

# 8. Создание отчета
log "8. Создание отчета..."

cat > server-config.json << EOF
{
  "investigation_date": "$(date -Iseconds)",
  "web_server": {
    "type": "$WEB_SERVER",
    "nginx_version": "$NGINX_VERSION",
    "apache_version": "$APACHE_VERSION"
  },
  "document_roots": [
    $(printf '"%s",' "${WEB_DIRS[@]}" | sed 's/,$//')
  ],
  "ssl": {
    "certificates": [
      $(printf '"%s",' "${SSL_CERTIFICATES[@]}" | sed 's/,$//')
    ],
    "domains": [
      $(printf '"%s",' "${SSL_DOMAINS[@]}" | sed 's/,$//')
    ]
  },
  "ports": {
    "occupied": [
      $(printf '%s,' "${OCCUPIED_PORTS[@]}" | sed 's/,$//')
    ],
    "available": [
      $(printf '%s,' "${AVAILABLE_PORTS[@]}" | sed 's/,$//')
    ]
  },
  "nodejs": {
    "version": "$NODE_VERSION",
    "npm_version": "$NPM_VERSION",
    "pm2_version": "$PM2_VERSION",
    "pm2_installed": $(command -v pm2 &> /dev/null && echo "true" || echo "false")
  },
  "php": {
    "version": "$PHP_VERSION",
    "installed": $(command -v php &> /dev/null && echo "true" || echo "false")
  },
  "recommendations": {
    "deployment_strategy": "$(if [ ${#AVAILABLE_PORTS[@]} -ge 2 ]; then echo "microservices"; else echo "single_port"; fi)",
    "ssl_strategy": "$(if [ ${#SSL_DOMAINS[@]} -gt 0 ]; then echo "reuse_existing"; else echo "create_new"; fi)",
    "web_server_config": "$(if [ "$WEB_SERVER" = "nginx" ]; then echo "nginx_location_blocks"; else echo "apache_htaccess"; fi)"
  }
}
EOF

# 9. Создание рекомендаций
log "9. Создание рекомендаций..."

cat > recommendations.md << EOF
# 🎯 Рекомендации по развертыванию Boss AI Platform

## Обнаруженная конфигурация

- **Веб-сервер**: $WEB_SERVER
- **Node.js**: $NODE_VERSION
- **PM2**: $PM2_VERSION
- **PHP**: $PHP_VERSION

## Рекомендуемая стратегия развертывания

### 1. Размещение

$(if [ ${#SSL_DOMAINS[@]} -gt 0 ]; then
    echo "**Рекомендуется**: Поддомен (app.boss-ai.online)"
    echo "- Использовать существующий SSL сертификат"
    echo "- Создать отдельную конфигурацию"
else
    echo "**Рекомендуется**: Подпапка (boss-ai.online/app/)"
    echo "- Не требует SSL настройки"
    echo "- Простая интеграция"
fi)

### 2. Порты для микросервисов

$(if [ ${#AVAILABLE_PORTS[@]} -ge 2 ]; then
    echo "**Доступные порты**: ${AVAILABLE_PORTS[*]}"
    echo "- API Gateway: ${AVAILABLE_PORTS[0]}"
    echo "- Ozon Manager: ${AVAILABLE_PORTS[1]}"
else
    echo "**Внимание**: Мало свободных портов"
    echo "- Рассмотрите использование одного порта с разными путями"
fi)

### 3. Конфигурация веб-сервера

$(if [ "$WEB_SERVER" = "nginx" ]; then
    echo "**Nginx конфигурация**:"
    echo "- Создать location блоки"
    echo "- Настроить proxy_pass"
    echo "- Добавить WebSocket поддержку"
else
    echo "**Apache конфигурация**:"
    echo "- Создать .htaccess файл"
    echo "- Настроить mod_proxy"
    echo "- Добавить CORS заголовки"
fi)

## Следующие шаги

1. Выполнить команды из \`deploy/SERVER_ADAPTATION_GUIDE.md\`
2. Настроить переменные окружения
3. Запустить микросервисы через PM2
4. Протестировать доступность

## Файлы для создания

$(if [ "$WEB_SERVER" = "nginx" ]; then
    echo "- \`/etc/nginx/sites-available/app.boss-ai.online\`"
    echo "- \`/etc/nginx/sites-available/boss-ai.online\` (если подпапка)"
else
    echo "- \`/var/www/html/boss-ai/.htaccess\`"
    echo "- \`/etc/apache2/sites-available/app.boss-ai.online.conf\`"
fi)

EOF

# 10. Создание чеклиста
log "10. Создание чеклиста развертывания..."

cat > deployment-checklist.md << EOF
# ✅ Чеклист развертывания Boss AI Platform

## Предварительная подготовка

- [ ] Исследование сервера завершено
- [ ] Определена стратегия развертывания
- [ ] Выбраны свободные порты
- [ ] Подготовлены конфигурационные файлы

## Настройка окружения

- [ ] Node.js установлен ($NODE_VERSION)
- [ ] npm установлен ($NPM_VERSION)
- [ ] PM2 установлен ($PM2_VERSION)
- [ ] Создана директория /var/www/boss-ai
- [ ] Установлены права доступа

## Развертывание приложения

- [ ] Код загружен в /var/www/boss-ai
- [ ] Зависимости установлены (npm run install:all)
- [ ] Frontend собран (npm run build)
- [ ] Переменные окружения настроены
- [ ] PM2 конфигурация создана

## Настройка веб-сервера

$(if [ "$WEB_SERVER" = "nginx" ]; then
    echo "- [ ] Nginx конфигурация создана"
    echo "- [ ] Сайт активирован (ln -s sites-available sites-enabled)"
    echo "- [ ] Nginx конфигурация проверена (nginx -t)"
    echo "- [ ] Nginx перезагружен (systemctl reload nginx)"
else
    echo "- [ ] Apache конфигурация создана"
    echo "- [ ] mod_proxy активирован (a2enmod proxy)"
    echo "- [ ] Сайт активирован (a2ensite)"
    echo "- [ ] Apache перезагружен (systemctl reload apache2)"
fi)

## Запуск сервисов

- [ ] PM2 приложения запущены (pm2 start)
- [ ] PM2 автозапуск настроен (pm2 startup)
- [ ] Конфигурация сохранена (pm2 save)

## Тестирование

- [ ] API доступен (curl /api/health)
- [ ] Frontend загружается
- [ ] Telegram авторизация работает
- [ ] WebSocket соединения работают

## SSL (если поддомен)

$(if [ ${#SSL_DOMAINS[@]} -gt 0 ]; then
    echo "- [ ] DNS A-запись добавлена (app.boss-ai.online)"
    echo "- [ ] SSL сертификат расширен (certbot --expand)"
    echo "- [ ] HTTPS работает"
else
    echo "- [ ] SSL сертификат создан (certbot)"
    echo "- [ ] HTTPS настроен"
fi)

EOF

# Завершение
success "Исследование завершено!"

echo ""
echo "📁 Результаты сохранены в:"
echo "  - /tmp/boss-ai-investigation/server-config.json"
echo "  - /tmp/boss-ai-investigation/recommendations.md"
echo "  - /tmp/boss-ai-investigation/deployment-checklist.md"
echo ""

echo "🎯 Рекомендуемая стратегия:"
if [ ${#SSL_DOMAINS[@]} -gt 0 ]; then
    echo "  Поддомен (app.boss-ai.online) с существующим SSL"
else
    echo "  Подпапка (boss-ai.online/app/) без SSL"
fi

echo ""
echo "📋 Следующие шаги:"
echo "  1. Изучить recommendations.md"
echo "  2. Следовать deployment-checklist.md"
echo "  3. Использовать deploy/SERVER_ADAPTATION_GUIDE.md"
echo ""

log "Исследование сервера завершено успешно! 🚀"
