/**
 * Компонент для загрузки файлов в чат
 */
import React from 'react';
interface FileUploadProps {
    onFileSelect: (files: File[]) => void;
    className?: string;
}
export declare const FileUpload: React.FC<FileUploadProps>;
export default FileUpload;
//# sourceMappingURL=FileUpload.d.ts.map