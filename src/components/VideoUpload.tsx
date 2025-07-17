
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { VideoIcon, XIcon, StopCircleIcon } from "lucide-react";
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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      console.log('Iniciando gravação...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Usar câmera traseira por padrão
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      
      console.log('Stream obtido:', stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Importante para evitar feedback
        
        // Garantir que o vídeo está carregado antes de reproduzir
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        };
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        console.log('Dados disponíveis:', event.data.size);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        console.log('Gravação parada, processando...');
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => {
          console.log('Parando track:', track.kind);
          track.stop();
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          const url = URL.createObjectURL(blob);
          videoRef.current.src = url;
          videoRef.current.muted = false; // Permitir áudio na reprodução
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('Gravação iniciada!');
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast.error('Erro ao acessar a câmera. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    console.log('Parando gravação...');
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      toast.success('Gravação finalizada!');
    }
  };

  const uploadRecordedVideo = async () => {
    if (!recordedBlob) return;
    
    setIsUploading(true);
    
    try {
      const fileName = `checklist-video-${Date.now()}.webm`;
      
      const { data, error } = await supabase.storage
        .from('checklist-videos')
        .upload(fileName, recordedBlob);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('checklist-videos')
        .getPublicUrl(data.path);
      
      onVideoUploaded(urlData.publicUrl);
      setRecordedBlob(null);
      toast.success('Vídeo salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao salvar o vídeo');
    } finally {
      setIsUploading(false);
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.srcObject = null;
    }
    toast.success('Gravação descartada');
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
      
      {/* Vídeo atual salvo */}
      {currentVideoUrl && !recordedBlob && (
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

      {/* Preview da câmera ou vídeo gravado */}
      {(isRecording || recordedBlob) && (
        <div className="space-y-2">
          <video 
            ref={videoRef}
            className="w-full max-h-64 rounded-lg border-2 border-border"
            controls={!!recordedBlob}
            playsInline
            autoPlay={isRecording}
            style={{
              backgroundColor: '#000',
              objectFit: 'cover'
            }}
          />
          
          {recordedBlob && (
            <div className="flex gap-2">
              <Button 
                onClick={uploadRecordedVideo}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? 'Salvando...' : 'Salvar Vídeo'}
              </Button>
              <Button 
                variant="outline"
                onClick={discardRecording}
                disabled={isUploading}
              >
                Descartar
              </Button>
            </div>
          )}

          {isRecording && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Gravando...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controles de gravação */}
      {!currentVideoUrl && !recordedBlob && (
        <div className="space-y-2">
          {!isRecording ? (
            <Button 
              variant="outline"
              onClick={startRecording}
              className="w-full flex items-center justify-center"
            >
              <VideoIcon className="w-4 h-4 mr-2" />
              Gravar Vídeo
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={stopRecording}
              className="w-full flex items-center justify-center"
            >
              <StopCircleIcon className="w-4 h-4 mr-2" />
              Parar Gravação
            </Button>
          )}
        </div>
      )}
      
      {isUploading && (
        <div className="text-center text-muted-foreground">
          Salvando vídeo...
        </div>
      )}
    </Card>
  );
};
