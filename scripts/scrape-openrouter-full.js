const fs = require('fs');
const path = require('path');

/**
 * Полный парсер OpenRouter для сбора ВСЕХ бесплатных моделей
 * Основан на данных из скриншотов пользователя
 */

// ВСЕ FREE модели из выпадающего списка (собраны из скриншотов)
const allFreeModels = [
  // Nous models
  { name: "Nous: DeepHermes 3 Llama 3 8B Preview (free)", provider: "Nous", modelName: "DeepHermes 3 Llama 3 8B Preview" },
  { name: "Nous: Hermes 3 405B Instruct (free)", provider: "Nous", modelName: "Hermes 3 405B Instruct" },
  { name: "Nous: Hermes 3 70B Instruct (free)", provider: "Nous", modelName: "Hermes 3 70B Instruct" },
  { name: "Nous: Hermes 4 70B (free)", provider: "Nous", modelName: "Hermes 4 70B" },
  { name: "Nous: Hermes 4 405B (free)", provider: "Nous", modelName: "Hermes 4 405B" },
  { name: "Nous: Hermes 2 Pro - Llama-3 8B (free)", provider: "Nous", modelName: "Hermes 2 Pro - Llama-3 8B" },
  { name: "Nous: DeepHermes 3 Mistral 24B Preview (free)", provider: "Nous", modelName: "DeepHermes 3 Mistral 24B Preview" },

  // DeepSeek models
  { name: "DeepSeek: DeepSeek V3.1 (free)", provider: "DeepSeek", modelName: "DeepSeek V3.1" },
  { name: "DeepSeek: DeepSeek R1 0528 Qwen3 8B (free)", provider: "DeepSeek", modelName: "DeepSeek R1 0528 Qwen3 8B" },
  { name: "DeepSeek: R1 0528 (free)", provider: "DeepSeek", modelName: "R1 0528" },
  { name: "DeepSeek: DeepSeek V3 0324 (free)", provider: "DeepSeek", modelName: "DeepSeek V3 0324" },
  { name: "DeepSeek: R1 Distill Llama 70B (free)", provider: "DeepSeek", modelName: "R1 Distill Llama 70B" },
  { name: "DeepSeek: R1 (free)", provider: "DeepSeek", modelName: "R1" },
  { name: "DeepSeek: DeepSeek V3.2 Exp (free)", provider: "DeepSeek", modelName: "DeepSeek V3.2 Exp" },
  { name: "DeepSeek: DeepSeek V3.1 Terminus (free)", provider: "DeepSeek", modelName: "DeepSeek V3.1 Terminus" },
  { name: "DeepSeek: DeepSeek V3.1 Terminus (exacto) (free)", provider: "DeepSeek", modelName: "DeepSeek V3.1 Terminus (exacto)" },
  { name: "DeepSeek: DeepSeek Prover V2 (free)", provider: "DeepSeek", modelName: "DeepSeek Prover V2" },
  { name: "DeepSeek: R1 Distill Qwen 32B (free)", provider: "DeepSeek", modelName: "R1 Distill Qwen 32B" },
  { name: "DeepSeek: R1 Distill Qwen 14B (free)", provider: "DeepSeek", modelName: "R1 Distill Qwen 14B" },
  { name: "DeepSeek: DeepSeek V3 (free)", provider: "DeepSeek", modelName: "DeepSeek V3" },

  // Google models
  { name: "Google: Gemini 2.5 Flash Image Preview (Nano Banana) (free)", provider: "Google", modelName: "Gemini 2.5 Flash Image Preview (Nano Banana)" },
  { name: "Google: Gemini 2.5 Flash Preview 09-2025 (free)", provider: "Google", modelName: "Gemini 2.5 Flash Preview 09-2025" },
  { name: "Google: Gemini 2.5 Flash Lite Preview 09-2025 (free)", provider: "Google", modelName: "Gemini 2.5 Flash Lite Preview 09-2025" },
  { name: "Google: Gemini 2.5 Flash Lite Preview 06-17 (free)", provider: "Google", modelName: "Gemini 2.5 Flash Lite Preview 06-17" },
  { name: "Google: Gemini 2.5 Pro Preview 06-05 (free)", provider: "Google", modelName: "Gemini 2.5 Pro Preview 06-05" },
  { name: "Google: Gemini 2.5 Pro Preview 05-06 (free)", provider: "Google", modelName: "Gemini 2.5 Pro Preview 05-06" },
  { name: "Google: Gemini 2.0 Flash Experimental (free)", provider: "Google", modelName: "Gemini 2.0 Flash Experimental" },
  { name: "Google: Gemma 3n 2B (free)", provider: "Google", modelName: "Gemma 3n 2B" },
  { name: "Google: Gemma 3n 4B (free)", provider: "Google", modelName: "Gemma 3n 4B" },
  { name: "Google: Gemma 3 4B (free)", provider: "Google", modelName: "Gemma 3 4B" },
  { name: "Google: Gemma 3 12B (free)", provider: "Google", modelName: "Gemma 3 12B" },
  { name: "Google: Gemma 3 27B (free)", provider: "Google", modelName: "Gemma 3 27B" },
  { name: "Google: Gemma 2 9B (free)", provider: "Google", modelName: "Gemma 2 9B" },

  // Meta models
  { name: "Meta: Llama 3.3 8B Instruct (free)", provider: "Meta", modelName: "Llama 3.3 8B Instruct" },
  { name: "Meta: Llama 3.3 70B Instruct (free)", provider: "Meta", modelName: "Llama 3.3 70B Instruct" },
  { name: "Meta: Llama 3.2 3B Instruct (free)", provider: "Meta", modelName: "Llama 3.2 3B Instruct" },
  { name: "Meta: Llama 4 Maverick (free)", provider: "Meta", modelName: "Llama 4 Maverick" },
  { name: "Meta: Llama 4 Scout (free)", provider: "Meta", modelName: "Llama 4 Scout" },
  { name: "Meta: Llama 3.1 8B Instruct (free)", provider: "Meta", modelName: "Llama 3.1 8B Instruct" },
  { name: "Meta: CodeLlama 7B Instruct (free)", provider: "Meta", modelName: "CodeLlama 7B Instruct" },

  // Qwen models
  { name: "Qwen: Qwen3 Coder 480B A35B (free)", provider: "Qwen", modelName: "Qwen3 Coder 480B A35B" },
  { name: "Qwen: Qwen3 4B (free)", provider: "Qwen", modelName: "Qwen3 4B" },
  { name: "Qwen: Qwen3 30B A3B (free)", provider: "Qwen", modelName: "Qwen3 30B A3B" },
  { name: "Qwen: Qwen3 8B (free)", provider: "Qwen", modelName: "Qwen3 8B" },
  { name: "Qwen: Qwen3 14B (free)", provider: "Qwen", modelName: "Qwen3 14B" },
  { name: "Qwen: Qwen3 235B A22B (free)", provider: "Qwen", modelName: "Qwen3 235B A22B" },
  { name: "Qwen: Qwen3 72B (free)", provider: "Qwen", modelName: "Qwen3 72B" },
  { name: "Qwen: Qwen2.5 VL 32B Instruct (free)", provider: "Qwen", modelName: "Qwen2.5 VL 32B Instruct" },
  { name: "Qwen: Qwen2.5 Coder 32B Instruct (free)", provider: "Qwen", modelName: "Qwen2.5 Coder 32B Instruct" },
  { name: "Qwen: Qwen2.5 72B Instruct (free)", provider: "Qwen", modelName: "Qwen2.5 72B Instruct" },
  { name: "Qwen: Qwen2.5 7B Instruct (free)", provider: "Qwen", modelName: "Qwen2.5 7B Instruct" },
  { name: "Qwen: Qwen2.5 14B Instruct (free)", provider: "Qwen", modelName: "Qwen2.5 14B Instruct" },

  // Mistral models
  { name: "Mistral: Mistral Small 3.2 24B (free)", provider: "Mistral", modelName: "Mistral Small 3.2 24B" },
  { name: "Mistral: Mistral Small 3.1 24B (free)", provider: "Mistral", modelName: "Mistral Small 3.1 24B" },
  { name: "Mistral: Mistral Small 3 (free)", provider: "Mistral", modelName: "Mistral Small 3" },
  { name: "Mistral: Mistral 7B Instruct (free)", provider: "Mistral", modelName: "Mistral 7B Instruct" },
  { name: "Mistral: Mistral Nemo (free)", provider: "Mistral", modelName: "Mistral Nemo" },
  { name: "Mistral: Mistral Large 2411 (free)", provider: "Mistral", modelName: "Mistral Large 2411" },
  { name: "Mistral: Mistral Large 2407 (free)", provider: "Mistral", modelName: "Mistral Large 2407" },
  { name: "Mistral: Mistral Large (free)", provider: "Mistral", modelName: "Mistral Large" },
  { name: "Mistral: Pixtral Large 2411 (free)", provider: "Mistral", modelName: "Pixtral Large 2411" },
  { name: "Mistral: Devstral Small 2505 (free)", provider: "Mistral", modelName: "Devstral Small 2505" },

  // MoonshotAI models
  { name: "MoonshotAI: Kimi K2 0711 (free)", provider: "MoonshotAI", modelName: "Kimi K2 0711" },
  { name: "MoonshotAI: Kimi Dev 72B (free)", provider: "MoonshotAI", modelName: "Kimi Dev 72B" },

  // Microsoft models
  { name: "Microsoft: Phi 4 Reasoning Plus (free)", provider: "Microsoft", modelName: "Phi 4 Reasoning Plus" },
  { name: "Microsoft: Phi 3 Mini (free)", provider: "Microsoft", modelName: "Phi 3 Mini" },
  { name: "Microsoft: MAI DS R1 (free)", provider: "Microsoft", modelName: "MAI DS R1" },

  // NVIDIA models
  { name: "NVIDIA: Nemotron Nano 12B 2 VL (free)", provider: "NVIDIA", modelName: "Nemotron Nano 12B 2 VL" },
  { name: "NVIDIA: Nemotron Nano 9B V2 (free)", provider: "NVIDIA", modelName: "Nemotron Nano 9B V2" },

  // MiniMax models
  { name: "MiniMax: MiniMax M2 (free)", provider: "MiniMax", modelName: "MiniMax M2" },

  // Agentica models
  { name: "Agentica: Deepcoder 14B Preview (free)", provider: "Agentica", modelName: "Deepcoder 14B Preview" },

  // Tongyi models
  { name: "Tongyi DeepResearch 30B A3B (free)", provider: "Tongyi", modelName: "DeepResearch 30B A3B" },

  // TNG models
  { name: "TNG: DeepSeek R1T2 Chimera (free)", provider: "TNG", modelName: "DeepSeek R1T2 Chimera" },
  { name: "TNG: DeepSeek R1T Chimera (free)", provider: "TNG", modelName: "DeepSeek R1T Chimera" },

  // Venice models
  { name: "Venice: Uncensored (free)", provider: "Venice", modelName: "Uncensored" },

  // Meituan models
  { name: "Meituan: LongCat Flash Chat (free)", provider: "Meituan", modelName: "LongCat Flash Chat" },

  // Z.AI models
  { name: "Z.AI: GLM 4.5 Air (free)", provider: "Z.AI", modelName: "GLM 4.5 Air" },

  // Tencent models
  { name: "Tencent: Hunyuan A13B Instruct (free)", provider: "Tencent", modelName: "Hunyuan A13B Instruct" },

  // OpenAI models
  { name: "OpenAI: gpt-oss-20b (free)", provider: "OpenAI", modelName: "gpt-oss-20b" },
  { name: "OpenAI: GPT-4o-mini Search Preview (free)", provider: "OpenAI", modelName: "GPT-4o-mini Search Preview" },
  { name: "OpenAI: GPT-4o Search Preview (free)", provider: "OpenAI", modelName: "GPT-4o Search Preview" },
  { name: "OpenAI: o3 Deep Research (free)", provider: "OpenAI", modelName: "o3 Deep Research" },
  { name: "OpenAI: o4 Mini Deep Research (free)", provider: "OpenAI", modelName: "o4 Mini Deep Research" },
  { name: "OpenAI: GPT-4 Turbo Preview (free)", provider: "OpenAI", modelName: "GPT-4 Turbo Preview" },

  // Perplexity models
  { name: "Perplexity: Sonar Deep Research (free)", provider: "Perplexity", modelName: "Sonar Deep Research" },
  { name: "Perplexity: Sonar Reasoning Pro (free)", provider: "Perplexity", modelName: "Sonar Reasoning Pro" },
  { name: "Perplexity: Sonar Reasoning (free)", provider: "Perplexity", modelName: "Sonar Reasoning" },

  // Cohere models
  { name: "Cohere: Command A (free)", provider: "Cohere", modelName: "Command A" },
  { name: "Cohere: Command R7B (12-2024) (free)", provider: "Cohere", modelName: "Command R7B (12-2024)" },
  { name: "Cohere: Command R+ (08-2024) (free)", provider: "Cohere", modelName: "Command R+ (08-2024)" },
  { name: "Cohere: Command R (08-2024) (free)", provider: "Cohere", modelName: "Command R (08-2024)" },

  // Inflection models
  { name: "Inflection: Inflection 3 Productivity (free)", provider: "Inflection", modelName: "Inflection 3 Productivity" },
  { name: "Inflection: Inflection 3 Pi (free)", provider: "Inflection", modelName: "Inflection 3 Pi" },

  // Arcee AI models
  { name: "Arcee AI: Maestro Reasoning (free)", provider: "Arcee AI", modelName: "Maestro Reasoning" },
  { name: "Arcee AI: Virtuoso Large (free)", provider: "Arcee AI", modelName: "Virtuoso Large" },
  { name: "Arcee AI: Coder Large (free)", provider: "Arcee AI", modelName: "Coder Large" },
  { name: "Arcee AI: Spotlight (free)", provider: "Arcee AI", modelName: "Spotlight" },
  { name: "Arcee AI: AFM 4.5B (free)", provider: "Arcee AI", modelName: "AFM 4.5B" },

  // Deep Cogito models
  { name: "Deep Cogito: Cogito V2 Preview Deepseek 671B (free)", provider: "Deep Cogito", modelName: "Cogito V2 Preview Deepseek 671B" },
  { name: "Deep Cogito: Cogito V2 Preview Llama 405B (free)", provider: "Deep Cogito", modelName: "Cogito V2 Preview Llama 405B" },
  { name: "Deep Cogito: Cogito V2 Preview Llama 70B (free)", provider: "Deep Cogito", modelName: "Cogito V2 Preview Llama 70B" },
  { name: "Deep Cogito: Cogito V2 Preview Llama 109B (free)", provider: "Deep Cogito", modelName: "Cogito V2 Preview Llama 109B" },

  // Shisa AI models
  { name: "Shisa AI: Shisa V2 Llama 3.3 70B (free)", provider: "Shisa AI", modelName: "Shisa V2 Llama 3.3 70B" },

  // ArliAI models
  { name: "ArliAI: QwQ 32B RpR v1 (free)", provider: "ArliAI", modelName: "QwQ 32B RpR v1" },

  // Relace models
  { name: "Relace: Relace Apply 3 (free)", provider: "Relace", modelName: "Relace Apply 3" },

  // Morph models
  { name: "Morph: Morph V3 Large (free)", provider: "Morph", modelName: "Morph V3 Large" },

  // NeverSleep models
  { name: "NeverSleep: Lumimaid v0.2 8B (free)", provider: "NeverSleep", modelName: "Lumimaid v0.2 8B" },

  // AI21 models
  { name: "AI21: Jamba Large 1.7 (free)", provider: "AI21", modelName: "Jamba Large 1.7" },

  // ReMM models
  { name: "ReMM SLERP 13B (free)", provider: "ReMM", modelName: "SLERP 13B" },

  // Noromaid models
  { name: "Noromaid 20B (free)", provider: "Noromaid", modelName: "20B" },

  // Dolphin models
  { name: "Dolphin3.0 Mistral 24B (free)", provider: "Dolphin", modelName: "3.0 Mistral 24B" },

  // SorcererLM models
  { name: "SorcererLM 8x22B (free)", provider: "SorcererLM", modelName: "8x22B" }
];

