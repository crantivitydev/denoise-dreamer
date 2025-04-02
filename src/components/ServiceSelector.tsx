
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageDown, Wand2, AudioWaveform } from "lucide-react";

export type ServiceType = "image-denoise" | "image-upscale" | "audio-denoise";

interface ServiceSelectorProps {
  onServiceChange: (service: ServiceType) => void;
}

export function ServiceSelector({ onServiceChange }: ServiceSelectorProps) {
  const [selectedService, setSelectedService] = useState<ServiceType>("image-denoise");

  const handleServiceChange = (service: ServiceType) => {
    setSelectedService(service);
    onServiceChange(service);
  };

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Select Enhancement Service</h2>
      <Tabs 
        defaultValue="image-denoise" 
        className="w-full"
        onValueChange={(value) => handleServiceChange(value as ServiceType)}
      >
        <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
          <TabsTrigger value="image-denoise" className="flex items-center gap-2">
            <ImageDown className="h-4 w-4" />
            <span className="hidden sm:inline">Image Denoising</span>
            <span className="sm:hidden">Denoise</span>
          </TabsTrigger>
          <TabsTrigger value="image-upscale" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Image Upscaling</span>
            <span className="sm:hidden">Upscale</span>
          </TabsTrigger>
          <TabsTrigger value="audio-denoise" className="flex items-center gap-2">
            <AudioWaveform className="h-4 w-4" />
            <span className="hidden sm:inline">Audio Denoising</span>
            <span className="sm:hidden">Audio</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="image-denoise" className="mt-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Image Denoising</h3>
            <p className="text-sm text-muted-foreground">
              Remove noise from images while preserving important details. 
              Perfect for photos taken in low light or with high ISO settings.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="image-upscale" className="mt-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Image Upscaling</h3>
            <p className="text-sm text-muted-foreground">
              Enhance image resolution and quality. Increase the size of your images 
              while maintaining clarity and adding details.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="audio-denoise" className="mt-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Audio Denoising</h3>
            <p className="text-sm text-muted-foreground">
              Clean up audio recordings by removing background noise, hiss, and other unwanted sounds. 
              Ideal for podcasts, interviews, and music recordings.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
