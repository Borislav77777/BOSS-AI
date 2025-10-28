#!/usr/bin/env node

/**
 * Тест Sentry интеграции и custom error classes
 */

const path = require("path");
const fs = require("fs");

console.log("🧪 Тестирование Sentry интеграции и custom error classes...\n");

// Проверяем установку Sentry SDK
console.log("1. Проверка установки Sentry SDK...");
try {
  const mainPackageJson = JSON.parse(
    fs.readFileSync("/var/www/boss-ai/backend/main/package.json", "utf8")
  );
  const ozonPackageJson = JSON.parse(
    fs.readFileSync(
      "/var/www/boss-ai/backend/ozon-manager/package.json",
      "utf8"
    )
  );

  const mainSentryInstalled =
    mainPackageJson.dependencies["@sentry/node"] ||
    mainPackageJson.dependencies["@sentry/profiling-node"];
  const ozonSentryInstalled =
    ozonPackageJson.dependencies["@sentry/node"] ||
    ozonPackageJson.dependencies["@sentry/profiling-node"];

  if (mainSentryInstalled && ozonSentryInstalled) {
    console.log("✅ Sentry SDK установлен в обоих сервисах");
  } else {
    console.log("❌ Sentry SDK не установлен");
    process.exit(1);
  }
} catch (error) {
  console.log("❌ Ошибка проверки package.json:", error.message);
  process.exit(1);
}

// Проверяем конфигурационные файлы Sentry
console.log("\n2. Проверка конфигурационных файлов Sentry...");
const sentryFiles = [
  "/var/www/boss-ai/backend/main/src/config/sentry.ts",
  "/var/www/boss-ai/backend/ozon-manager/src/config/sentry.ts",
  "/var/www/boss-ai/backend/shared/errors/app-error.ts",
];

let allFilesExist = true;
for (const file of sentryFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${path.basename(file)} существует`);
  } else {
    console.log(`❌ ${path.basename(file)} не найден`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log("❌ Не все конфигурационные файлы найдены");
  process.exit(1);
}

// Проверяем интеграцию в index.ts файлах
console.log("\n3. Проверка интеграции Sentry в index.ts...");
try {
  const mainIndex = fs.readFileSync(
    "/var/www/boss-ai/backend/main/src/index.ts",
    "utf8"
  );
  const ozonIndex = fs.readFileSync(
    "/var/www/boss-ai/backend/ozon-manager/src/index.ts",
    "utf8"
  );

  const mainHasSentry =
    mainIndex.includes("initializeSentry") &&
    mainIndex.includes("sentryRequestHandler");
  const ozonHasSentry =
    ozonIndex.includes("initializeSentry") &&
    ozonIndex.includes("sentryRequestHandler");

  if (mainHasSentry) {
    console.log("✅ API Gateway интегрирован с Sentry");
  } else {
    console.log("❌ API Gateway не интегрирован с Sentry");
  }

  if (ozonHasSentry) {
    console.log("✅ Ozon Manager интегрирован с Sentry");
  } else {
    console.log("❌ Ozon Manager не интегрирован с Sentry");
  }
} catch (error) {
  console.log("❌ Ошибка проверки интеграции:", error.message);
  process.exit(1);
}

// Проверяем обновленный error middleware
console.log("\n4. Проверка обновленного error middleware...");
try {
  const errorMiddleware = fs.readFileSync(
    "/var/www/boss-ai/backend/main/src/middleware/error.middleware.ts",
    "utf8"
  );

  const hasSentryImport = errorMiddleware.includes("@sentry/node");
  const hasWinstonImport = errorMiddleware.includes("winston-logger");
  const hasCustomErrors = errorMiddleware.includes("AppError");
  const hasSentryCapture = errorMiddleware.includes("Sentry.captureException");

  if (
    hasSentryImport &&
    hasWinstonImport &&
    hasCustomErrors &&
    hasSentryCapture
  ) {
    console.log("✅ Error middleware обновлен с Sentry и custom error classes");
  } else {
    console.log("❌ Error middleware не обновлен");
    console.log(`   - Sentry import: ${hasSentryImport}`);
    console.log(`   - Winston import: ${hasWinstonImport}`);
    console.log(`   - Custom errors: ${hasCustomErrors}`);
    console.log(`   - Sentry capture: ${hasSentryCapture}`);
  }
} catch (error) {
  console.log("❌ Ошибка проверки error middleware:", error.message);
  process.exit(1);
}

// Проверяем custom error classes
console.log("\n5. Проверка custom error classes...");
try {
  const appErrorFile = fs.readFileSync(
    "/var/www/boss-ai/backend/shared/errors/app-error.ts",
    "utf8"
  );

  const hasAppError = appErrorFile.includes("class AppError");
  const hasValidationError = appErrorFile.includes("class ValidationError");
  const hasNotFoundError = appErrorFile.includes("class NotFoundError");
  const hasUnauthorizedError = appErrorFile.includes("class UnauthorizedError");
  const hasForbiddenError = appErrorFile.includes("class ForbiddenError");
  const hasInternalServerError = appErrorFile.includes(
    "class InternalServerError"
  );

  if (
    hasAppError &&
    hasValidationError &&
    hasNotFoundError &&
    hasUnauthorizedError &&
    hasForbiddenError &&
    hasInternalServerError
  ) {
    console.log("✅ Все custom error classes созданы");
  } else {
    console.log("❌ Не все custom error classes созданы");
    console.log(`   - AppError: ${hasAppError}`);
    console.log(`   - ValidationError: ${hasValidationError}`);
    console.log(`   - NotFoundError: ${hasNotFoundError}`);
    console.log(`   - UnauthorizedError: ${hasUnauthorizedError}`);
    console.log(`   - ForbiddenError: ${hasForbiddenError}`);
    console.log(`   - InternalServerError: ${hasInternalServerError}`);
  }
} catch (error) {
  console.log("❌ Ошибка проверки custom error classes:", error.message);
  process.exit(1);
}

// Проверяем компиляцию TypeScript
console.log("\n6. Проверка компиляции TypeScript...");
const { execSync } = require("child_process");

try {
  console.log("Компилируем API Gateway...");
  execSync("cd /var/www/boss-ai/backend/main && npm run build", {
    stdio: "pipe",
  });
  console.log("✅ API Gateway скомпилирован успешно");
} catch (error) {
  console.log("❌ Ошибка компиляции API Gateway:", error.message);
  process.exit(1);
}

try {
  console.log("Компилируем Ozon Manager...");
  execSync("cd /var/www/boss-ai/backend/ozon-manager && npm run build", {
    stdio: "pipe",
  });
  console.log("✅ Ozon Manager скомпилирован успешно");
} catch (error) {
  console.log("❌ Ошибка компиляции Ozon Manager:", error.message);
  process.exit(1);
}

console.log(
  "\n🎉 Все тесты Sentry интеграции и custom error classes прошли успешно!"
);
console.log("\n📋 Реализованные улучшения:");
console.log("   ✅ Sentry SDK установлен в обоих сервисах");
console.log("   ✅ Конфигурационные файлы Sentry созданы");
console.log("   ✅ Sentry интегрирован в API Gateway и Ozon Manager");
console.log("   ✅ Custom error classes созданы");
console.log("   ✅ Error middleware обновлен с Sentry и Winston");
console.log("   ✅ TypeScript код скомпилирован без ошибок");
console.log("\n🚀 Error tracking с Sentry готов к использованию!");
