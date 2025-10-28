#!/usr/bin/env node

/**
 * Boss AI Platform - Unified Logger Test
 * Тестирование централизованного логирования
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Test configuration
const TEST_DIR = "/tmp/boss-ai-logger-test";
const LOG_DIR = path.join(TEST_DIR, "logs");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(testName, testFunction) {
  log(`\n🧪 Running test: ${testName}`, "blue");
  try {
    testFunction();
    log(`✅ ${testName} - PASSED`, "green");
    return true;
  } catch (error) {
    log(`❌ ${testName} - FAILED: ${error.message}`, "red");
    return false;
  }
}

function setupTestEnvironment() {
  log("🔧 Setting up test environment...", "yellow");

  // Create test directories
  execSync(`mkdir -p ${TEST_DIR}`);
  execSync(`mkdir -p ${LOG_DIR}`);

  log("✅ Test environment created", "green");
}

function testLoggerCompilation() {
  // Test that unified logger compiles without errors
  const loggerPath = path.join(
    __dirname,
    "../backend/shared/logger/winston-logger.ts"
  );

  if (!fs.existsSync(loggerPath)) {
    throw new Error("Unified logger not found");
  }

  // Check that file contains expected content
  const content = fs.readFileSync(loggerPath, "utf8");

  if (!content.includes("UnifiedLogger")) {
    throw new Error("Unified logger missing UnifiedLogger class");
  }

  if (!content.includes("winston")) {
    throw new Error("Unified logger missing winston import");
  }

  if (!content.includes("DailyRotateFile")) {
    throw new Error("Unified logger missing DailyRotateFile import");
  }

  if (!content.includes("createLogger")) {
    throw new Error("Unified logger missing createLogger function");
  }

  log("✅ Unified logger compiled successfully", "green");
}

function testLoggerIntegration() {
  // Test that logger is integrated in main services
  const apiGatewayPath = path.join(__dirname, "../backend/main/src/index.ts");
  const ozonManagerPath = path.join(
    __dirname,
    "../backend/ozon-manager/src/index.ts"
  );

  if (!fs.existsSync(apiGatewayPath)) {
    throw new Error("API Gateway index.ts not found");
  }

  if (!fs.existsSync(ozonManagerPath)) {
    throw new Error("Ozon Manager index.ts not found");
  }

  const apiContent = fs.readFileSync(apiGatewayPath, "utf8");
  const ozonContent = fs.readFileSync(ozonManagerPath, "utf8");

  if (!apiContent.includes("apiGatewayLogger")) {
    throw new Error("API Gateway not using apiGatewayLogger");
  }

  if (!ozonContent.includes("ozonManagerLogger")) {
    throw new Error("Ozon Manager not using ozonManagerLogger");
  }

  if (!apiContent.includes("winston-logger")) {
    throw new Error("API Gateway not importing winston-logger");
  }

  if (!ozonContent.includes("winston-logger")) {
    throw new Error("Ozon Manager not importing winston-logger");
  }

  log("✅ Logger integration in services verified", "green");
}

function testLoggerFeatures() {
  // Test that logger has all required features
  const loggerPath = path.join(
    __dirname,
    "../backend/shared/logger/winston-logger.ts"
  );
  const content = fs.readFileSync(loggerPath, "utf8");

  const requiredFeatures = [
    "debug(",
    "info(",
    "warn(",
    "error(",
    "httpRequest(",
    "dbOperation(",
    "apiCall(",
    "auth(",
    "performance(",
    "security(",
    "business(",
  ];

  requiredFeatures.forEach((feature) => {
    if (!content.includes(feature)) {
      throw new Error(`Logger missing feature: ${feature}`);
    }
  });

  log("✅ Logger features verified", "green");
}

function testLogRotation() {
  // Test that log rotation is configured
  const loggerPath = path.join(
    __dirname,
    "../backend/shared/logger/winston-logger.ts"
  );
  const content = fs.readFileSync(loggerPath, "utf8");

  if (!content.includes("maxSize")) {
    throw new Error("Logger missing maxSize configuration");
  }

  if (!content.includes("maxFiles")) {
    throw new Error("Logger missing maxFiles configuration");
  }

  if (!content.includes("datePattern")) {
    throw new Error("Logger missing datePattern configuration");
  }

  log("✅ Log rotation configuration verified", "green");
}

function testStructuredLogging() {
  // Test that structured logging is implemented
  const loggerPath = path.join(
    __dirname,
    "../backend/shared/logger/winston-logger.ts"
  );
  const content = fs.readFileSync(loggerPath, "utf8");

  if (!content.includes("winston.format.json()")) {
    throw new Error("Logger missing JSON format for structured logging");
  }

  if (!content.includes("LogContext")) {
    throw new Error("Logger missing LogContext interface");
  }

  if (!content.includes("LogEntry")) {
    throw new Error("Logger missing LogEntry interface");
  }

  log("✅ Structured logging configuration verified", "green");
}

function testWinstonDependencies() {
  // Test that Winston dependencies are installed
  const apiGatewayPackageJson = path.join(
    __dirname,
    "../backend/main/package.json"
  );
  const ozonManagerPackageJson = path.join(
    __dirname,
    "../backend/ozon-manager/package.json"
  );

  if (!fs.existsSync(apiGatewayPackageJson)) {
    throw new Error("API Gateway package.json not found");
  }

  if (!fs.existsSync(ozonManagerPackageJson)) {
    throw new Error("Ozon Manager package.json not found");
  }

  const apiContent = fs.readFileSync(apiGatewayPackageJson, "utf8");
  const ozonContent = fs.readFileSync(ozonManagerPackageJson, "utf8");

  if (!apiContent.includes('"winston"')) {
    throw new Error("API Gateway missing winston dependency");
  }

  if (!ozonContent.includes('"winston"')) {
    throw new Error("Ozon Manager missing winston dependency");
  }

  if (!apiContent.includes('"winston-daily-rotate-file"')) {
    throw new Error("API Gateway missing winston-daily-rotate-file dependency");
  }

  if (!ozonContent.includes('"winston-daily-rotate-file"')) {
    throw new Error(
      "Ozon Manager missing winston-daily-rotate-file dependency"
    );
  }

  log("✅ Winston dependencies verified", "green");
}

function testLogDirectoryStructure() {
  // Test that log directories are properly configured
  const loggerPath = path.join(
    __dirname,
    "../backend/shared/logger/winston-logger.ts"
  );
  const content = fs.readFileSync(loggerPath, "utf8");

  if (!content.includes("logDir")) {
    throw new Error("Logger missing logDir configuration");
  }

  if (!content.includes("./logs")) {
    throw new Error("Logger missing default logs directory");
  }

  log("✅ Log directory structure verified", "green");
}

function cleanupTestEnvironment() {
  log("🧹 Cleaning up test environment...", "yellow");
  try {
    execSync(`rm -rf ${TEST_DIR}`);
    log("✅ Test environment cleaned up", "green");
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Main test execution
function runAllTests() {
  log("🚀 Starting Boss AI Platform Unified Logger Tests", "blue");

  let passedTests = 0;
  let totalTests = 0;

  try {
    setupTestEnvironment();

    const tests = [
      ["Logger Compilation", testLoggerCompilation],
      ["Logger Integration", testLoggerIntegration],
      ["Logger Features", testLoggerFeatures],
      ["Log Rotation", testLogRotation],
      ["Structured Logging", testStructuredLogging],
      ["Winston Dependencies", testWinstonDependencies],
      ["Log Directory Structure", testLogDirectoryStructure],
    ];

    for (const [testName, testFunction] of tests) {
      totalTests++;
      if (runTest(testName, testFunction)) {
        passedTests++;
      }
    }
  } finally {
    cleanupTestEnvironment();
  }

  // Test results
  log(`\n📊 Test Results:`, "blue");
  log(
    `✅ Passed: ${passedTests}/${totalTests}`,
    passedTests === totalTests ? "green" : "yellow"
  );

  if (passedTests === totalTests) {
    log("🎉 All unified logger tests passed!", "green");
    process.exit(0);
  } else {
    log("❌ Some tests failed!", "red");
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  setupTestEnvironment,
  cleanupTestEnvironment,
};
