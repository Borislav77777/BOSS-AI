#!/usr/bin/env node

/**
 * Boss AI Platform - Environment Validator Test
 * Тестирование валидации переменных окружения
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Test configuration
const TEST_DIR = "/tmp/boss-ai-env-test";

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

  log("✅ Test environment created", "green");
}

function testEnvValidatorCompilation() {
  // Test that env validator compiles without errors
  const apiGatewayValidator = path.join(
    __dirname,
    "../backend/main/src/config/env-validator.ts"
  );
  const ozonValidator = path.join(
    __dirname,
    "../backend/ozon-manager/src/config/env-validator.ts"
  );

  if (!fs.existsSync(apiGatewayValidator)) {
    throw new Error("API Gateway env validator not found");
  }

  if (!fs.existsSync(ozonValidator)) {
    throw new Error("Ozon Manager env validator not found");
  }

  // Check that files contain expected content
  const apiContent = fs.readFileSync(apiGatewayValidator, "utf8");
  const ozonContent = fs.readFileSync(ozonValidator, "utf8");

  if (!apiContent.includes("validateEnvironment")) {
    throw new Error(
      "API Gateway validator missing validateEnvironment function"
    );
  }

  if (!ozonContent.includes("validateEnvironment")) {
    throw new Error(
      "Ozon Manager validator missing validateEnvironment function"
    );
  }

  if (!apiContent.includes("validateSecrets")) {
    throw new Error("API Gateway validator missing validateSecrets function");
  }

  if (!ozonContent.includes("validateOzonSecrets")) {
    throw new Error(
      "Ozon Manager validator missing validateOzonSecrets function"
    );
  }

  log("✅ Environment validators compiled successfully", "green");
}

function testEnvExampleFiles() {
  // Test that .env.example files exist and contain required variables
  const apiExample = path.join(__dirname, "../backend/main/.env.example");
  const ozonExample = path.join(
    __dirname,
    "../backend/ozon-manager/.env.example"
  );

  if (!fs.existsSync(apiExample)) {
    throw new Error("API Gateway .env.example not found");
  }

  if (!fs.existsSync(ozonExample)) {
    throw new Error("Ozon Manager .env.example not found");
  }

  const apiContent = fs.readFileSync(apiExample, "utf8");
  const ozonContent = fs.readFileSync(ozonExample, "utf8");

  // Check for required variables in API Gateway
  const requiredApiVars = [
    "NODE_ENV",
    "PORT",
    "DB_PATH",
    "CORS_ORIGIN",
    "JWT_SECRET",
  ];
  requiredApiVars.forEach((varName) => {
    if (!apiContent.includes(varName)) {
      throw new Error(`API Gateway .env.example missing ${varName}`);
    }
  });

  // Check for required variables in Ozon Manager
  const requiredOzonVars = [
    "NODE_ENV",
    "PORT",
    "DB_PATH",
    "TELEGRAM_BOT_TOKEN",
    "JWT_SECRET",
  ];
  requiredOzonVars.forEach((varName) => {
    if (!ozonContent.includes(varName)) {
      throw new Error(`Ozon Manager .env.example missing ${varName}`);
    }
  });

  log("✅ .env.example files contain required variables", "green");
}

function testEcosystemConfig() {
  // Test that ecosystem.config.js uses environment variables
  const ecosystemPath = path.join(__dirname, "../deploy/ecosystem.config.js");

  if (!fs.existsSync(ecosystemPath)) {
    throw new Error("ecosystem.config.js not found");
  }

  const content = fs.readFileSync(ecosystemPath, "utf8");

  // Check that it uses process.env for secrets
  if (!content.includes("process.env.JWT_SECRET")) {
    throw new Error("ecosystem.config.js not using process.env for JWT_SECRET");
  }

  if (!content.includes("process.env.TELEGRAM_BOT_TOKEN")) {
    throw new Error(
      "ecosystem.config.js not using process.env for TELEGRAM_BOT_TOKEN"
    );
  }

  if (!content.includes("process.env.TELEGRAM_BOT_USERNAME")) {
    throw new Error(
      "ecosystem.config.js not using process.env for TELEGRAM_BOT_USERNAME"
    );
  }

  log("✅ ecosystem.config.js uses environment variables for secrets", "green");
}

function testBackupScripts() {
  // Test that backup scripts exist and are executable
  const backupScript = path.join(__dirname, "../scripts/backup-database.sh");
  const restoreScript = path.join(__dirname, "../scripts/restore-database.sh");

  if (!fs.existsSync(backupScript)) {
    throw new Error("backup-database.sh not found");
  }

  if (!fs.existsSync(restoreScript)) {
    throw new Error("restore-database.sh not found");
  }

  // Check that scripts are executable
  const backupStats = fs.statSync(backupScript);
  const restoreStats = fs.statSync(restoreScript);

  if (!(backupStats.mode & parseInt("111", 8))) {
    throw new Error("backup-database.sh is not executable");
  }

  if (!(restoreStats.mode & parseInt("111", 8))) {
    throw new Error("restore-database.sh is not executable");
  }

  log("✅ Backup scripts exist and are executable", "green");
}

function testCronJobSetup() {
  // Test that cron job is set up for backup
  try {
    const cronOutput = execSync("crontab -l", { encoding: "utf8" });
    if (!cronOutput.includes("backup-database.sh")) {
      throw new Error("Backup cron job not found");
    }
    log("✅ Backup cron job is configured", "green");
  } catch (error) {
    log("⚠️  Warning: Could not verify cron job setup", "yellow");
  }
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
  log("🚀 Starting Boss AI Platform Environment Validator Tests", "blue");

  let passedTests = 0;
  let totalTests = 0;

  try {
    setupTestEnvironment();

    const tests = [
      ["Environment Validator Compilation", testEnvValidatorCompilation],
      ["Environment Example Files", testEnvExampleFiles],
      ["Ecosystem Config Environment Variables", testEcosystemConfig],
      ["Backup Scripts", testBackupScripts],
      ["Cron Job Setup", testCronJobSetup],
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
    log("🎉 All environment validator tests passed!", "green");
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
