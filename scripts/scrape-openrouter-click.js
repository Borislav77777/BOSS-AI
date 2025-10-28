const fs = require('fs');
const path = require('path');

/**
 * Парсер OpenRouter с кликом по результатам поиска
 * - Ищет каждую модель через поисковую строку
 * - Кликает по результатам поиска для получения ссылок
 * - Переходит по ссылкам и собирает информацию
 */

// Список моделей для поиска (первые 3 для тестирования)
const modelsToSearch = [
  "DeepSeek V3.1",
  "Google Gemini 2.5 Flash",
  "Meta Llama 3.3 8B"
];

/**
 * Логирование в файл
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync('parsing-log.txt', logMessage);
}

/**
 * Поиск модели через поисковую строку
 */
async function searchForModel(modelName) {
  log(`🔍 Поиск модели: ${modelName}`);
  
  // Очищаем поисковую строку
  const searchInput = await page.$('input[placeholder="Search"]');
  if (!searchInput) {
    throw new Error('Поисковая строка не найдена');
  }
  
  await searchInput.click();
  await searchInput.fill('');
  await page.waitForTimeout(1000);
  
  // Вводим название модели
  await searchInput.type(modelName);
  await page.waitForTimeout(3000);
  
  log(`   Поиск выполнен`);
  return true;
}

/**
 * Клик по результату поиска для получения ссылки
 */
async function clickSearchResult(modelName) {
  log(`🖱️ Поиск и клик по результату для: ${modelName}`);
  
  const result = await page.evaluate((expectedName) => {
    // Ищем контейнер результатов
    const resultsContainer = document.querySelector('.max-h-80.overflow-auto, [class*="search-results"], [class*="dropdown"]');
    
    if (!resultsContainer) {
      return { found: false, reason: 'No results container' };
    }
    
    // Ищем все кликабельные элементы в контейнере
    const clickableElements = Array.from(resultsContainer.querySelectorAll('*')).filter(el => {
      const text = el.textContent.trim();
      return text && expectedName.toLowerCase().split(' ').some(word => 
        text.toLowerCase().includes(word.toLowerCase()) && word.length > 2
      );
    });
    
    if (clickableElements.length === 0) {
      return { found: false, reason: 'No matching elements' };
    }
    
    // Выбираем первый подходящий элемент
    const targetElement = clickableElements[0];
    const text = targetElement.textContent.trim();
    
    return {
      found: true,
      text: text,
      tagName: targetElement.tagName,
      className: targetElement.className
    };
  }, modelName);
  
  if (!result.found) {
    log(`   ❌ Результат не найден: ${result.reason}`);
    return null;
  }
  
  log(`   ✓ Найден результат: "${result.text}"`);
  
  // Кликаем по результату
  const clicked = await page.evaluate((expectedName) => {
    const resultsContainer = document.querySelector('.max-h-80.overflow-auto, [class*="search-results"], [class*="dropdown"]');
    
    if (!resultsContainer) {
      return false;
    }
    
    const clickableElements = Array.from(resultsContainer.querySelectorAll('*')).filter(el => {
      const text = el.textContent.trim();
      return text && expectedName.toLowerCase().split(' ').some(word => 
        text.toLowerCase().includes(word.toLowerCase()) && word.length > 2
      );
    });
    
    if (clickableElements.length === 0) {
      return false;
    }
    
    const targetElement = clickableElements[0];
    targetElement.click();
    return true;
  }, modelName);
  
  if (!clicked) {
    log(`   ❌ Не удалось кликнуть по результату`);
    return null;
  }
  
  log(`   ✓ Клик выполнен`);
  
  // Ждем загрузки страницы
  await page.waitForTimeout(3000);
  
  // Получаем текущий URL
  const currentUrl = page.url();
  log(`   ✓ Перешли на: ${currentUrl}`);
  
  return currentUrl;
}

/**
 * Валидация страницы модели
 */
