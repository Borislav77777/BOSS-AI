const { chromium } = require('playwright');
const fs = require('fs').promises;

/**
 * НАСТОЯЩИЙ парсер OpenRouter через DOM-поиск
 * 
 * Алгоритм:
 * 1. Загружаем список моделей из openrouter-all-models.json
 * 2. Для каждой модели:
 *    - Открываем https://openrouter.ai/models
 *    - Вводим название в поиск
 *    - НАХОДИМ реальную ссылку в DOM
 *    - Переходим по найденной ссылке
 *    - ПРОВЕРЯЕМ что открылась правильная страница
 *    - ИЗВЛЕКАЕМ всю информацию
 */

async function loadModelList() {
  try {
    const data = await fs.readFile('openrouter-all-models.json', 'utf8');
    const jsonData = JSON.parse(data);
    console.log(`📋 Загружено ${jsonData.models.length} моделей из файла`);
    return jsonData.models;
  } catch (error) {
    console.error('❌ Ошибка загрузки списка моделей:', error);
    return [];
  }
}

async function findRealModelLink(page, modelName) {
  try {
    console.log(`🔍 Ищем ссылку для: ${modelName}`);
    
    // Очищаем поиск и вводим новое название
    const searchInput = await page.waitForSelector('input[placeholder="Filter models"]', { timeout: 10000 });
    await searchInput.fill(''); // Очистить
    await searchInput.fill(modelName);
    
    // Ждем появления результатов
    await page.waitForTimeout(2000);
    
    // Ищем РЕАЛЬНУЮ ссылку в DOM
    const modelLink = await page.evaluate((name) => {
      // Ищем все ссылки на модели (исключаем поисковые ссылки)
      const links = Array.from(document.querySelectorAll('a[href*="openrouter.ai/"]'));
      
      console.log(`Найдено ${links.length} ссылок на OpenRouter`);
      
      for (const link of links) {
        const text = link.textContent.trim();
        const href = link.href;
        const cleanName = name.replace(' (free)', '').trim();
        
        // Исключаем поисковые ссылки (содержат ?q=)
        if (href.includes('?q=') || href.includes('&q=')) {
          continue;
        }
        
        // Проверяем различные варианты совпадения
        if (text.includes(cleanName) || 
            text.includes(name) ||
            cleanName.includes(text) ||
            text.toLowerCase().includes(cleanName.toLowerCase())) {
          console.log(`✅ Найдено совпадение: "${text}" для "${name}" -> ${href}`);
          return href;
        }
      }
      
      console.log(`❌ Ссылка не найдена для: ${name}`);
      return null;
    }, modelName);
    
    return modelLink;
  } catch (error) {
    console.error(`❌ Ошибка поиска ссылки для ${modelName}:`, error);
    return null;
  }
}

async function extractModelInfo(page, modelName, modelLink) {
  try {
    console.log(`📄 Извлекаем информацию с: ${modelLink}`);
    
    const modelData = await page.evaluate(() => {
      const bodyText = document.body.textContent;
      
      // Извлекаем название
      const h1 = document.querySelector('h1');
      const name = h1 ? h1.textContent.trim() : '';
      
      // Извлекаем описание
      const descriptionElements = Array.from(document.querySelectorAll('p, div[class*="description"], div[class*="text"]'));
      const descriptions = descriptionElements
        .map(el => el.textContent.trim())
        .filter(text => text.length > 30 && text.length < 500)
        .slice(0, 3);
      
      // Извлекаем контекст
      const contextMatch = bodyText.match(/(\d+[KM]?)\s*(tokens?|context)/i);
      const context = contextMatch ? contextMatch[1] : 'Unknown';
      
      // Извлекаем параметры
      const paramsMatch = bodyText.match(/(\d+[BMK]?)\s*parameters?/i);
      const parameters = paramsMatch ? paramsMatch[1] : 'Unknown';
      
      // Извлекаем цены
      const inputPriceMatch = bodyText.match(/[Ii]nput.*?(\$[\d.]+|free)/i);
      const outputPriceMatch = bodyText.match(/[Oo]utput.*?(\$[\d.]+|free)/i);
      
      // Извлекаем провайдера
      const provider = name.split(':')[0]?.trim() || 'Unknown';
      
      // Определяем возможности
      const capabilities = [];
      const lowerText = bodyText.toLowerCase();
      if (lowerText.includes('vision')) capabilities.push('Vision');
      if (lowerText.includes('code')) capabilities.push('Code');
      if (lowerText.includes('reasoning')) capabilities.push('Reasoning');
      if (lowerText.includes('multimodal')) capabilities.push('Multimodal');
      if (lowerText.includes('image')) capabilities.push('Image');
      if (lowerText.includes('audio')) capabilities.push('Audio');
      
      return {
        name: name,
        description: descriptions.join(' ').slice(0, 500),
        context: context,
        parameters: parameters,
        pricing: {
          input: inputPriceMatch ? inputPriceMatch[1] : '$0',
          output: outputPriceMatch ? outputPriceMatch[1] : '$0'
        },
        provider: provider,
        capabilities: capabilities,
        scrapedAt: new Date().toISOString()
      };
    });
    
    // Добавляем URL и исходное название
    modelData.url = modelLink;
    modelData.searchName = modelName;
    
    console.log(`✅ Извлечена информация: ${modelData.name} (${modelData.provider})`);
    return modelData;
    
  } catch (error) {
    console.error(`❌ Ошибка извлечения информации для ${modelName}:`, error);
    return null;
  }
}

