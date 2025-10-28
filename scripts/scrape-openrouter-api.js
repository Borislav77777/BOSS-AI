const fs = require('fs').promises;

/**
 * Парсер OpenRouter через API
 * 
 * Использует OpenRouter API для получения списка всех моделей,
 * затем фильтрует бесплатные и сопоставляет с нашими скриншотами
 */

async function fetchOpenRouterModels() {
  console.log('🌐 Получаем список моделей через OpenRouter API...');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Получено ${data.data.length} моделей из API`);
    return data.data;
    
  } catch (error) {
    console.error('❌ Ошибка получения данных из API:', error);
    return [];
  }
}

function filterFreeModels(models) {
  console.log('🔍 Фильтруем бесплатные модели...');
  
  const freeModels = models.filter(model => {
    // Проверяем что модель бесплатная
    const pricing = model.pricing;
    if (!pricing) return false;
    
    const inputPrice = parseFloat(pricing.prompt) || 0;
    const outputPrice = parseFloat(pricing.completion) || 0;
    
    return inputPrice === 0 && outputPrice === 0;
  });
  
  console.log(`✅ Найдено ${freeModels.length} бесплатных моделей`);
  return freeModels;
}

function matchWithScreenshots(apiModels, screenshotModels) {
  console.log('🔗 Сопоставляем модели из API с скриншотами...');
  
  const matchedModels = [];
  const unmatchedScreenshots = [];
  
  for (const screenshotModel of screenshotModels) {
    const screenshotName = screenshotModel.name;
    const cleanScreenshotName = screenshotName.replace(' (free)', '').trim();
    
    // Ищем совпадение в API моделях
    const matchedModel = apiModels.find(apiModel => {
      const apiName = apiModel.name || apiModel.id;
      
      // Различные варианты совпадения
      return apiName.includes(cleanScreenshotName) ||
             cleanScreenshotName.includes(apiName) ||
             apiName.toLowerCase().includes(cleanScreenshotName.toLowerCase()) ||
             cleanScreenshotName.toLowerCase().includes(apiName.toLowerCase());
    });
    
    if (matchedModel) {
      matchedModels.push({
        // Данные из API
        id: matchedModel.id,
        name: matchedModel.name,
        provider: matchedModel.id.split('/')[0],
        contextLength: matchedModel.context_length,
        pricing: matchedModel.pricing,
        
        // Данные из скриншота
        searchName: screenshotName,
        
        // Ссылка на модель
        url: `https://openrouter.ai/models/${matchedModel.id}`,
        
        // Метаданные
        scrapedAt: new Date().toISOString(),
        source: 'api'
      });
      
      console.log(`✅ Совпадение: ${screenshotName} -> ${matchedModel.name}`);
    } else {
      unmatchedScreenshots.push(screenshotModel);
      console.log(`❌ Не найдено: ${screenshotName}`);
    }
  }
  
  console.log(`✅ Сопоставлено: ${matchedModels.length} моделей`);
  console.log(`❌ Не сопоставлено: ${unmatchedScreenshots.length} моделей`);
  
  return { matchedModels, unmatchedScreenshots };
}

async function loadScreenshotModels() {
  try {
    const data = await fs.readFile('openrouter-all-models.json', 'utf8');
    const jsonData = JSON.parse(data);
    console.log(`📋 Загружено ${jsonData.models.length} моделей из скриншотов`);
    return jsonData.models;
  } catch (error) {
    console.error('❌ Ошибка загрузки моделей из скриншотов:', error);
    return [];
  }
}

