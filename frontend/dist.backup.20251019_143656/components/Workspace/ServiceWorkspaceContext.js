import { createContext, useContext } from 'react';
export const ServiceWorkspaceContext = createContext(null);
export const useServiceWorkspace = () => {
    const context = useContext(ServiceWorkspaceContext);
    if (!context) {
        throw new Error('useServiceWorkspace must be used within ServiceWorkspaceProvider');
    }
    return context;
};
//# sourceMappingURL=ServiceWorkspaceContext.js.map