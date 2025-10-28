const { chromium } = require('playwright');

async function debugSearch() {
  console.log('🔍 Отладка поиска на OpenRouter...');

  const browser = await chromium.launch({
    headless: true,
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
    console.log('🌐 Открываем OpenRouter...');
    await page.goto('https://openrouter.ai/models', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(5000);

    // Проверяем что загрузилось
    const title = await page.title();
    console.log(`📄 Заголовок страницы: ${title}`);

    // Ищем поисковую строку
    const searchInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map(input => ({
        placeholder: input.placeholder,
        type: input.type,
        className: input.className,
        id: input.id
      }));
    });

    console.log('🔍 Найденные input элементы:');
    searchInputs.forEach((input, i) => {
      console.log(`  ${i+1}. placeholder="${input.placeholder}", type="${input.type}", class="${input.className}"`);
    });

    // Пробуем найти поисковую строку
    const searchInput = await page.$('input[placeholder*="Search"], input[placeholder*="search"], input[type="search"]');
    if (searchInput) {
      console.log('✅ Поисковая строка найдена');

      // Очищаем и вводим тестовый запрос
      await searchInput.fill('');
      await searchInput.type('DeepSeek');
      await page.waitForTimeout(3000);

      // Ищем результаты
      const results = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/models/"]'));
        return links.map(link => ({
          href: link.href,
          text: link.textContent.trim(),
          visible: link.offsetParent !== null
        }));
      });

      console.log(`🔗 Найдено ${results.length} ссылок на модели:`);
      results.forEach((result, i) => {
        console.log(`  ${i+1}. ${result.text} -> ${result.href} (visible: ${result.visible})`);
      });

    } else {
      console.log('❌ Поисковая строка не найдена');
    }

    // Сохраняем скриншот для отладки
    await page.screenshot({ path: 'debug-openrouter.png' });
    console.log('📸 Скриншот сохранен: debug-openrouter.png');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await browser.close();
  }
}

debugSearch().catch(console.error);