async function generateHTMLTable(models) {
  console.log('📄 Генерируем HTML таблицу...');
  
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenRouter - Модели через API (${models.length})</title>
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
        
        .context-length {
            color: #00FFFF;
            font-weight: 500;
        }
        
        .pricing {
            color: #00CCCC;
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
            <h1>OpenRouter - Модели через API</h1>
            <p>Настоящие данные из OpenRouter API с точными ссылками</p>
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
                    <div class="stat-number">${models.filter(m => m.contextLength > 100000).length}</div>
                    <div>Длинный контекст</div>
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
                    <th onclick="sortTable(3)">Цена (вход/выход) <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(4)">ID модели <span class="sort-arrow">↕</span></th>
                    <th>Ссылка</th>
                </tr>
            </thead>
            <tbody>
                ${models.map(model => `
                    <tr>
                        <td class="model-name">${model.name}</td>
                        <td class="provider">${model.provider}</td>
                        <td class="context-length">${model.contextLength ? model.contextLength.toLocaleString() : 'Unknown'}</td>
                        <td class="pricing">${model.pricing.prompt} / ${model.pricing.completion}</td>
                        <td>${model.id}</td>
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
            link.download = 'openrouter-api-models.json';
            link.click();
        }
        
        function exportToCSV() {
            const headers = ['Название', 'Провайдер', 'Контекст', 'Цена вход', 'Цена выход', 'ID модели', 'Ссылка'];
            const csvContent = [
                headers.join(','),
                ...currentData.map(model => [
                    '"' + model.name.replace(/"/g, '""') + '"',
                    '"' + model.provider.replace(/"/g, '""') + '"',
                    '"' + (model.contextLength || 'Unknown').toString().replace(/"/g, '""') + '"',
                    '"' + model.pricing.prompt.replace(/"/g, '""') + '"',
                    '"' + model.pricing.completion.replace(/"/g, '""') + '"',
                    '"' + model.id.replace(/"/g, '""') + '"',
                    '"' + model.url.replace(/"/g, '""') + '"'
                ].join(','))
            ].join('\\n');
            
            const dataBlob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'openrouter-api-models.csv';
            link.click();
        }
    </script>
</body>
</html>`;
  
  await fs.writeFile('openrouter-api-models.html', html);
  console.log('📄 HTML таблица создана: openrouter-api-models.html');
}

async function main() {
  console.log('🚀 Запуск парсера OpenRouter через API...');
  
  try {
    // 1. Получаем модели из API
    const apiModels = await fetchOpenRouterModels();
    if (apiModels.length === 0) {
      console.error('❌ Не удалось получить модели из API');
      return;
    }
    
    // 2. Фильтруем бесплатные модели
    const freeModels = filterFreeModels(apiModels);
    
    // 3. Загружаем модели из скриншотов
    const screenshotModels = await loadScreenshotModels();
    
    // 4. Сопоставляем модели
    const { matchedModels, unmatchedScreenshots } = matchWithScreenshots(freeModels, screenshotModels);
    
    // 5. Сохраняем результаты
    await fs.writeFile(
      'openrouter-api-models.json',
      JSON.stringify({
        lastUpdated: new Date().toISOString(),
        totalMatched: matchedModels.length,
        totalUnmatched: unmatchedScreenshots.length,
        totalFreeModels: freeModels.length,
        models: matchedModels
      }, null, 2)
    );
    
    await fs.writeFile(
      'openrouter-unmatched-models.json',
      JSON.stringify({
        lastUpdated: new Date().toISOString(),
        totalUnmatched: unmatchedScreenshots.length,
        unmatchedModels: unmatchedScreenshots
      }, null, 2)
    );
    
    // 6. Генерируем HTML таблицу
    await generateHTMLTable(matchedModels);
    
    console.log('\n🎉 Парсинг через API завершен!');
    console.log(`✅ Сопоставлено: ${matchedModels.length} моделей`);
    console.log(`❌ Не сопоставлено: ${unmatchedScreenshots.length} моделей`);
    console.log(`📄 HTML таблица: openrouter-api-models.html`);
    console.log(`📄 JSON данные: openrouter-api-models.json`);
    console.log(`📄 Несопоставленные: openrouter-unmatched-models.json`);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

// Запуск
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
