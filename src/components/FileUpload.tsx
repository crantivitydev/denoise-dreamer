
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, ImagePlus, AudioLines } from "lucide-react";
import { UploadedFile } from "@/hooks/useFileUpload";
import { ServiceType } from "@/components/ServiceSelector";

interface FileUploadProps {
  service: ServiceType;
  files: UploadedFile[];
  onAddFiles: (files: FileList | null) => void;
  onRemoveFile: (id: string) => void;
  onClearFiles: () => void;
  onProcessFiles: () => void;
  disabled?: boolean;
}

export function FileUpload({
  service,
  files,
  onAddFiles,
  onRemoveFile,
  onClearFiles,
  onProcessFiles,
  disabled = false
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isImageService = service === "image-denoise" || service === "image-upscale";
  const acceptedFileTypes = isImageService ? "image/*" : "audio/*";
  const fileTypeIcon = isImageService ? <ImagePlus className="h-12 w-12 mb-2 text-muted-foreground" /> : <AudioLines className="h-12 w-12 mb-2 text-muted-foreground" />;
  const dropzoneText = isImageService ? "Drop images here" : "Drop audio files here";
  const buttonText = isImageService ? "Select Images" : "Select Audio Files";

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    onAddFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-primary bg-muted/50" : "border-border"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : handleFileSelect}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          multiple
          className="hidden"
          onChange={(e) => onAddFiles(e.target.files)}
          disabled={disabled}
        />
        {fileTypeIcon}
        <p className="mb-2 font-medium">{dropzoneText}</p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse files
        </p>
        <Button
          variant="outline"
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            handleFileSelect();
          }}
          className="mx-auto"
        >
          <Upload className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">
              Uploaded Files ({files.length})
            </h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFiles}
                disabled={disabled}
              >
                Clear All
              </Button>
              <Button 
                size="sm" 
                onClick={onProcessFiles}
                disabled={disabled || files.every(f => f.status === "complete")}
              >
                Process Files
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative border rounded-lg p-3 group">
                <div className="aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  {file.file.type.startsWith("image/") ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <AudioLines className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {file.status !== "idle" && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize">{file.status}</span>
                        <span>{file.progress}%</span>
                      </div>
                      <Progress value={file.progress} className="h-1" />
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveFile(file.id)}
                  disabled={disabled || file.status === "processing"}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