async function validateModelPage(modelName) {
  log(`✅ Валидация страницы для: ${modelName}`);
  
  const validation = await page.evaluate((expectedName) => {
    const url = window.location.href;
    const urlValid = url.includes('/models/') && !url.includes('404');
    
    const h1 = document.querySelector('h1');
    const titleValid = h1 && h1.textContent.trim().length > 0;
    
    const hasError = document.body.textContent.includes('404') || 
                    document.body.textContent.includes('Not Found') ||
                    document.body.textContent.includes('Error');
    
    return {
      urlValid,
      titleValid,
      hasError,
      url: url,
      title: h1 ? h1.textContent.trim() : 'No title',
      valid: urlValid && titleValid && !hasError
    };
  }, modelName);
  
  if (validation.valid) {
    log(`   ✓ Страница валидна: ${validation.title}`);
  } else {
    log(`   ❌ Страница невалидна: URL=${validation.urlValid}, Title=${validation.titleValid}, Error=${validation.hasError}`);
  }
  
  return validation;
}

/**
 * Парсинг информации со страницы модели
 */
async function parseAllModelInfo() {
  log(`📊 Парсинг информации со страницы`);
  
  const modelData = await page.evaluate(() => {
    const name = document.querySelector('h1')?.textContent.trim() || 'Unknown';
    const url = window.location.href;
    const idMatch = url.match(/\/models\/([^\/\?]+)/);
    const id = idMatch ? idMatch[1] : 'Unknown';
    
    let provider = 'Unknown';
    const breadcrumbs = document.querySelectorAll('[class*="breadcrumb"], nav a, [class*="breadcrumb"] a');
    for (const crumb of breadcrumbs) {
      const text = crumb.textContent.trim();
      if (text && text !== name && !text.includes('Models') && !text.includes('Home')) {
        provider = text;
        break;
      }
    }
    
    if (provider === 'Unknown' && name.includes(':')) {
      provider = name.split(':')[0].trim();
    }
    
    const contextMatch = document.body.textContent.match(/(\d+[KMB])\s*(tokens?|context)/i);
    const context = contextMatch ? contextMatch[1] : 'Unknown';
    
    let inputPrice = 'Unknown';
    let outputPrice = 'Unknown';
    
    const priceElements = document.querySelectorAll('td, [class*="price"], .pricing, [class*="cost"]');
    for (const el of priceElements) {
      const text = el.textContent.trim();
      if (text.includes('$0/M') || text.includes('$0/')) {
        if (text.toLowerCase().includes('input') || inputPrice === 'Unknown') {
          inputPrice = text;
        }
        if (text.toLowerCase().includes('output') || outputPrice === 'Unknown') {
          outputPrice = text;
        }
      }
    }
    
    if (inputPrice === 'Unknown') {
      const inputMatch = document.body.textContent.match(/input[:\s]*\$0\/M/i);
      inputPrice = inputMatch ? '$0/M' : 'Unknown';
    }
    if (outputPrice === 'Unknown') {
      const outputMatch = document.body.textContent.match(/output[:\s]*\$0\/M/i);
      outputPrice = outputMatch ? '$0/M' : 'Unknown';
    }
    
    const descriptionElements = document.querySelectorAll('p, .description, [class*="desc"], .content, [class*="about"]');
    const descriptions = Array.from(descriptionElements)
      .map(el => el.textContent.trim())
      .filter(text => text.length > 50 && !text.includes('$') && !text.includes('tokens'))
      .slice(0, 3);
    
    const description = descriptions.join(' ') || 'No description available';
    
    const paramsMatch = document.body.textContent.match(/(\d+[BMK]?)\s*parameters?/i);
    const modelSize = paramsMatch ? paramsMatch[1] : null;
    
    const architectureMatch = document.body.textContent.match(/(transformer|mamba|hybrid|gpt|llama)/i);
    const architecture = architectureMatch ? architectureMatch[1] : null;
    
    const capabilities = [];
    if (document.body.textContent.toLowerCase().includes('vision')) capabilities.push('Vision');
    if (document.body.textContent.toLowerCase().includes('code')) capabilities.push('Code');
    if (document.body.textContent.toLowerCase().includes('reasoning')) capabilities.push('Reasoning');
    if (document.body.textContent.toLowerCase().includes('multimodal')) capabilities.push('Multimodal');
    
    return {
      name,
      id,
      provider,
      context,
      inputPrice,
      outputPrice,
      description,
      modelSize,
      architecture,
      capabilities: capabilities.join(', ') || 'Unknown',
      url: url
    };
  });
  
  log(`   ✓ Собрана информация: ${modelData.name} (${modelData.provider})`);
  return modelData;
}

