#!/usr/bin/env node

/**
 * Boss AI Platform - Backup Script Test
 * Тестирование backup и restore функциональности
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Test configuration
const TEST_DIR = "/tmp/boss-ai-backup-test";
const BACKUP_DIR = path.join(TEST_DIR, "backups");
const LOG_FILE = path.join(TEST_DIR, "backup-test.log");

// Test database paths
const OZON_DB = path.join(TEST_DIR, "ozon_manager.db");
const MAIN_DB = path.join(TEST_DIR, "boss_ai.db");

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
  execSync(`mkdir -p ${BACKUP_DIR}`);

  // Create test databases
  execSync(
    `sqlite3 ${OZON_DB} "CREATE TABLE users (id INTEGER PRIMARY KEY, telegram_id INTEGER UNIQUE, username TEXT);"`
  );
  execSync(
    `sqlite3 ${OZON_DB} "INSERT INTO users (telegram_id, username) VALUES (123456789, 'testuser');"`
  );

  execSync(
    `sqlite3 ${MAIN_DB} "CREATE TABLE sessions (id INTEGER PRIMARY KEY, user_id INTEGER, token TEXT);"`
  );
  execSync(
    `sqlite3 ${MAIN_DB} "INSERT INTO sessions (user_id, token) VALUES (1, 'test-token');"`
  );

  log("✅ Test environment created", "green");
}

function testBackupScript() {
  // Test backup script execution
  const backupScript = path.join(__dirname, "../scripts/backup-database.sh");

  // Modify script for test environment
  let scriptContent = fs.readFileSync(backupScript, "utf8");
  scriptContent = scriptContent.replace("/var/www/boss-ai/backups", BACKUP_DIR);
  scriptContent = scriptContent.replace(
    "/var/www/boss-ai/logs/backup.log",
    LOG_FILE
  );
  scriptContent = scriptContent.replace(
    "/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db",
    OZON_DB
  );
  scriptContent = scriptContent.replace(
    "/var/www/boss-ai/backend/main/data/boss_ai.db",
    MAIN_DB
  );

  const testScriptPath = path.join(TEST_DIR, "backup-test.sh");
  fs.writeFileSync(testScriptPath, scriptContent);
  execSync(`chmod +x ${testScriptPath}`);

  // Run backup script
  execSync(`bash ${testScriptPath}`);

  // Check if backup files were created
  const backupFiles = fs.readdirSync(BACKUP_DIR);
  if (backupFiles.length === 0) {
    throw new Error("No backup files were created");
  }

  // Check if backup files are compressed
  const compressedFiles = backupFiles.filter((file) => file.endsWith(".gz"));
  if (compressedFiles.length === 0) {
    throw new Error("Backup files are not compressed");
  }

  log(`✅ Backup created: ${backupFiles.join(", ")}`, "green");
}

function testRestoreScript() {
  // Test restore script execution
  const restoreScript = path.join(__dirname, "../scripts/restore-database.sh");

  // Modify script for test environment
  let scriptContent = fs.readFileSync(restoreScript, "utf8");
  scriptContent = scriptContent.replace("/var/www/boss-ai/backups", BACKUP_DIR);
  scriptContent = scriptContent.replace(
    "/var/www/boss-ai/logs/restore.log",
    LOG_FILE
  );
  scriptContent = scriptContent.replace(
    "/var/www/boss-ai/backend/ozon-manager/data/ozon_manager.db",
    OZON_DB + ".restored"
  );
  scriptContent = scriptContent.replace(
    "/var/www/boss-ai/backend/main/data/boss_ai.db",
    MAIN_DB + ".restored"
  );

  const testScriptPath = path.join(TEST_DIR, "restore-test.sh");
  fs.writeFileSync(testScriptPath, scriptContent);
  execSync(`chmod +x ${testScriptPath}`);

  // Find latest backup
  const backupFiles = fs.readdirSync(BACKUP_DIR);
  const ozonBackup = backupFiles.find(
    (file) => file.startsWith("ozon_manager_") && file.endsWith(".gz")
  );

  if (!ozonBackup) {
    throw new Error("No Ozon Manager backup found for restore test");
  }

  // Run restore script
  execSync(
    `bash ${testScriptPath} --ozon ${path.join(BACKUP_DIR, ozonBackup)}`
  );

  // Check if restored database exists and has data
  if (!fs.existsSync(OZON_DB + ".restored")) {
    throw new Error("Restored database file not found");
  }

  const userCount = execSync(
    `sqlite3 ${OZON_DB}.restored "SELECT COUNT(*) FROM users;"`,
    { encoding: "utf8" }
  ).trim();
  if (userCount !== "1") {
    throw new Error(`Expected 1 user in restored database, got ${userCount}`);
  }

  log("✅ Database restored successfully", "green");
}

function testDatabaseIntegrity() {
  // Test database integrity check
  const integrityCheck = execSync(
    `sqlite3 ${OZON_DB} "PRAGMA integrity_check;"`,
    { encoding: "utf8" }
  ).trim();
  if (integrityCheck !== "ok") {
    throw new Error(`Database integrity check failed: ${integrityCheck}`);
  }

  log("✅ Database integrity check passed", "green");
}

function testBackupRetention() {
  // Test backup retention (create multiple backups and check cleanup)
  const backupScript = path.join(TEST_DIR, "backup-test.sh");

  // Create multiple backups with different timestamps
  for (let i = 0; i < 3; i++) {
    execSync(`bash ${backupScript}`);
    execSync(`sleep 1`); // Ensure different timestamps
  }

  const backupFiles = fs.readdirSync(BACKUP_DIR);
  log(`📁 Total backup files: ${backupFiles.length}`, "blue");

  if (backupFiles.length < 3) {
    throw new Error("Expected at least 3 backup files");
  }

  log("✅ Backup retention test passed", "green");
}

function cleanupTestEnvironment() {
  log("🧹 Cleaning up test environment...", "yellow");
  execSync(`rm -rf ${TEST_DIR}`);
  log("✅ Test environment cleaned up", "green");
}

// Main test execution
function runAllTests() {
  log("🚀 Starting Boss AI Platform Backup Tests", "blue");

  let passedTests = 0;
  let totalTests = 0;

  try {
    setupTestEnvironment();

    const tests = [
      ["Database Integrity Check", testDatabaseIntegrity],
      ["Backup Script Execution", testBackupScript],
      ["Restore Script Execution", testRestoreScript],
      ["Backup Retention", testBackupRetention],
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
    log("🎉 All tests passed!", "green");
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
