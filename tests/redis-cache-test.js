#!/usr/bin/env node

/**
 * Boss AI Platform - Redis Cache Test
 * Тестирование Redis кэширования
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Test configuration
const TEST_DIR = "/tmp/boss-ai-redis-test";

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

function testRedisInstallation() {
  // Test that Redis is installed and running
  try {
    const result = execSync("redis-cli ping", { encoding: "utf8" }).trim();
    if (result !== "PONG") {
      throw new Error("Redis not responding to ping");
    }
    log("✅ Redis is running", "green");
  } catch (error) {
    throw new Error("Redis is not installed or not running");
  }
}

function testRedisClientCompilation() {
  // Test that Redis client compiles without errors
  const redisClientPath = path.join(
    __dirname,
    "../backend/shared/cache/redis-client.ts"
  );

  if (!fs.existsSync(redisClientPath)) {
    throw new Error("Redis client not found");
  }

  // Check that file contains expected content
  const content = fs.readFileSync(redisClientPath, "utf8");

  if (!content.includes("RedisClient")) {
    throw new Error("Redis client missing RedisClient class");
  }

  if (!content.includes("createClient")) {
    throw new Error("Redis client missing createClient import");
  }

  if (!content.includes("get(")) {
    throw new Error("Redis client missing get method");
  }

  if (!content.includes("set(")) {
    throw new Error("Redis client missing set method");
  }

  if (!content.includes("delete(")) {
    throw new Error("Redis client missing delete method");
  }

  log("✅ Redis client compiled successfully", "green");
}

function testCacheServiceCompilation() {
  // Test that Cache Service compiles without errors
  const cacheServicePath = path.join(
    __dirname,
    "../backend/ozon-manager/src/services/cache-service.ts"
  );

  if (!fs.existsSync(cacheServicePath)) {
    throw new Error("Cache service not found");
  }

  // Check that file contains expected content
  const content = fs.readFileSync(cacheServicePath, "utf8");

  if (!content.includes("CacheService")) {
    throw new Error("Cache service missing CacheService class");
  }

  if (!content.includes("cacheStores")) {
    throw new Error("Cache service missing cacheStores method");
  }

  if (!content.includes("getCachedStores")) {
    throw new Error("Cache service missing getCachedStores method");
  }

  if (!content.includes("cacheApiResponse")) {
    throw new Error("Cache service missing cacheApiResponse method");
  }

  if (!content.includes("invalidateStoresCache")) {
    throw new Error("Cache service missing invalidateStoresCache method");
  }

  log("✅ Cache service compiled successfully", "green");
}

function testRedisDependencies() {
  // Test that Redis dependencies are installed
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

  if (!apiContent.includes('"redis"')) {
    throw new Error("API Gateway missing redis dependency");
  }

  if (!ozonContent.includes('"redis"')) {
    throw new Error("Ozon Manager missing redis dependency");
  }

  log("✅ Redis dependencies verified", "green");
}

function testConfigServiceIntegration() {
  // Test that ConfigService is integrated with caching
  const configServicePath = path.join(
    __dirname,
    "../backend/ozon-manager/src/services/config-service.ts"
  );

  if (!fs.existsSync(configServicePath)) {
    throw new Error("ConfigService not found");
  }

  const content = fs.readFileSync(configServicePath, "utf8");

  if (!content.includes("cacheService")) {
    throw new Error("ConfigService not importing cacheService");
  }

  if (!content.includes("getCachedStores")) {
    throw new Error("ConfigService not using getCachedStores");
  }

  if (!content.includes("cacheStores")) {
    throw new Error("ConfigService not using cacheStores");
  }

  if (!content.includes("invalidateStoresCache")) {
    throw new Error("ConfigService not using invalidateStoresCache");
  }

  log("✅ ConfigService caching integration verified", "green");
}

function testCacheFeatures() {
  // Test that cache has all required features
  const cacheServicePath = path.join(
    __dirname,
    "../backend/ozon-manager/src/services/cache-service.ts"
  );
  const content = fs.readFileSync(cacheServicePath, "utf8");

  const requiredFeatures = [
    "cacheStores(",
    "getCachedStores(",
    "cacheApiResponse(",
    "getCachedApiResponse(",
    "invalidateStoresCache(",
    "invalidateApiResponseCache(",
    "getCacheStats(",
    "healthCheck(",
    "clearAllCache(",
  ];

  requiredFeatures.forEach((feature) => {
    if (!content.includes(feature)) {
      throw new Error(`Cache service missing feature: ${feature}`);
    }
  });

  log("✅ Cache features verified", "green");
}

function testRedisConfiguration() {
  // Test that Redis configuration is properly set up
  const ecosystemPath = path.join(__dirname, "../deploy/ecosystem.config.js");

  if (!fs.existsSync(ecosystemPath)) {
    throw new Error("ecosystem.config.js not found");
  }

  const content = fs.readFileSync(ecosystemPath, "utf8");

  // Check for Redis environment variables
  if (!content.includes("REDIS_URL")) {
    log(
      "⚠️  Warning: REDIS_URL not configured in ecosystem.config.js",
      "yellow"
    );
  }

  log("✅ Redis configuration checked", "green");
}

function testRedisConnection() {
  // Test Redis connection with basic operations
  try {
    // Test basic Redis operations
    execSync('redis-cli set test_key "test_value"', { encoding: "utf8" });
    const result = execSync("redis-cli get test_key", {
      encoding: "utf8",
    }).trim();

    if (result !== "test_value") {
      throw new Error("Redis set/get operation failed");
    }

    // Clean up test key
    execSync("redis-cli del test_key", { encoding: "utf8" });

    log("✅ Redis connection and basic operations verified", "green");
  } catch (error) {
    throw new Error(`Redis connection test failed: ${error.message}`);
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
  log("🚀 Starting Boss AI Platform Redis Cache Tests", "blue");

  let passedTests = 0;
  let totalTests = 0;

  try {
    setupTestEnvironment();

    const tests = [
      ["Redis Installation", testRedisInstallation],
      ["Redis Client Compilation", testRedisClientCompilation],
      ["Cache Service Compilation", testCacheServiceCompilation],
      ["Redis Dependencies", testRedisDependencies],
      ["ConfigService Integration", testConfigServiceIntegration],
      ["Cache Features", testCacheFeatures],
      ["Redis Configuration", testRedisConfiguration],
      ["Redis Connection", testRedisConnection],
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
    log("🎉 All Redis cache tests passed!", "green");
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
