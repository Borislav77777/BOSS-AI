import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw } from 'lucide-react';
const VideoWidget = ({ onClose, settings = {} }) => {
    const [showVideo, setShowVideo] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef(null);
    const { autoPlay = true, showControls = false } = settings;
    const VIDEO_WATCHED_KEY = 'boss-ai-intro-video-watched';
    useEffect(() => {
        // Проверяем, было ли видео уже просмотрено
        const hasWatchedVideo = localStorage.getItem(VIDEO_WATCHED_KEY) === 'true';
        if (!hasWatchedVideo) {
            setShowVideo(true);
        }
        else {
            setVideoEnded(true);
        }
        setIsLoading(false);
    }, []);
    const handleVideoEnd = () => {
        // Сохраняем, что видео было просмотрено
        localStorage.setItem(VIDEO_WATCHED_KEY, 'true');
        setShowVideo(false);
        setVideoEnded(true);
    };
    const handleVideoError = () => {
        console.error('Ошибка загрузки видео');
        setShowVideo(false);
        setVideoEnded(true);
    };
    const resetVideo = () => {
        localStorage.removeItem(VIDEO_WATCHED_KEY);
        setVideoEnded(false);
        setShowVideo(true);
    };
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-black/20 rounded-lg", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-white" }) }));
    }
    return (_jsxs("div", { className: "relative w-full h-full bg-black/20 rounded-lg overflow-hidden", children: [_jsx("button", { onClick: handleClose, className: "absolute top-2 right-2 z-10 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors", title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0432\u0438\u0434\u0436\u0435\u0442", children: _jsx(X, { className: "w-4 h-4 text-white" }) }), videoEnded && (_jsx("button", { onClick: resetVideo, className: "absolute top-2 left-2 z-10 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors", title: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0438\u0434\u0435\u043E \u0441\u043D\u043E\u0432\u0430", children: _jsx(RotateCcw, { className: "w-4 h-4 text-white" }) })), showVideo && (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsxs("video", { ref: videoRef, className: "w-full h-full object-contain", autoPlay: autoPlay, controls: showControls, muted: false, onEnded: handleVideoEnd, onError: handleVideoError, playsInline: true, children: [_jsx("source", { src: "/media/intro-video.mp4", type: "video/mp4" }), "\u0412\u0430\u0448 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u0432\u0438\u0434\u0435\u043E."] }) })), videoEnded && !showVideo && (_jsx("div", { className: "w-full h-full flex items-center justify-center p-4", children: _jsxs("div", { className: "text-center", children: [_jsx("img", { src: "/media/logo.png", alt: "Boss AI Logo", className: "max-w-full max-h-full object-contain mx-auto", onLoad: () => console.log('Логотип загружен'), onError: () => console.error('Ошибка загрузки логотипа') }), _jsx("p", { className: "text-white/80 text-sm mt-2", children: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 Boss AI Platform" })] }) }))] }));
};
export default VideoWidget;
//# sourceMappingURL=VideoWidget.js.map