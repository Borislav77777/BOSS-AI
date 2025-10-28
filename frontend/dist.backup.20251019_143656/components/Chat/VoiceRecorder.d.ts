/**
 * Компонент для записи голосовых сообщений
 */
import React from 'react';
interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    className?: string;
}
export declare const VoiceRecorder: React.FC<VoiceRecorderProps>;
export default VoiceRecorder;
//# sourceMappingURL=VoiceRecorder.d.ts.map