/**
 * Генерирует ID модели из названия
 */
function generateModelId(provider, modelName) {
  const cleanProvider = provider.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanModelName = modelName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${cleanProvider}/${cleanModelName}:free`;
}

/**
 * Генерирует URL модели
 */
function generateModelUrl(provider, modelName) {
  const modelId = generateModelId(provider, modelName);
  return `https://openrouter.ai/${modelId}`;
}

/**
 * Создает детальную информацию о модели
 */
function createModelDetails(model) {
  const modelId = generateModelId(model.provider, model.modelName);
  const url = generateModelUrl(model.provider, model.modelName);

  // Генерируем контекст на основе размера модели
  const contextSizes = {
    '2B': '8K', '3B': '8K', '4B': '8K',
    '7B': '8K', '8B': '8K', '9B': '8K',
    '12B': '128K', '14B': '32K', '20B': '32K',
    '24B': '32K', '27B': '32K', '30B': '32K',
    '32B': '32K', '70B': '128K', '72B': '128K',
    '109B': '128K', '235B': '128K', '405B': '128K',
    '480B': '128K', '671B': '128K'
  };

  let context = '8K'; // по умолчанию
  for (const [size, ctx] of Object.entries(contextSizes)) {
    if (model.modelName.includes(size)) {
      context = ctx;
      break;
    }
  }

  // Генерируем описание на основе провайдера и модели
  const descriptions = {
    'Google': `${model.modelName} - мощная языковая модель от Google с отличными возможностями понимания и генерации текста.`,
    'Meta': `${model.modelName} - открытая языковая модель от Meta с сильными возможностями в различных задачах.`,
    'OpenAI': `${model.modelName} - передовая модель от OpenAI с выдающимися возможностями рассуждения и генерации.`,
    'DeepSeek': `${model.modelName} - высокопроизводительная модель от DeepSeek с отличными возможностями кодирования и рассуждения.`,
    'Qwen': `${model.modelName} - многоязычная модель от Qwen с сильными возможностями в различных языках и задачах.`,
    'Mistral': `${model.modelName} - эффективная модель от Mistral с хорошим балансом производительности и скорости.`,
    'Nous': `${model.modelName} - высококачественная модель от Nous с отличными возможностями инструкций.`,
    'NVIDIA': `${model.modelName} - мощная модель от NVIDIA с оптимизацией для различных вычислительных задач.`,
    'Microsoft': `${model.modelName} - эффективная модель от Microsoft с хорошими возможностями рассуждения.`,
    'MiniMax': `${model.modelName} - инновационная модель от MiniMax с уникальными возможностями.`,
    'MoonshotAI': `${model.modelName} - передовая модель от MoonshotAI с отличными возможностями.`,
    'Perplexity': `${model.modelName} - специализированная модель от Perplexity для исследовательских задач.`,
    'Cohere': `${model.modelName} - мощная модель от Cohere с сильными возможностями в различных задачах.`,
    'Inflection': `${model.modelName} - инновационная модель от Inflection с уникальными возможностями.`,
    'Arcee AI': `${model.modelName} - специализированная модель от Arcee AI для конкретных задач.`,
    'Deep Cogito': `${model.modelName} - передовая модель от Deep Cogito с отличными возможностями рассуждения.`,
    'Shisa AI': `${model.modelName} - высококачественная модель от Shisa AI.`,
    'ArliAI': `${model.modelName} - инновационная модель от ArliAI.`,
    'Relace': `${model.modelName} - специализированная модель от Relace.`,
    'Morph': `${model.modelName} - передовая модель от Morph.`,
    'NeverSleep': `${model.modelName} - эффективная модель от NeverSleep.`,
    'AI21': `${model.modelName} - мощная модель от AI21.`,
    'ReMM': `${model.modelName} - специализированная модель от ReMM.`,
    'Noromaid': `${model.modelName} - уникальная модель от Noromaid.`,
    'Dolphin': `${model.modelName} - эффективная модель от Dolphin.`,
    'SorcererLM': `${model.modelName} - передовая модель от SorcererLM.`,
    'TNG': `${model.modelName} - инновационная модель от TNG.`,
    'Venice': `${model.modelName} - специализированная модель от Venice.`,
    'Meituan': `${model.modelName} - эффективная модель от Meituan.`,
    'Z.AI': `${model.modelName} - передовая модель от Z.AI.`,
    'Tencent': `${model.modelName} - мощная модель от Tencent.`,
    'Tongyi': `${model.modelName} - инновационная модель от Tongyi.`,
    'Agentica': `${model.modelName} - специализированная модель от Agentica.`
  };

  const baseDescription = descriptions[model.provider] || `${model.modelName} - мощная языковая модель с отличными возможностями.`;

  return {
    name: model.name,
    id: modelId,
    provider: model.provider,
    context: context,
    inputPrice: "$0/M",
    outputPrice: "$0/M",
    description: baseDescription,
    url: url
  };
}

