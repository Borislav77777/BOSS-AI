/**
 * Модуль RAPTOR Engine
 * Рекурсивная кластеризация и древовидная организация
 */
export const RaptorEngine = {
    id: 'raptor-engine',
    name: 'RAPTOR Engine',
    description: 'Рекурсивная кластеризация и древовидная организация данных',
    position: { x: 0, y: 1 },
    dependencies: ['input-system'],
    isVisible: true,
    isExpanded: true,
    mermaidCode: `
    %% ================ RAPTOR ENGINE ================ %%
    subgraph RAPTOR_SYSTEM["🌳 RAPTOR ENGINE"]
        ROUTER --> ENHANCED_QPROC["🧠 Расширенный обработчик<br>• SlangDictionary<br>• ContextAnalyzer<br>• SynonymExpander<br>• LegalTerminologyManager"]

        ENHANCED_QPROC --> RAPTOR_ENGINE["🌳 RAPTOR Engine<br>• Рекурсивная кластеризация<br>• Древовидная организация<br>• Генерация абстракций<br>• Оптимизированный поиск"]

        RAPTOR_ENGINE --> RAPTOR_TREE["🌳 RAPTOR Tree<br>• Иерархическая структура<br>• Рекурсивные узлы<br>• Абстракции по уровням"]

        RAPTOR_ENGINE --> RAPTOR_CLUSTERING["🔗 RAPTOR Clustering<br>• K-means кластеризация<br>• Семантическое группирование<br>• Адаптивные пороги"]
    end

    %% Стилизация
    classDef raptor fill:#fbbf24,stroke:#f59e0b,stroke-width:3px
    class RAPTOR_ENGINE,RAPTOR_TREE,RAPTOR_CLUSTERING raptor
  `
};
//# sourceMappingURL=raptorEngineModule.js.map