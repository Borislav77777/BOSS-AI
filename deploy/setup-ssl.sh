#!/bin/bash

# 🔒 Скрипт автоматической установки SSL сертификата
# Поддержка: standalone, webroot, DNS challenge
# Автоконфигурация для Nginx/Apache

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функции для логирования
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

# Параметры по умолчанию
DOMAIN=""
EMAIL=""
METHOD="auto"
WEBROOT_PATH=""
DNS_PROVIDER=""
DRY_RUN=false
FORCE=false

# Обработка аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain|-d)
            DOMAIN="$2"
            shift 2
            ;;
        --email|-e)
            EMAIL="$2"
            shift 2
            ;;
        --method|-m)
            METHOD="$2"
            shift 2
            ;;
        --webroot|-w)
            WEBROOT_PATH="$2"
            shift 2
            ;;
        --dns-provider|-p)
            DNS_PROVIDER="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force|-f)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo "Использование: $0 [опции]"
            echo "Опции:"
            echo "  --domain, -d DOMAIN     Домен для сертификата (обязательно)"
            echo "  --email, -e EMAIL       Email для Let's Encrypt (обязательно)"
            echo "  --method, -m METHOD     Метод получения (auto|standalone|webroot|dns)"
            echo "  --webroot, -w PATH      Путь к webroot для webroot метода"
            echo "  --dns-provider, -p DNS  DNS провайдер для DNS challenge"
            echo "  --dry-run               Показать что будет сделано без выполнения"
            echo "  --force, -f             Принудительное обновление"
            echo "  --help, -h              Показать справку"
            exit 0
            ;;
        *)
            error "Неизвестный параметр: $1"
            exit 1
            ;;
    esac
done

# Проверка обязательных параметров
if [ -z "$DOMAIN" ]; then
    error "Домен не указан. Используйте --domain"
    exit 1
fi

if [ -z "$EMAIL" ]; then
    error "Email не указан. Используйте --email"
    exit 1
fi

# Функция для проверки доступности порта
check_port() {
    local port="$1"
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        return 0
    else
        return 1
    fi
}

# Функция для определения веб-сервера
detect_web_server() {
    if pgrep nginx > /dev/null; then
        echo "nginx"
    elif pgrep apache2 > /dev/null; then
        echo "apache2"
    else
        echo "none"
    fi
}

# Функция для остановки веб-сервера
stop_web_server() {
    local server="$1"
    if [ "$server" = "nginx" ]; then
        log "Останавливаем Nginx..."
        if [ "$DRY_RUN" = false ]; then
            systemctl stop nginx
        fi
    elif [ "$server" = "apache2" ]; then
        log "Останавливаем Apache2..."
        if [ "$DRY_RUN" = false ]; then
            systemctl stop apache2
        fi
    fi
}

# Функция для запуска веб-сервера
start_web_server() {
    local server="$1"
    if [ "$server" = "nginx" ]; then
        log "Запускаем Nginx..."
        if [ "$DRY_RUN" = false ]; then
            systemctl start nginx
        fi
    elif [ "$server" = "apache2" ]; then
        log "Запускаем Apache2..."
        if [ "$DRY_RUN" = false ]; then
            systemctl start apache2
        fi
    fi
}

# Функция для установки Certbot
install_certbot() {
    log "Установка Certbot..."

    if command -v certbot &> /dev/null; then
        success "Certbot уже установлен"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: Установка Certbot"
        return 0
    fi

    # Определение дистрибутива
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt update
        apt install -y certbot python3-certbot-nginx python3-certbot-apache
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        yum install -y certbot python3-certbot-nginx python3-certbot-apache
    elif [ -f /etc/arch-release ]; then
        # Arch Linux
        pacman -S --noconfirm certbot certbot-nginx certbot-apache
    else
        error "Неподдерживаемый дистрибутив"
        exit 1
    fi

    success "Certbot установлен"
}

# Функция для получения сертификата standalone
get_certificate_standalone() {
    log "Получение сертификата standalone методом..."

    local cmd="certbot certonly --standalone --non-interactive --agree-tos --email $EMAIL -d $DOMAIN"

    if [ "$FORCE" = true ]; then
        cmd="$cmd --force-renewal"
    fi

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: $cmd"
        return 0
    fi

    eval "$cmd"
}

# Функция для получения сертификата webroot
get_certificate_webroot() {
    log "Получение сертификата webroot методом..."

    if [ -z "$WEBROOT_PATH" ]; then
        # Автоматическое определение webroot
        if [ -d "/var/www/html" ]; then
            WEBROOT_PATH="/var/www/html"
        elif [ -d "/var/www" ]; then
            WEBROOT_PATH="/var/www"
        else
            error "Не удалось определить webroot. Укажите --webroot"
            exit 1
        fi
    fi

    log "Используем webroot: $WEBROOT_PATH"

    local cmd="certbot certonly --webroot --non-interactive --agree-tos --email $EMAIL -d $DOMAIN -w $WEBROOT_PATH"

    if [ "$FORCE" = true ]; then
        cmd="$cmd --force-renewal"
    fi

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: $cmd"
        return 0
    fi

    eval "$cmd"
}

