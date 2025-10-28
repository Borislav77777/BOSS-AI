import React from 'react';
interface DocumentEditorProps {
    isOpen: boolean;
    document: {
        id: string;
        title: string;
        content: string;
    } | null;
    onSave: (id: string, title: string, content: string) => void;
    onClose: () => void;
    className?: string;
}
/**
 * Редактор документов с возможностью редактирования содержимого
 */
export declare const DocumentEditor: React.FC<DocumentEditorProps>;
export {};
//# sourceMappingURL=DocumentEditor.d.ts.map