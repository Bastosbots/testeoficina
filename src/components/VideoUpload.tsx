import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { VideoIcon, XIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoUploadProps {
  onVideoUploaded: (videoUrl: string) => void;
  currentVideoUrl?: string;
  onVideoRemoved?: () => void;
}

export const VideoUpload = ({ onVideoUploaded, currentVideoUrl, onVideoRemoved }: VideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadVideo = async (file: File) => {
    setIsUploading(true);
    
    try {
      const fileName = `checklist-video-${Date.now()}.${file.type.split('/')[1]}`;
      
      const { data, error } = await supabase.storage
        .from('checklist-videos')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('checklist-videos')
        .getPublicUrl(data.path);
      
      onVideoUploaded(urlData.publicUrl);
      toast.success('Vídeo enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar o vídeo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        uploadVideo(file);
      } else {
        toast.error('Por favor, selecione um arquivo de vídeo');
      }
    }
  };

  const removeCurrentVideo = () => {
    if (onVideoRemoved) {
      onVideoRemoved();
      toast.success('Vídeo removido');
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Vídeo da Inspeção</h3>
      
      {/* Vídeo atual */}
      {currentVideoUrl && (
        <div className="space-y-2">
          <video 
            controls 
            className="w-full max-h-64 rounded-lg"
            src={currentVideoUrl}
          />
          <Button 
            variant="destructive" 
            size="sm"
            onClick={removeCurrentVideo}
            className="w-full"
          >
            <XIcon className="w-4 h-4 mr-2" />
            Remover Vídeo
          </Button>
        </div>
      )}

      {/* Botão de seleção quando não há vídeo */}
      {!currentVideoUrl && (
        <Button 
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center"
        >
          <VideoIcon className="w-4 h-4 mr-2" />
          Selecionar da Galeria
        </Button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {isUploading && (
        <div className="text-center text-muted-foreground">
          Enviando vídeo...
        </div>
      )}
    </Card>
  );
};