import { cn } from '@/utils';
import { ChevronDown, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

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

export const ModelSelector: React.FC<ModelSelectorProps> = ({
    selectedModel,
    onModelChange,
    models,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedModelData = models.find(model => model.id === selectedModel) || models[0];

    const handleModelSelect = (modelId: string) => {
        onModelChange(modelId);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg",
                    "bg-surface/50 border border-border/50 hover:bg-surface/70",
                    "transition-all duration-200 text-sm"
                )}
            >
                <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium">{selectedModelData?.name}</span>
                </div>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50">
                    {models.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id)}
                            className={cn(
                                "w-full flex items-start justify-between px-3 py-2 text-left",
                                "hover:bg-surface/50 transition-colors duration-200",
                                "first:rounded-t-lg last:rounded-b-lg",
                                selectedModel === model.id && "bg-primary/10"
                            )}
                        >
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium text-sm">{model.name}</span>
                                    {model.isDefault && (
                                        <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                                            По умолчанию
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    {model.description}
                                </p>
                            </div>
                            <div className="ml-2">
                                <span className={cn(
                                    "text-xs px-1.5 py-0.5 rounded",
                                    model.cost === 'low' && "bg-green-500/20 text-green-500",
                                    model.cost === 'medium' && "bg-yellow-500/20 text-yellow-500",
                                    model.cost === 'high' && "bg-red-500/20 text-red-500"
                                )}>
                                    {model.cost === 'low' && 'Эконом'}
                                    {model.cost === 'medium' && 'Средне'}
                                    {model.cost === 'high' && 'Дорого'}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
