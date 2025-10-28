import * as React from 'react';
import './ArchitectureDiagram.css';
export declare const ArchitectureDiagram: React.FC;
declare global {
    interface Window {
        mermaid: {
            initialize: (config: Record<string, unknown>) => void;
            render: (id: string, definition: string) => Promise<{
                svg: string;
            }>;
        };
    }
}
//# sourceMappingURL=ArchitectureDiagram.d.ts.map