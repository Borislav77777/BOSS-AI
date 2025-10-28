const { chromium } = require('playwright');

async function debugSearchDetailed() {
  console.log('🔍 Детальная отладка поиска на OpenRouter...');
  
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
    
    // Ждем появления результатов с проверкой
    console.log('⏳ Ждем результаты...');
    
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      
      const results = await page.evaluate(() => {
        // Ищем в контейнере результатов поиска
        const resultsContainer = document.querySelector('.max-h-80.overflow-auto, [class*="search-results"], [class*="dropdown"]');
        
        if (!resultsContainer) {
          return { found: false, reason: 'No results container' };
        }
        
        // Ищем все ссылки в контейнере результатов
        const allLinks = Array.from(resultsContainer.querySelectorAll('a[href*="/models/"]'));
        
        return {
          found: true,
          containerText: resultsContainer.textContent.trim().substring(0, 200),
          linksCount: allLinks.length,
          links: allLinks.map(link => ({
            href: link.getAttribute('href'),
            text: link.textContent.trim(),
            visible: link.offsetParent !== null
          }))
        };
      });
      
      console.log(`   Попытка ${i+1}: ${results.found ? 'Контейнер найден' : results.reason}`);
      if (results.found) {
        console.log(`   Текст контейнера: ${results.containerText}...`);
        console.log(`   Ссылок найдено: ${results.linksCount}`);
        
        if (results.linksCount > 0) {
          console.log('   Ссылки:');
          results.links.forEach((link, idx) => {
            console.log(`     ${idx+1}. "${link.text}" -> ${link.href} (visible: ${link.visible})`);
          });
          break;
        }
      }
    }
    
    // Также проверим все ссылки на странице
    const allPageLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/models/"]'));
      return links.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent.trim(),
        visible: link.offsetParent !== null,
        className: link.className
      }));
    });
    
    console.log(`\n🔗 Всего ссылок на модели на странице: ${allPageLinks.length}`);
    allPageLinks.forEach((link, i) => {
      console.log(`  ${i+1}. "${link.text}" -> ${link.href} (visible: ${link.visible})`);
    });
    
    // Сохраняем скриншот
    await page.screenshot({ path: 'debug-search-detailed.png' });
    console.log('📸 Скриншот сохранен: debug-search-detailed.png');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await browser.close();
  }
}

debugSearchDetailed().catch(console.error);
