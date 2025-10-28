#!/usr/bin/env node

/**
 * Production Deploy Test Suite
 * Проверяет работоспособность всех компонентов после деплоя
 */

const https = require("https");
const http = require("http");

// Настройки тестирования
const config = {
  frontend: "https://boss-ai.online",
  apiGateway: "http://localhost:3000",
  ozonManager: "http://localhost:4200",
  timeout: 5000,
};

// Цвета для консоли
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Утилиты для тестирования
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https");
    const client = isHttps ? https : http;

    const req = client.request(
      url,
      {
        timeout: config.timeout,
        ...options,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () =>
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
          })
        );
      }
    );

    req.on("error", reject);
    req.on("timeout", () => reject(new Error("Request timeout")));
    req.end();
  });
};

// Тесты
const tests = [
  {
    name: "Frontend HTTPS доступность",
    test: async () => {
      const response = await makeRequest(config.frontend);
      return {
        success: response.statusCode === 200,
        details: `Status: ${response.statusCode}, Content-Length: ${response.headers["content-length"]}`,
      };
    },
  },

  {
    name: "Frontend SSL сертификат",
    test: async () => {
      const response = await makeRequest(config.frontend);
      return {
        success:
          response.statusCode === 200 &&
          response.headers["strict-transport-security"],
        details: `HSTS: ${
          response.headers["strict-transport-security"] ? "Enabled" : "Disabled"
        }`,
      };
    },
  },

  {
    name: "API Gateway Health Check",
    test: async () => {
      const response = await makeRequest(`${config.apiGateway}/api/health`);
      const data = JSON.parse(response.data);
      return {
        success: response.statusCode === 200 && data.success,
        details: `Status: ${response.statusCode}, Health: ${data.data?.status}`,
      };
    },
  },

  {
    name: "Ozon Manager Health Check",
    test: async () => {
      const response = await makeRequest(`${config.ozonManager}/api/health`);
      const data = JSON.parse(response.data);
      return {
        success: response.statusCode === 200 && data.success,
        details: `Status: ${response.statusCode}, Message: ${data.message}`,
      };
    },
  },

  {
    name: "Frontend Content Security Policy",
    test: async () => {
      const response = await makeRequest(config.frontend);
      return {
        success:
          response.statusCode === 200 &&
          response.headers["content-security-policy"],
        details: `CSP: ${
          response.headers["content-security-policy"] ? "Enabled" : "Disabled"
        }`,
      };
    },
  },

  {
    name: "Frontend Gzip Compression",
    test: async () => {
      const response = await makeRequest(config.frontend, {
        headers: { "Accept-Encoding": "gzip" },
      });
      return {
        success:
          response.statusCode === 200 &&
          response.headers["content-encoding"] === "gzip",
        details: `Compression: ${
          response.headers["content-encoding"] || "None"
        }`,
      };
    },
  },
];

// Запуск тестов
async function runTests() {
  console.log(
    `${colors.bold}${colors.blue}🚀 Production Deploy Test Suite${colors.reset}\n`
  );

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`${colors.yellow}⏳ ${test.name}...${colors.reset}`);
      const result = await test.test();

      if (result.success) {
        console.log(`${colors.green}✅ ${test.name}${colors.reset}`);
        console.log(`   ${colors.green}${result.details}${colors.reset}\n`);
        passed++;
      } else {
        console.log(`${colors.red}❌ ${test.name}${colors.reset}`);
        console.log(`   ${colors.red}${result.details}${colors.reset}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${test.name}${colors.reset}`);
      console.log(`   ${colors.red}Error: ${error.message}${colors.reset}\n`);
      failed++;
    }
  }

  // Результаты
  console.log(`${colors.bold}📊 Test Results:${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.blue}📈 Total: ${passed + failed}${colors.reset}\n`);

  if (failed === 0) {
    console.log(
      `${colors.green}${colors.bold}🎉 All tests passed! Production deployment is successful!${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}${colors.bold}⚠️  Some tests failed. Please check the issues above.${colors.reset}`
    );
    process.exit(1);
  }
}

// Запуск
runTests().catch((error) => {
  console.error(
    `${colors.red}💥 Test suite failed: ${error.message}${colors.reset}`
  );
  process.exit(1);
});
