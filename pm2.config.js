module.exports = {
  apps: [
    {
      name: 'boss-ai-api-gateway',
      script: 'dist/index.js',
      cwd: '/var/www/boss-ai/backend/main',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/boss-ai/logs/api_gateway_err.log',
      out_file: '/var/www/boss-ai/logs/api_gateway_out.log',
      log_file: '/var/www/boss-ai/logs/api_gateway_combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'boss-ai-ozon-manager',
      script: 'dist/index.js',
      cwd: '/var/www/boss-ai/backend/ozon-manager',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4200
      },
      error_file: '/var/www/boss-ai/logs/ozon_manager_err.log',
      out_file: '/var/www/boss-ai/logs/ozon_manager_out.log',
      log_file: '/var/www/boss-ai/logs/ozon_manager_combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};

