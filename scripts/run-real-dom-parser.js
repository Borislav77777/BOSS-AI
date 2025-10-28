const { chromium } = require('playwright');
const { main } = require('./scrape-openrouter-real-dom.js');

/**
 * Запуск НАСТОЯЩЕГО парсера OpenRouter через DOM-поиск
 */
async function runRealDOMParser() {
  console.log('🚀 Запуск НАСТОЯЩЕГО парсера OpenRouter через DOM-поиск...');

  const browser = await chromium.launch({
    headless: true, // Headless режим для сервера
    slowMo: 500 // Замедляем для стабильности
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
  });

  const page = await context.newPage();

  // Делаем page доступным глобально для функций парсера
  global.page = page;

  try {
    await main();
  } catch (error) {
    console.error('❌ Ошибка при парсинге:', error);
  } finally {
    await browser.close();
  }
}

runRealDOMParser();
