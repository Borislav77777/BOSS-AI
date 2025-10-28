module.exports = {
  apps: [
    {
      name: "boss-ai-api-gateway",
      script: "./backend/main/dist/index.js",
      cwd: "/var/www/boss-ai",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DB_PATH: "./backend/main/data/boss_ai.db",
        LOG_LEVEL: "info",
        CORS_ORIGIN: "https://boss-ai.online",
        JWT_SECRET:
          process.env.JWT_SECRET ||
          "your_jwt_secret_key_here_minimum_32_characters",
        JWT_EXPIRES_IN: "30d",
        OZON_MANAGER_URL: "http://localhost:4200",
        AI_SERVICES_URL: "http://localhost:4300",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./backend/logs/api_gateway_err.log",
      out_file: "./backend/logs/api_gateway_out.log",
      log_file: "./backend/logs/api_gateway_combined.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024",
    },
    {
      name: "boss-ai-ozon-manager",
      script: "./backend/ozon-manager/dist/index.js",
      cwd: "/var/www/boss-ai",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 4200,
        DB_PATH: "./backend/ozon-manager/data/ozon_manager.db",
        LOG_LEVEL: "info",
        CORS_ORIGIN: "https://boss-ai.online",
        OZON_API_BASE_URL: "https://api-seller.ozon.ru",
        OZON_API_TIMEOUT: 30000,
        OZON_API_RATE_LIMIT: 50,
        SCHEDULER_ENABLED: "true",
        SCHEDULER_TIMEZONE: "Europe/Moscow",
        TELEGRAM_BOT_TOKEN:
          process.env.TELEGRAM_BOT_TOKEN || "your_telegram_bot_token_here",
        TELEGRAM_BOT_USERNAME:
          process.env.TELEGRAM_BOT_USERNAME || "your_bot_username_here",
        JWT_SECRET:
          process.env.JWT_SECRET ||
          "your_jwt_secret_key_here_minimum_32_characters",
        JWT_EXPIRES_IN: "30d",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4200,
      },
      error_file: "./backend/logs/ozon_manager_err.log",
      out_file: "./backend/logs/ozon_manager_out.log",
      log_file: "./backend/logs/ozon_manager_combined.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024",
    },
  ],
};
