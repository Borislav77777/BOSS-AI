const { chromium } = require('playwright');

async function debugSearchAdvanced() {
  console.log('🔍 Продвинутая отладка поиска на OpenRouter...');

  const browser = await chromium.launch({
    headless: true,
    slowMo: 2000
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  try {
    // Открываем страницу
    console.log('🌐 Открываем OpenRouter...');
    await page.goto('https://openrouter.ai/models', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(8000);

    // Ищем поисковую строку
    const searchInput = await page.$('input[placeholder="Search"]');
    if (!searchInput) {
      console.log('❌ Поисковая строка не найдена');
      return;
    }

    console.log('✅ Поисковая строка найдена');

    // Очищаем и вводим тестовый запрос
    await searchInput.click();
    await searchInput.fill('');
    await page.waitForTimeout(1000);

    console.log('🔍 Вводим "DeepSeek"...');
    await searchInput.type('DeepSeek');
    await page.waitForTimeout(5000);

    // Ждем появления результатов
    console.log('⏳ Ждем результаты...');
    await page.waitForTimeout(5000);

    // Ищем результаты в разных местах
    const allLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .filter(link => link.href && link.href.includes('/models/'))
        .map(link => ({
          href: link.href,
          text: link.textContent.trim(),
          visible: link.offsetParent !== null,
          className: link.className
        }));
    });

    console.log(`🔗 Найдено ${allLinks.length} ссылок на модели:`);
    allLinks.forEach((link, i) => {
      console.log(`  ${i+1}. "${link.text}" -> ${link.href} (visible: ${link.visible})`);
    });

    // Ищем в dropdown или результатах поиска
    const dropdownResults = await page.evaluate(() => {
      const dropdowns = Array.from(document.querySelectorAll('[role="listbox"], [role="menu"], .dropdown, .search-results, [class*="result"]'));
      return dropdowns.map(dropdown => ({
        tagName: dropdown.tagName,
        className: dropdown.className,
        text: dropdown.textContent.trim().substring(0, 100),
        visible: dropdown.offsetParent !== null
      }));
    });

    console.log(`📋 Найдено ${dropdownResults.length} потенциальных контейнеров результатов:`);
    dropdownResults.forEach((dropdown, i) => {
      console.log(`  ${i+1}. ${dropdown.tagName}.${dropdown.className} (visible: ${dropdown.visible})`);
      console.log(`     Текст: ${dropdown.text}...`);
    });

    // Проверяем есть ли вообще модели на странице
    const allModels = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const modelElements = elements.filter(el => {
        const text = el.textContent.toLowerCase();
        return text.includes('deepseek') || text.includes('gpt') || text.includes('llama') || text.includes('model');
      });

      return modelElements.slice(0, 10).map(el => ({
        tagName: el.tagName,
        className: el.className,
        text: el.textContent.trim().substring(0, 50)
      }));
    });

    console.log(`🤖 Найдено ${allModels.length} элементов с упоминанием моделей:`);
    allModels.forEach((model, i) => {
      console.log(`  ${i+1}. ${model.tagName}.${model.className}: "${model.text}..."`);
    });

    // Сохраняем скриншот
    await page.screenshot({ path: 'debug-search-advanced.png' });
    console.log('📸 Скриншот сохранен: debug-search-advanced.png');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await browser.close();
  }
}

debugSearchAdvanced().catch(console.error);