async function validatePage(page, modelName) {
  try {
    // Проверяем что страница загрузилась
    const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => '');
    if (!h1) {
      console.error(`❌ ${modelName} - страница не загрузилась (нет h1)`);
      return false;
    }
    
    // Проверяем что это страница модели (содержит информацию о модели)
    const bodyText = await page.evaluate(() => document.body.textContent);
    if (bodyText.includes('Model not found') || bodyText.includes('404')) {
      console.error(`❌ ${modelName} - модель не найдена`);
      return false;
    }
    
    console.log(`✅ ${modelName} - страница валидна`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка валидации страницы для ${modelName}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Запуск НАСТОЯЩЕГО парсера OpenRouter через DOM-поиск...');
  
  // Загружаем список моделей
  const models = await loadModelList();
  if (models.length === 0) {
    console.error('❌ Не удалось загрузить список моделей');
    return;
  }
  
  // Инициализируем браузер
  const browser = await chromium.launch({
    headless: true,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  const successfulModels = [];
  const failedModels = [];
  
  try {
    // Открываем главную страницу моделей
    console.log('🌐 Открываем https://openrouter.ai/models...');
    await page.goto('https://openrouter.ai/models', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('✅ Страница загружена, начинаем поиск моделей...');
    
    // Обрабатываем каждую модель
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const modelName = model.name;
      
      console.log(`\n📋 [${i + 1}/${models.length}] Обрабатываем: ${modelName}`);
      
      try {
        // Шаг 1: Ищем реальную ссылку
        const modelLink = await findRealModelLink(page, modelName);
        
        if (!modelLink) {
          console.error(`❌ Ссылка не найдена для: ${modelName}`);
          failedModels.push({
            name: modelName,
            reason: 'link_not_found',
            step: 'search'
          });
          continue;
        }
        
        console.log(`✅ Найдена ссылка: ${modelLink}`);
        
        // Шаг 2: Переходим по ссылке
        await page.goto(modelLink, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        
        // Шаг 3: Валидируем страницу
        const isValid = await validatePage(page, modelName);
        if (!isValid) {
          failedModels.push({
            name: modelName,
            url: modelLink,
            reason: 'page_validation_failed',
            step: 'validation'
          });
          continue;
        }
        
        // Шаг 4: Извлекаем информацию
        const modelData = await extractModelInfo(page, modelName, modelLink);
        if (!modelData) {
          failedModels.push({
            name: modelName,
            url: modelLink,
            reason: 'extraction_failed',
            step: 'extraction'
          });
          continue;
        }
        
        // Шаг 5: Сохраняем успешный результат
        successfulModels.push(modelData);
        console.log(`✅ Успешно обработана: ${modelData.name}`);
        
        // Сохраняем промежуточные результаты каждые 10 моделей
        if (successfulModels.length % 10 === 0) {
          await fs.writeFile(
            'openrouter-progress.json',
            JSON.stringify(successfulModels, null, 2)
          );
          console.log(`💾 Сохранено ${successfulModels.length} моделей в промежуточный файл`);
        }
        
        // Небольшая пауза между запросами
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.error(`❌ Ошибка обработки ${modelName}:`, error);
        failedModels.push({
          name: modelName,
          reason: 'processing_error',
          error: error.message,
          step: 'processing'
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  } finally {
    await browser.close();
  }
  
  // Генерируем финальные отчеты
  console.log('\n📊 Генерация финальных отчетов...');
  
  // Сохраняем успешные модели
  await fs.writeFile(
    'openrouter-real-models.json',
    JSON.stringify({
      lastUpdated: new Date().toISOString(),
      totalSuccessful: successfulModels.length,
      totalFailed: failedModels.length,
      models: successfulModels
    }, null, 2)
  );
  
  // Сохраняем неудачные модели
  await fs.writeFile(
    'openrouter-failed-models.json',
    JSON.stringify({
      lastUpdated: new Date().toISOString(),
      totalFailed: failedModels.length,
      failedModels: failedModels
    }, null, 2)
  );
  
  // Генерируем HTML таблицу
  await generateHTMLTable(successfulModels);
  
  console.log('\n🎉 Парсинг завершен!');
  console.log(`✅ Успешно обработано: ${successfulModels.length} моделей`);
  console.log(`❌ Не удалось обработать: ${failedModels.length} моделей`);
  console.log(`📄 HTML таблица: openrouter-real-models.html`);
  console.log(`📄 JSON данные: openrouter-real-models.json`);
  console.log(`📄 Ошибки: openrouter-failed-models.json`);
}

async function generateHTMLTable(models) {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenRouter - Реальные модели (${models.length})</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: rgba(0, 255, 255, 0.1);
            border-radius: 15px;
            border: 1px solid rgba(0, 255, 255, 0.3);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #00FFFF, #00CCCC);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
        }
        
        .stat {
            text-align: center;
            padding: 15px;
            background: rgba(0, 255, 255, 0.05);
            border-radius: 10px;
            border: 1px solid rgba(0, 255, 255, 0.2);
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #00FFFF;
        }
        
        .search-container {
            margin-bottom: 30px;
            text-align: center;
        }
        
        .search-input {
            padding: 15px 20px;
            font-size: 16px;
            border: 2px solid rgba(0, 255, 255, 0.3);
            border-radius: 25px;
            background: rgba(0, 0, 0, 0.5);
            color: #e0e0e0;
            width: 400px;
            outline: none;
            transition: all 0.3s ease;
        }
        
        .search-input:focus {
            border-color: #00FFFF;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.1);
        }
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(0, 255, 255, 0.1);
        }
        
        th {
            background: linear-gradient(90deg, #00CCCC 0%, #00FFFF 100%);
            color: #000000;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            cursor: pointer;
            position: relative;
        }
        
        th:hover {
            background: linear-gradient(90deg, #00FFFF 0%, #00CCCC 100%);
        }
        
        tr:hover {
            background: rgba(0, 255, 255, 0.05);
        }
        
        .model-name {
            font-weight: bold;
            color: #00FFFF;
        }
        
        .provider {
            color: #00CCCC;
            font-weight: 500;
        }
        
        .capabilities {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        
        .capability {
            background: rgba(0, 255, 255, 0.2);
            color: #00FFFF;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        
        .description {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .url-link {
            color: #00FFFF;
            text-decoration: none;
            font-size: 0.9em;
        }
        
        .url-link:hover {
            text-decoration: underline;
        }
        
        .sort-arrow {
            margin-left: 8px;
            font-size: 0.8em;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            margin-top: 30px;
            gap: 10px;
        }
        
        .page-btn {
            padding: 10px 15px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            color: #e0e0e0;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .page-btn:hover {
            background: rgba(0, 255, 255, 0.2);
        }
        
        .page-btn.active {
            background: #00FFFF;
            color: #000000;
        }
        
        .export-buttons {
            text-align: center;
            margin-top: 20px;
        }
        
        .export-btn {
            padding: 12px 25px;
            margin: 0 10px;
            background: linear-gradient(45deg, #00CCCC, #00FFFF);
            color: #000000;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        
        .export-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 255, 255, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>OpenRouter - Реальные модели</h1>
            <p>Настоящие проверенные ссылки и полная информация</p>
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">${models.length}</div>
                    <div>Всего моделей</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${[...new Set(models.map(m => m.provider))].length}</div>
                    <div>Провайдеров</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${models.filter(m => m.capabilities.length > 0).length}</div>
                    <div>С возможностями</div>
                </div>
            </div>
        </div>
        
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Поиск по моделям..." id="searchInput">
        </div>
        
        <table id="modelsTable">
            <thead>
                <tr>
                    <th onclick="sortTable(0)">Название <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(1)">Провайдер <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(2)">Контекст <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(3)">Параметры <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(4)">Цена (вход/выход) <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(5)">Возможности <span class="sort-arrow">↕</span></th>
                    <th>Описание</th>
                    <th>Ссылка</th>
                </tr>
            </thead>
            <tbody>
                ${models.map(model => `
                    <tr>
                        <td class="model-name">${model.name}</td>
                        <td class="provider">${model.provider}</td>
                        <td>${model.context}</td>
                        <td>${model.parameters}</td>
                        <td>${model.pricing.input} / ${model.pricing.output}</td>
                        <td>
                            <div class="capabilities">
                                ${model.capabilities.map(cap => `<span class="capability">${cap}</span>`).join('')}
                            </div>
                        </td>
                        <td class="description" title="${model.description}">${model.description}</td>
                        <td><a href="${model.url}" target="_blank" class="url-link">Открыть</a></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="export-buttons">
            <button class="export-btn" onclick="exportToJSON()">Экспорт JSON</button>
            <button class="export-btn" onclick="exportToCSV()">Экспорт CSV</button>
        </div>
    </div>
    
    <script>
        let currentData = ${JSON.stringify(models)};
        let currentSort = { column: -1, direction: 'asc' };
        
        // Поиск
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#modelsTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
        
        // Сортировка
        function sortTable(column) {
            const tbody = document.querySelector('#modelsTable tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
            currentSort = { column, direction };
            
            rows.sort((a, b) => {
                const aText = a.cells[column].textContent.trim();
                const bText = b.cells[column].textContent.trim();
                
                if (direction === 'asc') {
                    return aText.localeCompare(bText);
                } else {
                    return bText.localeCompare(aText);
                }
            });
            
            rows.forEach(row => tbody.appendChild(row));
            
            // Обновляем стрелки
            document.querySelectorAll('.sort-arrow').forEach(arrow => {
                arrow.textContent = '↕';
            });
            document.querySelectorAll('th')[column].querySelector('.sort-arrow').textContent = direction === 'asc' ? '↑' : '↓';
        }
        
        // Экспорт
        function exportToJSON() {
            const dataStr = JSON.stringify(currentData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'openrouter-real-models.json';
            link.click();
        }
        
        function exportToCSV() {
            const headers = ['Название', 'Провайдер', 'Контекст', 'Параметры', 'Цена вход', 'Цена выход', 'Возможности', 'Описание', 'Ссылка'];
            const csvContent = [
                headers.join(','),
                ...currentData.map(model => [
                    '"' + model.name.replace(/"/g, '""') + '"',
                    '"' + model.provider.replace(/"/g, '""') + '"',
                    '"' + model.context.replace(/"/g, '""') + '"',
                    '"' + model.parameters.replace(/"/g, '""') + '"',
                    '"' + model.pricing.input.replace(/"/g, '""') + '"',
                    '"' + model.pricing.output.replace(/"/g, '""') + '"',
                    '"' + model.capabilities.join('; ').replace(/"/g, '""') + '"',
                    '"' + model.description.replace(/"/g, '""') + '"',
                    '"' + model.url.replace(/"/g, '""') + '"'
                ].join(','))
            ].join('\\n');
            
            const dataBlob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'openrouter-real-models.csv';
            link.click();
        }
    </script>
</body>
</html>`;
  
  await fs.writeFile('openrouter-real-models.html', html);
  console.log('📄 HTML таблица создана: openrouter-real-models.html');
}

// Запуск
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
