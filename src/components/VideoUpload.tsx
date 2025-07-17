import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { VideoIcon, CameraIcon, UploadIcon, XIcon, PlayIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoUploadProps {
  onVideoUploaded: (videoUrl: string) => void;
  currentVideoUrl?: string;
  onVideoRemoved?: () => void;
}

export const VideoUpload = ({ onVideoUploaded, currentVideoUrl, onVideoRemoved }: VideoUploadProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment", // Use camera traseira no mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast.error('Erro ao acessar a câmera');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

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
      
      // Limpar vídeo gravado se existir
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
        setRecordedVideoUrl(null);
      }
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

  const saveRecordedVideo = async () => {
    if (!recordedVideoUrl) return;
    
    try {
      const response = await fetch(recordedVideoUrl);
      const blob = await response.blob();
      const file = new File([blob], `recorded-video-${Date.now()}.webm`, { type: 'video/webm' });
      await uploadVideo(file);
    } catch (error) {
      console.error('Erro ao salvar vídeo gravado:', error);
      toast.error('Erro ao salvar o vídeo gravado');
    }
  };

  const discardRecordedVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
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
      
      {/* Vídeo atual ou gravado */}
      {(currentVideoUrl || recordedVideoUrl) && (
        <div className="space-y-2">
          <video 
            ref={videoRef}
            controls 
            className="w-full max-h-64 rounded-lg"
            src={recordedVideoUrl || currentVideoUrl}
          />
          {recordedVideoUrl ? (
            <div className="flex gap-2">
              <Button 
                onClick={saveRecordedVideo}
                disabled={isUploading}
                className="flex-1"
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                Salvar Vídeo
              </Button>
              <Button 
                variant="outline" 
                onClick={discardRecordedVideo}
                disabled={isUploading}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={removeCurrentVideo}
              className="w-full"
            >
              <XIcon className="w-4 h-4 mr-2" />
              Remover Vídeo
            </Button>
          )}
        </div>
      )}

      {/* Preview da câmera durante gravação */}
      {isRecording && (
        <div className="space-y-2">
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            className="w-full max-h-64 rounded-lg"
          />
          <Button 
            onClick={stopRecording}
            variant="destructive"
            className="w-full"
          >
            Parar Gravação
          </Button>
        </div>
      )}

      {/* Botões de ação quando não há vídeo */}
      {!currentVideoUrl && !recordedVideoUrl && !isRecording && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button 
            onClick={startRecording}
            disabled={isUploading}
            className="flex items-center justify-center"
          >
            <CameraIcon className="w-4 h-4 mr-2" />
            Gravar Vídeo
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center justify-center"
          >
            <VideoIcon className="w-4 h-4 mr-2" />
            Selecionar da Galeria
          </Button>
        </div>
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