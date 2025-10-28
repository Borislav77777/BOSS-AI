import React, { useMemo } from 'react';
import { PhotoStudioPanel } from './PhotoStudioPanel';

export const PhotoStudioService: React.FC = () => {
    const config = useMemo(() => {
        // serviceRegistry отключен, используем пустой конфиг
        return {};
    }, []);

    const defaults = config?.settings || {};

    return (
        <div className="h-full w-full">
            <PhotoStudioPanel defaults={defaults} />
        </div>
    );
};

export default PhotoStudioService;
