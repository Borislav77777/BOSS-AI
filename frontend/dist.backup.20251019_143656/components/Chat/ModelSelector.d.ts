import React from 'react';
interface Model {
    id: string;
    name: string;
    description: string;
    cost: string;
    isDefault?: boolean;
}
interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    models: Model[];
    className?: string;
}
export declare const ModelSelector: React.FC<ModelSelectorProps>;
export {};
//# sourceMappingURL=ModelSelector.d.ts.map