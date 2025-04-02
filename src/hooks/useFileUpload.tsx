
import { useState, useCallback } from "react";

export type FileStatus = "idle" | "uploading" | "processing" | "complete" | "error";

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: FileStatus;
  progress: number;
  result?: string;
  error?: string;
}

export function useFileUpload(acceptedFileTypes: string[]) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const filesToAdd: UploadedFile[] = [];
    
    Array.from(newFiles).forEach(file => {
      // Check if file type is accepted
      const fileType = file.type.split('/')[0];
      if (!acceptedFileTypes.includes(fileType)) {
        console.error(`File type ${fileType} is not accepted`);
        return;
      }
      
      // Create a preview URL
      const preview = URL.createObjectURL(file);
      
      filesToAdd.push({
        id: crypto.randomUUID(),
        file,
        preview,
        status: "idle",
        progress: 0
      });
    });

    setFiles(prev => [...prev, ...filesToAdd]);
  }, [acceptedFileTypes]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(file => file.id !== fileId);
      // Revoke object URL to avoid memory leaks
      const fileToRemove = prev.find(file => file.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
        if (fileToRemove.result) {
          URL.revokeObjectURL(fileToRemove.result);
        }
      }
      return newFiles;
    });
  }, []);

  const clearFiles = useCallback(() => {
    // Revoke all object URLs
    files.forEach(file => {
      URL.revokeObjectURL(file.preview);
      if (file.result) {
        URL.revokeObjectURL(file.result);
      }
    });
    setFiles([]);
  }, [files]);

  const updateFileStatus = useCallback((fileId: string, status: FileStatus, progress?: number, result?: string, error?: string) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          status,
          progress: progress !== undefined ? progress : file.progress,
          result,
          error
        };
      }
      return file;
    }));
  }, []);

  // This function would be called when your Python backend processing is complete
  const setFileResult = useCallback((fileId: string, resultUrl: string) => {
    updateFileStatus(fileId, "complete", 100, resultUrl);
  }, [updateFileStatus]);

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    updateFileStatus,
    setFileResult
  };
}