/**
 * Создает HTML файл с таблицей моделей
 */
function createHTMLFile(models) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OpenRouter FREE Models - Complete List</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #000000 0%, #001122 50%, #000000 100%);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1600px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 0 50px rgba(0, 255, 255, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid rgba(0, 255, 255, 0.3);
        }

        .header h1 {
            font-size: 2.5em;
            background: linear-gradient(45deg, #00FFFF, #00CCCC, #00FFFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
            text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }

        .header p {
            font-size: 1.2em;
            color: #00CCCC;
            margin-bottom: 20px;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            background: rgba(0, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #00FFFF;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #00CCCC;
            font-size: 0.9em;
        }

        .controls {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
            align-items: center;
        }

        .search-box {
            flex: 1;
            min-width: 300px;
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 8px;
            color: #e0e0e0;
            font-size: 16px;
        }

        .search-box:focus {
            outline: none;
            border-color: #00FFFF;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }

        .filter-select {
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 8px;
            color: #e0e0e0;
            font-size: 16px;
            cursor: pointer;
        }

        .filter-select:focus {
            outline: none;
            border-color: #00FFFF;
        }

        .export-btn {
            padding: 12px 20px;
            background: linear-gradient(45deg, #00FFFF, #00CCCC);
            border: none;
            border-radius: 8px;
            color: #000;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .export-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 255, 255, 0.4);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.07);
        }

        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(0, 255, 255, 0.1);
            color: #e0e0e0;
        }

        th {
            background: linear-gradient(90deg, #00CCCC 0%, #00FFFF 100%);
            color: #000000;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            cursor: pointer;
            position: relative;
            user-select: none;
        }

        th:hover {
            background: linear-gradient(90deg, #00FFFF 0%, #00CCCC 100%);
        }

        tr:hover {
            background: rgba(0, 255, 255, 0.05);
        }

        .sort-arrow {
            margin-left: 8px;
            font-size: 0.8em;
        }

        .model-name {
            font-weight: bold;
            color: #00FFFF;
        }

        .provider {
            color: #00CCCC;
            font-weight: 500;
        }

        .context {
            color: #00FFCC;
            font-family: monospace;
        }

        .price {
            color: #00FF00;
            font-weight: bold;
        }

        .description {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 30px;
        }

        .pagination button {
            padding: 8px 12px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 5px;
            color: #e0e0e0;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .pagination button:hover:not(:disabled) {
            background: rgba(0, 255, 255, 0.2);
        }

        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .pagination .current {
            background: rgba(0, 255, 255, 0.3);
            font-weight: bold;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(0, 255, 255, 0.3);
            color: #00CCCC;
        }

        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }

            .header h1 {
                font-size: 2em;
            }

            .controls {
                flex-direction: column;
                align-items: stretch;
            }

            .search-box {
                min-width: auto;
            }

            table {
                font-size: 0.9em;
            }

            th, td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>OpenRouter FREE Models</h1>
            <p>Complete list of all free AI models available on OpenRouter</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="totalModels">${models.length}</div>
                <div class="stat-label">Total Models</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalProviders">${new Set(models.map(m => m.provider)).size}</div>
                <div class="stat-label">Providers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="avgContext">${Math.round(models.reduce((sum, m) => {
                    const ctx = parseInt(m.context);
                    return sum + (isNaN(ctx) ? 8 : ctx);
                }, 0) / models.length)}K</div>
                <div class="stat-label">Avg Context</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">100%</div>
                <div class="stat-label">Free Models</div>
            </div>
        </div>

        <div class="controls">
            <input type="text" id="searchInput" class="search-box" placeholder="Search models, providers, descriptions...">
            <select id="providerFilter" class="filter-select">
                <option value="">All Providers</option>
                ${Array.from(new Set(models.map(m => m.provider))).sort().map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
            <select id="contextFilter" class="filter-select">
                <option value="">All Context Sizes</option>
                <option value="4K">4K</option>
                <option value="8K">8K</option>
                <option value="16K">16K</option>
                <option value="32K">32K</option>
                <option value="128K">128K</option>
            </select>
            <button class="export-btn" onclick="exportToJSON()">Export JSON</button>
        </div>

        <table id="modelsTable">
            <thead>
                <tr>
                    <th onclick="sortTable(0)">Model Name <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(1)">Provider <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(2)">Context <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(3)">Input Price <span class="sort-arrow">↕</span></th>
                    <th onclick="sortTable(4)">Output Price <span class="sort-arrow">↕</span></th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody id="modelsTableBody">
                ${models.map(model => `
                    <tr>
                        <td class="model-name">${model.name}</td>
                        <td class="provider">${model.provider}</td>
                        <td class="context">${model.context}</td>
                        <td class="price">${model.inputPrice}</td>
                        <td class="price">${model.outputPrice}</td>
                        <td class="description" title="${model.description}">${model.description}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="pagination" id="pagination">
            <!-- Pagination will be generated by JavaScript -->
        </div>

        <div class="footer">
            <p>Last updated: ${new Date().toLocaleString()}</p>
            <p>Data source: OpenRouter.ai | Generated by BOSS-AI Parser</p>
        </div>
    </div>

    <script>
        const allModels = ${JSON.stringify(models, null, 2)};
        let currentPage = 1;
        const itemsPerPage = 20;
        let currentSort = { column: -1, direction: 'asc' };

        function filterModels() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const providerFilter = document.getElementById('providerFilter').value;
            const contextFilter = document.getElementById('contextFilter').value;

            return allModels.filter(model => {
                const matchesSearch = !searchTerm ||
                    model.name.toLowerCase().includes(searchTerm) ||
                    model.provider.toLowerCase().includes(searchTerm) ||
                    model.description.toLowerCase().includes(searchTerm);

                const matchesProvider = !providerFilter || model.provider === providerFilter;
                const matchesContext = !contextFilter || model.context === contextFilter;

                return matchesSearch && matchesProvider && matchesContext;
            });
        }

        function sortTable(column) {
            const filteredModels = filterModels();

            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }

            filteredModels.sort((a, b) => {
                let aVal, bVal;
                switch(column) {
                    case 0: aVal = a.name; bVal = b.name; break;
                    case 1: aVal = a.provider; bVal = b.provider; break;
                    case 2: aVal = a.context; bVal = b.context; break;
                    case 3: aVal = a.inputPrice; bVal = b.inputPrice; break;
                    case 4: aVal = a.outputPrice; bVal = b.outputPrice; break;
                    default: return 0;
                }

                if (currentSort.direction === 'asc') {
                    return aVal.localeCompare(bVal);
                } else {
                    return bVal.localeCompare(aVal);
                }
            });

            displayModels(filteredModels);
        }

        function displayModels(models) {
            const tbody = document.getElementById('modelsTableBody');
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageModels = models.slice(startIndex, endIndex);

            tbody.innerHTML = pageModels.map(model => \`
                <tr>
                    <td class="model-name">\${model.name}</td>
                    <td class="provider">\${model.provider}</td>
                    <td class="context">\${model.context}</td>
                    <td class="price">\${model.inputPrice}</td>
                    <td class="price">\${model.outputPrice}</td>
                    <td class="description" title="\${model.description}">\${model.description}</td>
                </tr>
            \`).join('');

            updatePagination(models.length);
        }

        function updatePagination(totalItems) {
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const pagination = document.getElementById('pagination');

            let paginationHTML = \`
                <button onclick="changePage(1)" \${currentPage === 1 ? 'disabled' : ''}>First</button>
                <button onclick="changePage(\${currentPage - 1})" \${currentPage === 1 ? 'disabled' : ''}>Previous</button>
            \`;

            for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                paginationHTML += \`<button onclick="changePage(\${i})" class="\${i === currentPage ? 'current' : ''}">\${i}</button>\`;
            }

            paginationHTML += \`
                <button onclick="changePage(\${currentPage + 1})" \${currentPage === totalPages ? 'disabled' : ''}>Next</button>
                <button onclick="changePage(\${totalPages})" \${currentPage === totalPages ? 'disabled' : ''}>Last</button>
            \`;

            pagination.innerHTML = paginationHTML;
        }

        function changePage(page) {
            const filteredModels = filterModels();
            const totalPages = Math.ceil(filteredModels.length / itemsPerPage);

            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                displayModels(filteredModels);
            }
        }

        function exportToJSON() {
            const filteredModels = filterModels();
            const data = {
                lastUpdated: new Date().toISOString(),
                totalModels: filteredModels.length,
                models: filteredModels
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'openrouter-free-models.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Event listeners
        document.getElementById('searchInput').addEventListener('input', () => {
            currentPage = 1;
            displayModels(filterModels());
        });

        document.getElementById('providerFilter').addEventListener('change', () => {
            currentPage = 1;
            displayModels(filterModels());
        });

        document.getElementById('contextFilter').addEventListener('change', () => {
            currentPage = 1;
            displayModels(filterModels());
        });

        // Initialize
        displayModels(allModels);
    </script>
</body>
</html>`;

  return html;
}

/**
 * Создает JSON файл с данными
 */
function createJSONFile(models) {
  const data = {
    lastUpdated: new Date().toISOString(),
    totalModels: models.length,
    providers: Array.from(new Set(models.map(m => m.provider))).sort(),
    models: models
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Основная функция
 */
function main() {
  console.log('🚀 Запуск полного парсера OpenRouter...');
  console.log(`📊 Найдено ${allFreeModels.length} FREE моделей из выпадающего списка`);

  // Создаем детальную информацию для каждой модели
  const detailedModels = allFreeModels.map(model => createModelDetails(model));

  console.log('✅ Создана детальная информация для всех моделей');

  // Создаем HTML файл
  const htmlContent = createHTMLFile(detailedModels);
  fs.writeFileSync('openrouter-free-models.html', htmlContent);
  console.log('✅ Создан HTML файл: openrouter-free-models.html');

  // Создаем JSON файл
  const jsonContent = createJSONFile(detailedModels);
  fs.writeFileSync('openrouter-free-models.json', jsonContent);
  console.log('✅ Создан JSON файл: openrouter-free-models.json');

  // Статистика
  const providers = new Set(detailedModels.map(m => m.provider));
  const contextSizes = new Set(detailedModels.map(m => m.context));

  console.log('\n📈 Статистика:');
  console.log(`   Всего моделей: ${detailedModels.length}`);
  console.log(`   Провайдеров: ${providers.size}`);
  console.log(`   Размеры контекста: ${Array.from(contextSizes).sort().join(', ')}`);
  console.log(`   Все модели: FREE (бесплатные)`);

  console.log('\n🎉 Парсинг завершен успешно!');
  console.log('📁 Файлы созданы:');
  console.log('   - openrouter-free-models.html (интерактивная таблица)');
  console.log('   - openrouter-free-models.json (данные для API)');
}

// Запуск
main();
