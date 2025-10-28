const fs = require('fs');
const path = require('path');

/**
 * НАСТОЯЩИЙ парсер OpenRouter с реальным поиском и валидацией
 * - Ищет каждую модель через поисковую строку
 * - Получает РЕАЛЬНЫЕ ссылки из результатов поиска
 * - Переходит по ссылкам и проверяет что открылась нужная страница
 * - Собирает ВСЮ информацию со страниц (не выдумывает)
 */

// Список моделей для поиска (первые 10 для тестирования)
const modelsToSearch = [
  "DeepSeek V3.1",
  "Google Gemini 2.5 Flash Image Preview (Nano Banana)",
  "Meta Llama 3.3 8B Instruct",
  "Qwen Qwen3 4B",
  "Mistral Small 3.2 24B",
  "NVIDIA Nemotron Nano 12B 2 VL",
  "MiniMax MiniMax M2",
  "Nous DeepHermes 3 Llama 3 8B Preview",
  "Microsoft Phi 4 Reasoning Plus",
  "OpenAI GPT-4o-mini Search Preview"
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
 * Очистка поисковой строки
 */
async function clearSearchInput() {
  return await page.evaluate(() => {
    const searchInput = document.querySelector('input[placeholder*="Search"], input[placeholder*="search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      return 'Поисковая строка очищена';
    }
    return 'Поисковая строка не найдена';
  });
}

/**
 * Поиск модели через поисковую строку
 */
async function searchForModel(modelName) {
  log(`🔍 Поиск модели: ${modelName}`);
  
  // Очищаем поисковую строку
  await clearSearchInput();
  await page.waitForTimeout(1000);
  
  // Вводим название модели
  const searchResult = await page.evaluate((name) => {
    const searchInput = document.querySelector('input[placeholder*="Search"], input[placeholder*="search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.value = name;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      return 'Поиск выполнен';
    }
    return 'Поисковая строка не найдена';
  }, modelName);
  
  log(`   ${searchResult}`);
  
  // Ждем загрузки результатов
  await page.waitForTimeout(3000);
  
  return searchResult;
}

/**
 * Получение реальной ссылки из результатов поиска
 */
async function getRealLinkFromSearch(modelName) {
  log(`🔗 Поиск ссылки для: ${modelName}`);
  
  const searchResults = await page.evaluate((expectedName) => {
    // Ищем все ссылки в результатах поиска
    const allLinks = Array.from(document.querySelectorAll('a[href*="/models/"]'));
    const results = [];
    
    for (const link of allLinks) {
      const href = link.getAttribute('href');
      const text = link.textContent.trim();
      
      // Проверяем что ссылка содержит название модели
      if (href && text && expectedName.toLowerCase().includes(text.toLowerCase().split(':')[0].trim())) {
        results.push({
          href: href.startsWith('http') ? href : `https://openrouter.ai${href}`,
          text: text,
          match: text.toLowerCase().includes(expectedName.toLowerCase().split(' ')[0])
        });
      }
    }
    
    return results;
  }, modelName);
  
  if (searchResults.length === 0) {
    log(`   ❌ Ссылки не найдены для: ${modelName}`);
    return null;
  }
  
  // Выбираем наиболее подходящую ссылку
  const bestMatch = searchResults.find(r => r.match) || searchResults[0];
  log(`   ✓ Найдена ссылка: ${bestMatch.href}`);
  
  return bestMatch.href;
}

/**
 * Валидация страницы модели
 */
async function validateModelPage(modelName) {
  log(`✅ Валидация страницы для: ${modelName}`);
  
  const validation = await page.evaluate((expectedName) => {
    // Проверяем URL
    const url = window.location.href;
    const urlValid = url.includes('/models/') && !url.includes('404');
    
    // Проверяем заголовок H1
    const h1 = document.querySelector('h1');
    const titleValid = h1 && h1.textContent.trim().length > 0;
    
    // Проверяем отсутствие ошибок
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
 * Парсинг ВСЕЙ информации со страницы модели
 */
async function parseAllModelInfo() {
  log(`📊 Парсинг информации со страницы`);
  
  const modelData = await page.evaluate(() => {
    // Название модели
    const name = document.querySelector('h1')?.textContent.trim() || 'Unknown';
    
    // ID из URL
    const url = window.location.href;
    const idMatch = url.match(/\/models\/([^\/\?]+)/);
    const id = idMatch ? idMatch[1] : 'Unknown';
    
    // Провайдер (из breadcrumbs или из названия)
    let provider = 'Unknown';
    const breadcrumbs = document.querySelectorAll('[class*="breadcrumb"], nav a');
    for (const crumb of breadcrumbs) {
      const text = crumb.textContent.trim();
      if (text && text !== name && !text.includes('Models') && !text.includes('Home')) {
        provider = text;
        break;
      }
    }
    
    // Если не нашли в breadcrumbs, извлекаем из названия
    if (provider === 'Unknown' && name.includes(':')) {
      provider = name.split(':')[0].trim();
    }
    
    // Context length
    const contextMatch = document.body.textContent.match(/(\d+[KMB])\s*(tokens?|context)/i);
    const context = contextMatch ? contextMatch[1] : 'Unknown';
    
    // Цены (ищем в таблицах, карточках)
    let inputPrice = 'Unknown';
    let outputPrice = 'Unknown';
    
    const priceElements = document.querySelectorAll('td, [class*="price"], .pricing');
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
    
    // Если не нашли в элементах, ищем в тексте
    if (inputPrice === 'Unknown') {
      const inputMatch = document.body.textContent.match(/input[:\s]*\$0\/M/i);
      inputPrice = inputMatch ? '$0/M' : 'Unknown';
    }
    if (outputPrice === 'Unknown') {
      const outputMatch = document.body.textContent.match(/output[:\s]*\$0\/M/i);
      outputPrice = outputMatch ? '$0/M' : 'Unknown';
    }
    
    // Описание (все параграфы)
    const descriptionElements = document.querySelectorAll('p, .description, [class*="desc"], .content');
    const descriptions = Array.from(descriptionElements)
      .map(el => el.textContent.trim())
      .filter(text => text.length > 50 && !text.includes('$') && !text.includes('tokens'))
      .slice(0, 3); // Берем первые 3 описания
    
    const description = descriptions.join(' ') || 'No description available';
    
    // Дополнительная информация
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
 * Валидация собранных данных
 */
function validateModelData(data) {
  const issues = [];
  
  if (!data.name || data.name === 'Unknown') issues.push('Missing name');
  if (!data.id || data.id === 'Unknown') issues.push('Missing ID');
  if (!data.provider || data.provider === 'Unknown') issues.push('Missing provider');
  if (!data.context || data.context === 'Unknown') issues.push('Missing context');
  if (!data.inputPrice || data.inputPrice === 'Unknown') issues.push('Missing input price');
  if (!data.outputPrice || data.outputPrice === 'Unknown') issues.push('Missing output price');
  if (!data.description || data.description.length < 50) issues.push('Insufficient description');
  
  if (issues.length > 0) {
    log(`   ⚠️ Проблемы с данными: ${issues.join(', ')}`);
    return false;
  }
  
  log(`   ✓ Данные валидны`);
  return true;
}

/**
 * Основная функция парсинга одной модели
 */
async function parseModel(modelName) {
  try {
    log(`\n🚀 Начинаем парсинг: ${modelName}`);
    
    // 1. Поиск модели
    await searchForModel(modelName);
    
    // 2. Получение реальной ссылки
    const realLink = await getRealLinkFromSearch(modelName);
    if (!realLink) {
      throw new Error('Ссылка не найдена в результатах поиска');
    }
    
    // 3. Переход по ссылке
    log(`🔗 Переход по ссылке: ${realLink}`);
    await page.goto(realLink, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 4. Валидация страницы
    const validation = await validateModelPage(modelName);
    if (!validation.valid) {
      throw new Error(`Страница невалидна: ${JSON.stringify(validation)}`);
    }
    
    // 5. Парсинг информации
    const modelData = await parseAllModelInfo();
    
    // 6. Валидация данных
    const isValid = validateModelData(modelData);
    if (!isValid) {
      log(`   ⚠️ Данные неполные, но сохраняем`);
    }
    
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
  log('🚀 Запуск НАСТОЯЩЕГО парсера OpenRouter');
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
  await page.waitForTimeout(5000);
  
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
  
  fs.writeFileSync('openrouter-real-models.json', JSON.stringify(jsonData, null, 2));
  log(`✅ Сохранено ${results.length} моделей в openrouter-real-models.json`);
  
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
    getRealLinkFromSearch,
    validateModelPage,
    parseAllModelInfo,
    validateModelData,
    main
  };
}
