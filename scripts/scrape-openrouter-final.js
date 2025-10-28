const fs = require('fs');
const path = require('path');

/**
 * ФИНАЛЬНЫЙ парсер OpenRouter с комбинированным подходом
 * - Ищет модели через поисковую строку
 * - Извлекает названия из результатов поиска
 * - Генерирует ссылки на основе найденных названий
 * - Переходит по ссылкам и собирает информацию
 */

// Список моделей для поиска
const modelsToSearch = [
  "DeepSeek V3.1",
  "Google Gemini 2.5 Flash",
  "Meta Llama 3.3 8B",
  "Qwen Qwen3 4B",
  "Mistral Small 3.2",
  "NVIDIA Nemotron Nano 12B",
  "MiniMax MiniMax M2",
  "Nous DeepHermes 3 Llama 3 8B",
  "Microsoft Phi 4 Reasoning Plus",
  "OpenAI GPT-4o-mini"
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
 * Извлечение названий моделей из результатов поиска
 */
async function extractModelNamesFromSearch(modelName) {
  log(`📝 Извлечение названий для: ${modelName}`);
  
  const searchResults = await page.evaluate((expectedName) => {
    // Ищем контейнер результатов
    const resultsContainer = document.querySelector('.max-h-80.overflow-auto, [class*="search-results"], [class*="dropdown"]');
    
    if (!resultsContainer) {
      return [];
    }
    
    // Извлекаем текст и разбиваем на строки
    const text = resultsContainer.textContent.trim();
    const lines = text.split(/\n|(?=Models)|(?=Providers)/).filter(line => line.trim());
    
    const models = [];
    
    for (const line of lines) {
      // Ищем паттерны типа "Provider: Model Name"
      const matches = line.match(/([^:]+):\s*([^(]+?)(?:\s*\([^)]+\))?(?:\s|$)/g);
      
      if (matches) {
        for (const match of matches) {
          const parts = match.split(':');
          if (parts.length >= 2) {
            const provider = parts[0].trim();
            const modelName = parts[1].trim();
            
            // Проверяем что модель содержит ключевые слова из поиска
            const isMatch = expectedName.toLowerCase().split(' ').some(word => 
              modelName.toLowerCase().includes(word.toLowerCase()) && word.length > 2
            );
            
            if (isMatch && modelName.length > 3) {
              models.push({
                provider: provider,
                name: modelName,
                fullName: `${provider}: ${modelName}`
              });
            }
          }
        }
      }
    }
    
    return models;
  }, modelName);
  
  if (searchResults.length === 0) {
    log(`   ❌ Названия не найдены для: ${modelName}`);
    return null;
  }
  
  // Выбираем наиболее подходящее название
  const bestMatch = searchResults.find(r => 
    r.name.toLowerCase().includes(modelName.toLowerCase().split(' ')[0])
  ) || searchResults[0];
  
  log(`   ✓ Найдено название: ${bestMatch.fullName}`);
  return bestMatch;
}

/**
 * Генерация ссылки на основе названия модели
 */
function generateModelUrl(modelInfo) {
  if (!modelInfo) return null;
  
  // Создаем ID модели в формате OpenRouter
  const modelId = `${modelInfo.provider.toLowerCase()}/${modelInfo.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  const url = `https://openrouter.ai/models/${modelId}`;
  
  log(`   🔗 Сгенерирована ссылка: ${url}`);
  return url;
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
    
    // 2. Извлечение названий из результатов поиска
    const modelInfo = await extractModelNamesFromSearch(modelName);
    if (!modelInfo) {
      throw new Error('Не удалось извлечь название модели из результатов поиска');
    }
    
    // 3. Генерация ссылки
    const modelUrl = generateModelUrl(modelInfo);
    if (!modelUrl) {
      throw new Error('Не удалось сгенерировать ссылку на модель');
    }
    
    // 4. Переход по ссылке
    log(`🔗 Переход по ссылке: ${modelUrl}`);
    await page.goto(modelUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // 5. Валидация страницы
    const validation = await validateModelPage(modelName);
    if (!validation.valid) {
      log(`   ⚠️ Страница невалидна, но продолжаем парсинг`);
    }
    
    // 6. Парсинг информации
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
  log('🚀 Запуск ФИНАЛЬНОГО парсера OpenRouter');
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
  
  fs.writeFileSync('openrouter-final-models.json', JSON.stringify(jsonData, null, 2));
  log(`✅ Сохранено ${results.length} моделей в openrouter-final-models.json`);
  
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
    extractModelNamesFromSearch,
    generateModelUrl,
    validateModelPage,
    parseAllModelInfo,
    main
  };
}