# Функция для получения сертификата DNS
get_certificate_dns() {
    log "Получение сертификата DNS методом..."

    if [ -z "$DNS_PROVIDER" ]; then
        error "DNS провайдер не указан. Используйте --dns-provider"
        exit 1
    fi

    local cmd="certbot certonly --dns-$DNS_PROVIDER --non-interactive --agree-tos --email $EMAIL -d $DOMAIN"

    if [ "$FORCE" = true ]; then
        cmd="$cmd --force-renewal"
    fi

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: $cmd"
        return 0
    fi

    eval "$cmd"
}

# Функция для настройки автообновления
setup_auto_renewal() {
    log "Настройка автообновления сертификата..."

    if [ "$DRY_RUN" = true ]; then
        log "DRY RUN: Настройка cron для автообновления"
        return 0
    fi

    # Добавление cron задачи
    local cron_job="0 12 * * * /usr/bin/certbot renew --quiet"

    # Проверка существования задачи
    if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
        success "Cron задача добавлена"
    else
        success "Cron задача уже существует"
    fi
}

# Функция для проверки сертификата
verify_certificate() {
    local cert_path="/etc/letsencrypt/live/$DOMAIN"

    if [ ! -d "$cert_path" ]; then
        error "Сертификат не найден: $cert_path"
        return 1
    fi

    if [ ! -f "$cert_path/fullchain.pem" ]; then
        error "Файл fullchain.pem не найден"
        return 1
    fi

    if [ ! -f "$cert_path/privkey.pem" ]; then
        error "Файл privkey.pem не найден"
        return 1
    fi

    success "Сертификат найден: $cert_path"

    # Проверка срока действия
    local expiry_date=$(openssl x509 -enddate -noout -in "$cert_path/fullchain.pem" | cut -d= -f2)
    log "Сертификат действителен до: $expiry_date"

    return 0
}

# Функция для настройки веб-сервера
configure_web_server() {
    local server="$1"
    local cert_path="/etc/letsencrypt/live/$DOMAIN"

    if [ "$server" = "nginx" ]; then
        log "Настройка Nginx для SSL..."

        if [ "$DRY_RUN" = true ]; then
            log "DRY RUN: Создание конфигурации Nginx"
            return 0
        fi

        # Создание конфигурации SSL
        cat > "/etc/nginx/sites-available/$DOMAIN" << EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate $cert_path/fullchain.pem;
    ssl_certificate_key $cert_path/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        root /var/www/html;
        try_files \$uri \$uri/ =404;
    }
}
EOF

        # Активация сайта
        ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/"
        nginx -t && systemctl reload nginx

    elif [ "$server" = "apache2" ]; then
        log "Настройка Apache для SSL..."

        if [ "$DRY_RUN" = true ]; then
            log "DRY RUN: Создание конфигурации Apache"
            return 0
        fi

        # Создание конфигурации SSL
        cat > "/etc/apache2/sites-available/$DOMAIN.conf" << EOF
<VirtualHost *:80>
    ServerName $DOMAIN
    Redirect permanent / https://$DOMAIN/
</VirtualHost>

<VirtualHost *:443>
    ServerName $DOMAIN
    DocumentRoot /var/www/html

    SSLEngine on
    SSLCertificateFile $cert_path/fullchain.pem
    SSLCertificateKeyFile $cert_path/privkey.pem

    <Directory "/var/www/html">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
EOF

        # Активация модулей и сайта
        a2enmod ssl
        a2enmod rewrite
        a2ensite "$DOMAIN"
        apache2ctl configtest && systemctl reload apache2
    fi
}

# Основная логика
main() {
    log "🔒 Начинаем установку SSL сертификата для $DOMAIN"

    # Установка Certbot
    install_certbot

    # Определение веб-сервера
    local web_server=$(detect_web_server)
    log "Обнаружен веб-сервер: $web_server"

    # Автоматический выбор метода
    if [ "$METHOD" = "auto" ]; then
        if check_port 80; then
            if [ "$web_server" != "none" ]; then
                METHOD="webroot"
                log "Выбран webroot метод (веб-сервер запущен)"
            else
                METHOD="standalone"
                log "Выбран standalone метод (порт 80 свободен)"
            fi
        else
            METHOD="standalone"
            log "Выбран standalone метод (порт 80 свободен)"
        fi
    fi

    log "Используем метод: $METHOD"

    # Получение сертификата
    case "$METHOD" in
        "standalone")
            if [ "$web_server" != "none" ]; then
                stop_web_server "$web_server"
            fi
            get_certificate_standalone
            if [ "$web_server" != "none" ]; then
                start_web_server "$web_server"
            fi
            ;;
        "webroot")
            get_certificate_webroot
            ;;
        "dns")
            get_certificate_dns
            ;;
        *)
            error "Неизвестный метод: $METHOD"
            exit 1
            ;;
    esac

    # Проверка сертификата
    if verify_certificate; then
        success "SSL сертификат успешно получен!"
    else
        error "Ошибка при получении сертификата"
        exit 1
    fi

    # Настройка веб-сервера
    if [ "$web_server" != "none" ]; then
        configure_web_server "$web_server"
    fi

    # Настройка автообновления
    setup_auto_renewal

    success "🎉 SSL сертификат для $DOMAIN успешно настроен!"

    # Показать информацию о сертификате
    log "Информация о сертификате:"
    log "  Домен: $DOMAIN"
    log "  Путь: /etc/letsencrypt/live/$DOMAIN"
    log "  Автообновление: настроено"

    if [ "$web_server" != "none" ]; then
        log "  Веб-сервер: $web_server (настроен)"
    fi
}

# Запуск
main "$@"
