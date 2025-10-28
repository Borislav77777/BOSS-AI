#!/bin/bash

# Boss AI Platform Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/var/www/boss-ai"
BACKUP_DIR="/var/backups/boss-ai"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting Boss AI Platform deployment..."
echo "Environment: $ENVIRONMENT"
echo "Project directory: $PROJECT_DIR"

# Create backup
echo "📦 Creating backup..."
mkdir -p $BACKUP_DIR
if [ -d "$PROJECT_DIR" ]; then
    tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C /var/www boss-ai
    echo "✅ Backup created: backup_$DATE.tar.gz"
fi

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# Install dependencies
echo "📦 Installing dependencies..."

# Backend dependencies
echo "Installing backend dependencies..."
cd $PROJECT_DIR/backend
npm install --production

# Frontend dependencies
echo "Installing frontend dependencies..."
cd $PROJECT_DIR/frontend
npm install --production

# Build applications
echo "🔨 Building applications..."

# Build backend
echo "Building backend..."
cd $PROJECT_DIR/backend
npm run build

# Build frontend
echo "Building frontend..."
cd $PROJECT_DIR/frontend
npm run build

# Setup PM2
echo "⚙️ Setting up PM2..."
cd $PROJECT_DIR
pm2 delete boss-ai-backend 2>/dev/null || true
pm2 start deploy/ecosystem.config.js --env $ENVIRONMENT

# Setup Nginx
echo "🌐 Setting up Nginx..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/boss-ai
sudo ln -sf /etc/nginx/sites-available/boss-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL (Let's Encrypt)
echo "🔒 Setting up SSL..."
if [ "$ENVIRONMENT" = "production" ]; then
    sudo certbot --nginx -d your-domain.com -d www.your-domain.com --non-interactive --agree-tos --email admin@your-domain.com
fi

# Setup systemd service for PM2
echo "🔧 Setting up systemd service..."
pm2 startup systemd -u $USER --hp /home/$USER
pm2 save

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: https://your-domain.com"
echo "🔧 Backend API: https://your-domain.com/api"
echo "📊 PM2 Status: pm2 status"
echo "📝 Logs: pm2 logs boss-ai-backend"
