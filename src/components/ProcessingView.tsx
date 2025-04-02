
import { useEffect, useState } from "react";
import { UploadedFile } from "@/hooks/useFileUpload";
import { Progress } from "@/components/ui/progress";
import { Loader, CheckCircle2, XCircle } from "lucide-react";
import { ServiceType } from "@/components/ServiceSelector";
import { simulateProcessing } from "@/lib/api";

interface ProcessingViewProps {
  files: UploadedFile[];
  updateFileStatus: (fileId: string, status: "idle" | "uploading" | "processing" | "complete" | "error", progress?: number, result?: string, error?: string) => void;
  service: ServiceType;
}

export function ProcessingView({ files, updateFileStatus, service }: ProcessingViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const filesBeingProcessed = files.filter(file => 
      file.status === "uploading" || file.status === "processing"
    );

    if (filesBeingProcessed.length > 0) {
      setIsProcessing(true);
    } else {
      setIsProcessing(false);
    }
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="my-8 p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Processing Status</h3>
      
      <div className="space-y-4">
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              {file.status === "uploading" || file.status === "processing" ? (
                <Loader className="h-6 w-6 animate-spin text-primary" />
              ) : file.status === "complete" ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : file.status === "error" ? (
                <XCircle className="h-6 w-6 text-red-500" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-muted" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium truncate max-w-[180px] sm:max-w-xs">
                  {file.file.name}
                </p>
                <span className="text-xs text-muted-foreground capitalize">
                  {file.status}
                </span>
              </div>
              
              <Progress value={file.progress} className="h-2" />
            </div>
          </div>
        ))}
      </div>
      
      {isProcessing && (
        <p className="text-sm text-muted-foreground mt-4">
          AI model is working on your files. This may take a few minutes depending on the file size and complexity.
        </p>
      )}
    </div>
  );
}
