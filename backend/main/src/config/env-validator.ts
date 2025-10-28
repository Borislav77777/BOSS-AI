/**
 * Boss AI Platform - Environment Variables Validator
 * Валидация обязательных переменных окружения при старте приложения
 */

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DB_PATH: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  OZON_MANAGER_URL: string;
  AI_SERVICES_URL?: string;
}

interface ValidationError {
  variable: string;
  message: string;
}

/**
 * Валидатор переменных окружения
 */
export class EnvValidator {
  private errors: ValidationError[] = [];

  /**
   * Валидирует все обязательные переменные окружения
   */
  validate(): EnvConfig {
    this.errors = [];

    const config: EnvConfig = {
      NODE_ENV: this.validateString("NODE_ENV", process.env.NODE_ENV, [
        "development",
        "production",
        "test",
      ]),
      PORT: this.validateNumber("PORT", process.env.PORT, 3000),
      DB_PATH: this.validateString(
        "DB_PATH",
        process.env.DB_PATH,
        undefined,
        "./data/boss_ai.db"
      ),
      CORS_ORIGIN: this.validateString("CORS_ORIGIN", process.env.CORS_ORIGIN),
      LOG_LEVEL: this.validateString(
        "LOG_LEVEL",
        process.env.LOG_LEVEL,
        ["error", "warn", "info", "debug"],
        "info"
      ),
      JWT_SECRET: this.validateString("JWT_SECRET", process.env.JWT_SECRET),
      JWT_EXPIRES_IN: this.validateString(
        "JWT_EXPIRES_IN",
        process.env.JWT_EXPIRES_IN,
        undefined,
        "30d"
      ),
      OZON_MANAGER_URL: this.validateString(
        "OZON_MANAGER_URL",
        process.env.OZON_MANAGER_URL,
        undefined,
        "http://localhost:4200"
      ),
      AI_SERVICES_URL: this.validateString(
        "AI_SERVICES_URL",
        process.env.AI_SERVICES_URL,
        undefined,
        undefined,
        true
      ),
    };

    if (this.errors.length > 0) {
      this.logErrors();
      throw new Error("Environment validation failed");
    }

    return config;
  }

  /**
   * Валидация строковой переменной
   */
  private validateString(
    name: string,
    value: string | undefined,
    allowedValues?: string[],
    defaultValue?: string,
    optional: boolean = false
  ): string {
    if (!value) {
      if (defaultValue) {
        return defaultValue;
      }
      if (optional) {
        return "";
      }
      this.errors.push({
        variable: name,
        message: `Required environment variable ${name} is not set`,
      });
      return "";
    }

    if (allowedValues && !allowedValues.includes(value)) {
      this.errors.push({
        variable: name,
        message: `Invalid value for ${name}: ${value}. Allowed values: ${allowedValues.join(
          ", "
        )}`,
      });
    }

    return value;
  }

  /**
   * Валидация числовой переменной
   */
  private validateNumber(
    name: string,
    value: string | undefined,
    defaultValue: number
  ): number {
    if (!value) {
      return defaultValue;
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      this.errors.push({
        variable: name,
        message: `Invalid number for ${name}: ${value}`,
      });
      return defaultValue;
    }

    return numValue;
  }

  /**
   * Логирование ошибок валидации
   */
  private logErrors(): void {
    console.error("❌ Environment validation errors:");
    this.errors.forEach((error) => {
      console.error(`  - ${error.variable}: ${error.message}`);
    });
    console.error(
      "\n💡 Please check your environment variables and try again."
    );
    console.error("📖 See .env.example for required variables.");
  }

  /**
   * Получить список ошибок
   */
  getErrors(): ValidationError[] {
    return this.errors;
  }

  /**
   * Проверка, есть ли ошибки
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}

/**
 * Создание и валидация конфигурации
 */
export function validateEnvironment(): EnvConfig {
  const validator = new EnvValidator();
  return validator.validate();
}

/**
 * Проверка безопасности секретов
 */
export function validateSecrets(): void {
  const secrets = ["JWT_SECRET", "TELEGRAM_BOT_TOKEN", "OZON_API_KEY"];

  const weakSecrets: string[] = [];

  secrets.forEach((secret) => {
    const value = process.env[secret];
    if (value) {
      // Проверка на слабые секреты
      if (value.length < 32) {
        weakSecrets.push(secret);
      }

      // Проверка на placeholder значения
      if (
        value.includes("your_") ||
        value.includes("placeholder") ||
        value === "secret"
      ) {
        weakSecrets.push(secret);
      }
    }
  });

  if (weakSecrets.length > 0) {
    console.warn("⚠️  WARNING: Weak or placeholder secrets detected:");
    weakSecrets.forEach((secret) => {
      console.warn(`  - ${secret}: Please use a strong, unique value`);
    });
    console.warn(
      "🔒 Security recommendation: Use strong, randomly generated secrets"
    );
  }
}

export default validateEnvironment;