/**
 * Основная функция парсинга одной модели
 */
async function parseModel(modelName) {
  try {
    log(`\n🚀 Начинаем парсинг: ${modelName}`);
    
    // 1. Поиск модели
    await searchForModel(modelName);
    
    // 2. Клик по результату поиска
    const modelUrl = await clickSearchResult(modelName);
    if (!modelUrl) {
      throw new Error('Не удалось получить ссылку через клик по результату');
    }
    
    // 3. Валидация страницы
    const validation = await validateModelPage(modelName);
    if (!validation.valid) {
      throw new Error(`Страница невалидна: ${JSON.stringify(validation)}`);
    }
    
    // 4. Парсинг информации
    const modelData = await parseAllModelInfo();
    
    log(`✅ Успешно спарсена: ${modelName}`);
    return modelData;
    
  } catch (error) {
    log(`❌ Ошибка при парсинге ${modelName}: ${error.message}`);
    throw error;
  }
}

/**
 * Главная функция
 */
async function main() {
  log('🚀 Запуск парсера OpenRouter с кликом по результатам');
  log(`📊 Будет обработано ${modelsToSearch.length} моделей`);
  
  // Очищаем лог файл
  fs.writeFileSync('parsing-log.txt', '');
  fs.writeFileSync('failed-models.txt', '');
  
  const results = [];
  const failed = [];
  
  // Открываем OpenRouter
  log('🌐 Открываем OpenRouter...');
  await page.goto('https://openrouter.ai/models', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });
  await page.waitForTimeout(8000);
  
  // Парсим каждую модель
  for (let i = 0; i < modelsToSearch.length; i++) {
    const modelName = modelsToSearch[i];
    log(`\n[${i+1}/${modelsToSearch.length}] Обработка: ${modelName}`);
    
    try {
      const data = await parseModel(modelName);
      results.push(data);
      log(`✓ Успешно: ${modelName}`);
    } catch (error) {
      log(`✗ Ошибка: ${modelName} - ${error.message}`);
      failed.push({ model: modelName, error: error.message });
      
      // Сохраняем failed model
      fs.appendFileSync('failed-models.txt', `${modelName}: ${error.message}\n`);
    }
    
    // Пауза между запросами
    if (i < modelsToSearch.length - 1) {
      log('⏳ Пауза 3 секунды...');
      await page.waitForTimeout(3000);
    }
  }
  
  // Сохраняем результаты
  log('\n💾 Сохранение результатов...');
  
  const jsonData = {
    lastUpdated: new Date().toISOString(),
    totalModels: results.length,
    failedModels: failed.length,
    models: results
  };
  
  fs.writeFileSync('openrouter-click-models.json', JSON.stringify(jsonData, null, 2));
  log(`✅ Сохранено ${results.length} моделей в openrouter-click-models.json`);
  
  // Статистика
  log('\n📈 Статистика:');
  log(`   Успешно спарсено: ${results.length}`);
  log(`   Ошибок: ${failed.length}`);
  log(`   Провайдеров: ${new Set(results.map(m => m.provider)).size}`);
  
  if (failed.length > 0) {
    log('\n❌ Failed models:');
    failed.forEach(f => log(`   - ${f.model}: ${f.error}`));
  }
  
  log('\n🎉 Парсинг завершен!');
}

// Экспорт для использования в Playwright
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseModel,
    searchForModel,
    clickSearchResult,
    validateModelPage,
    parseAllModelInfo,
    main
  };
}
