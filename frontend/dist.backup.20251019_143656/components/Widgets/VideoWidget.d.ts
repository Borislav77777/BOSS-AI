import React from 'react';
interface VideoWidgetProps {
    onClose?: () => void;
    settings?: {
        showVideo: boolean;
        autoPlay: boolean;
        showControls: boolean;
    };
}
declare const VideoWidget: React.FC<VideoWidgetProps>;
export default VideoWidget;
//# sourceMappingURL=VideoWidget.d.ts.map