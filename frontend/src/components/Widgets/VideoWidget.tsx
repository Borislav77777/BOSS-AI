import { RotateCcw, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface VideoWidgetProps {
  onClose?: () => void;
  settings?: {
    showVideo: boolean;
    autoPlay: boolean;
    showControls: boolean;
  };
}

const VideoWidget: React.FC<VideoWidgetProps> = ({ onClose, settings = {} }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { autoPlay = true, showControls = false } = settings;

  const VIDEO_WATCHED_KEY = 'boss-ai-intro-video-watched';

  useEffect(() => {
    // Проверяем, было ли видео уже просмотрено
    const hasWatchedVideo = localStorage.getItem(VIDEO_WATCHED_KEY) === 'true';

    if (!hasWatchedVideo) {
      setShowVideo(true);
    } else {
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
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black/20 rounded-lg overflow-hidden">
      {/* Кнопка закрытия */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 z-10 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        title="Закрыть виджет"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* Кнопка сброса (только если видео уже просмотрено) */}
      {videoEnded && (
        <button
          onClick={resetVideo}
          className="absolute top-2 left-2 z-10 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          title="Показать видео снова"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
      )}

      {showVideo && (
        <div className="w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay={autoPlay}
            controls={showControls}
            muted={false}
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            playsInline
          >
            <source src="/media/intro-video.mp4" type="video/mp4" />
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      )}

      {videoEnded && !showVideo && (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="text-center">
            <img
              src="/media/logo.png"
              alt="Boss AI Logo"
              className="max-w-full max-h-full object-contain mx-auto"
              onLoad={() => {}}
              onError={() => {}}
            />
            <p className="text-white/80 text-sm mt-2">
              Добро пожаловать в Boss AI Platform
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoWidget;
