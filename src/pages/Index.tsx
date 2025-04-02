
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ServiceSelector, ServiceType } from "@/components/ServiceSelector";
import { FileUpload } from "@/components/FileUpload";
import { ProcessingView } from "@/components/ProcessingView";
import { ResultsView } from "@/components/ResultsView";
import { useFileUpload, FileStatus } from "@/hooks/useFileUpload";
import { processFile } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [service, setService] = useState<ServiceType>("image-denoise");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const isImageService = service === "image-denoise" || service === "image-upscale";
  const acceptedFileTypes = isImageService ? ["image"] : ["audio"];
  
  const { 
    files, 
    addFiles, 
    removeFile, 
    clearFiles, 
    updateFileStatus
  } = useFileUpload(acceptedFileTypes);

  const handleServiceChange = (newService: ServiceType) => {
    if (files.length > 0) {
      const confirmChange = window.confirm(
        "Changing the service will clear your current files. Continue?"
      );
      
      if (confirmChange) {
        clearFiles();
        setService(newService);
      }
    } else {
      setService(newService);
    }
  };

  const processFiles = async () => {
    const filesToProcess = files.filter(f => f.status === "idle");
    
    if (filesToProcess.length === 0) return;
    
    setIsProcessing(true);
    
    for (const file of filesToProcess) {
      try {
        // Update status to uploading
        updateFileStatus(file.id, "uploading", 0);
        
        // Process file with progress updates
        const resultUrl = await processFile(
          file.file,
          service,
          (progress) => {
            updateFileStatus(
              file.id, 
              progress < 100 ? "uploading" : "processing", 
              progress
            );
          }
        );
        
        // Set the result
        updateFileStatus(file.id, "complete", 100, resultUrl);
        
        toast({
          title: "Processing complete",
          description: `Successfully processed ${file.file.name}`,
        });
        
      } catch (error) {
        console.error("Error processing file:", error);
        updateFileStatus(
          file.id, 
          "error", 
          0, 
          undefined, 
          error instanceof Error ? error.message : "Unknown error"
        );
        
        toast({
          variant: "destructive",
          title: "Processing failed",
          description: `Failed to process ${file.file.name}`,
        });
      }
    }
    
    setIsProcessing(false);
  };

  const handleReprocess = (fileId: string) => {
    updateFileStatus(fileId, "idle", 0);
    processFiles();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Enhancement Studio
        </h1>
        <p className="text-center text-lg mb-8 text-muted-foreground">
          Upload your files and let our advanced AI models enhance them for you.
        </p>

        <ServiceSelector onServiceChange={handleServiceChange} />
        
        <FileUpload
          service={service}
          files={files}
          onAddFiles={addFiles}
          onRemoveFile={removeFile}
          onClearFiles={clearFiles}
          onProcessFiles={processFiles}
          disabled={isProcessing}
        />
        
        <ProcessingView 
          files={files} 
          updateFileStatus={updateFileStatus}
          service={service}
        />
        
        <ResultsView 
          files={files}
          service={service}
          onReprocess={handleReprocess}
        />
      </div>
    </Layout>
  );
};

export default Index;
