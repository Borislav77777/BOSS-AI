import { jsx as _jsx } from "react/jsx-runtime";
import { serviceManager } from '@/services/ServiceManager';
import React, { useMemo } from 'react';
import { PhotoStudioPanel } from './PhotoStudioPanel';
export const PhotoStudioService = () => {
    const config = useMemo(() => {
        const svc = serviceManager.getServiceInfo('photo-studio');
        return svc?.config || {};
    }, []);
    const defaults = config?.settings || {};
    return (_jsx("div", { className: "h-full w-full", children: _jsx(PhotoStudioPanel, { defaults: defaults }) }));
};
export default PhotoStudioService;
//# sourceMappingURL=PhotoStudioService.js.map