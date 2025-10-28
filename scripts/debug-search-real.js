const { chromium } = require('playwright');

/**
 * Отладка поиска на OpenRouter
 */
async function debugSearch() {
  console.log('🔍 Отладка поиска на OpenRouter...');

  const browser = await chromium.launch({
    headless: true, // Headless режим для сервера
    slowMo: 1000
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  try {
    // Открываем страницу
    console.log('🌐 Открываем https://openrouter.ai/models...');
    await page.goto('https://openrouter.ai/models', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('✅ Страница загружена');

    // Ждем загрузки контента
    await page.waitForTimeout(3000);

    // Делаем скриншот до поиска
    await page.screenshot({ path: 'debug-before-search.png' });
    console.log('📸 Скриншот до поиска: debug-before-search.png');

    // Ищем поисковую строку
    const searchInput = await page.waitForSelector('input[placeholder="Filter models"]', { timeout: 10000 });
    console.log('✅ Найдена поисковая строка');

    // Вводим простой поиск
    console.log('🔍 Вводим "free"...');
    await searchInput.fill('free');
    await page.waitForTimeout(2000);

    // Делаем скриншот после поиска
    await page.screenshot({ path: 'debug-after-search-free.png' });
    console.log('📸 Скриншот после поиска "free": debug-after-search-free.png');

    // Ищем все ссылки на модели
    const allLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/models/"]'));
      return links.map(link => ({
        href: link.href,
        text: link.textContent.trim(),
        visible: link.offsetParent !== null
      }));
    });

    console.log(`🔗 Найдено ${allLinks.length} ссылок на модели:`);
    allLinks.forEach((link, index) => {
      console.log(`  ${index + 1}. ${link.text} -> ${link.href} (видимая: ${link.visible})`);
    });

    // Ищем элементы с текстом "DeepSeek"
    const deepseekElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements
        .filter(el => el.textContent.includes('DeepSeek'))
        .map(el => ({
          tagName: el.tagName,
          text: el.textContent.trim().slice(0, 100),
          href: el.href || el.closest('a')?.href || 'no-link'
        }));
    });

    console.log(`\n🔍 Найдено ${deepseekElements.length} элементов с "DeepSeek":`);
    deepseekElements.forEach((el, index) => {
      console.log(`  ${index + 1}. <${el.tagName}> ${el.text} -> ${el.href}`);
    });

    // Проверяем есть ли результаты поиска
    const searchResults = await page.evaluate(() => {
      // Ищем контейнер с результатами
      const containers = Array.from(document.querySelectorAll('div, section, main'));
      return containers
        .filter(container => {
          const text = container.textContent;
          return text.includes('DeepSeek') || text.includes('free') || text.includes('model');
        })
        .map(container => ({
          className: container.className,
          id: container.id,
          textLength: container.textContent.length,
          hasLinks: container.querySelectorAll('a[href*="/models/"]').length
        }));
    });

    console.log(`\n📦 Найдено ${searchResults.length} контейнеров с результатами:`);
    searchResults.forEach((container, index) => {
      console.log(`  ${index + 1}. ${container.className} (id: ${container.id}) - ${container.textLength} символов, ${container.hasLinks} ссылок`);
    });

    // Ждем еще немного для полной загрузки
    await page.waitForTimeout(3000);

    // Финальный скриншот
    await page.screenshot({ path: 'debug-final.png' });
    console.log('📸 Финальный скриншот: debug-final.png');

  } catch (error) {
    console.error('❌ Ошибка отладки:', error);
  } finally {
    await browser.close();
  }
}

debugSearch();
