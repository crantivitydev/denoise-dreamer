
import { useState } from "react";
import { UploadedFile } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { ServiceType } from "@/components/ServiceSelector";

interface ResultsViewProps {
  files: UploadedFile[];
  service: ServiceType;
  onReprocess: (fileId: string) => void;
}

export function ResultsView({ files, service, onReprocess }: ResultsViewProps) {
  const completedFiles = files.filter(file => file.status === "complete" && file.result);
  
  if (completedFiles.length === 0) {
    return null;
  }

  const isImageService = service === "image-denoise" || service === "image-upscale";

  return (
    <div className="my-8">
      <h3 className="text-2xl font-bold mb-6 text-center">Results</h3>
      
      <div className="grid grid-cols-1 gap-8">
        {completedFiles.map((file) => (
          <ResultItem 
            key={file.id} 
            file={file} 
            isImageService={isImageService}
            onReprocess={() => onReprocess(file.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ResultItemProps {
  file: UploadedFile;
  isImageService: boolean;
  onReprocess: () => void;
}

function ResultItem({ file, isImageService, onReprocess }: ResultItemProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  
  const handleDownload = () => {
    if (file.result) {
      const link = document.createElement("a");
      link.href = file.result;
      link.download = `enhanced_${file.file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        {isImageService ? (
          <>
            <div className="flex-1">
              <h4 className="font-medium mb-2">Original</h4>
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img 
                  src={file.preview} 
                  alt="Original" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium mb-2">Enhanced</h4>
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img 
                  src={file.result} 
                  alt="Enhanced" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full">
            <div className="flex space-x-4 mb-4">
              <Button
                variant={showOriginal ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOriginal(true)}
              >
                Original Audio
              </Button>
              <Button
                variant={!showOriginal ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOriginal(false)}
              >
                Enhanced Audio
              </Button>
            </div>
            
            {showOriginal ? (
              <AudioVisualizer audioUrl={file.preview} />
            ) : (
              <AudioVisualizer audioUrl={file.result || ""} />
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onReprocess}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reprocess
        </Button>
        <Button 
          size="sm"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}
