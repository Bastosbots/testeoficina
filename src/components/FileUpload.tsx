import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Upload, FileVideo, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUploaded: (fileUrl: string) => void;
  currentFileUrl?: string;
  onFileRemoved?: () => void;
}

export const FileUpload = ({ onFileUploaded, currentFileUrl, onFileRemoved }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo de vídeo
      if (!file.type.startsWith('video/')) {
        toast.error('Por favor, selecione um arquivo de vídeo válido');
        return;
      }

      // Verificar tamanho (máximo 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast.error('Arquivo muito grande. Máximo permitido: 100MB');
        return;
      }

      setSelectedFile(file);
      toast.success('Arquivo selecionado!');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const fileExtension = selectedFile.name.split('.').pop();
      const fileName = `checklist-video-${Date.now()}.${fileExtension}`;
      
      const { data, error } = await supabase.storage
        .from('checklist-videos')
        .upload(fileName, selectedFile);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('checklist-videos')
        .getPublicUrl(data.path);
      
      onFileUploaded(urlData.publicUrl);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar o arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Arquivo removido');
  };

  const removeCurrentFile = () => {
    if (onFileRemoved) {
      onFileRemoved();
      toast.success('Arquivo removido');
    }
  };

  const openFile = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Arquivo da Inspeção</h3>
      
      {/* Arquivo atual salvo */}
      {currentFileUrl && !selectedFile && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileVideo className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">
              Arquivo de vídeo anexado
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openFile(currentFileUrl)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={removeCurrentFile}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Remover Arquivo
          </Button>
        </div>
      )}

      {/* Arquivo selecionado para upload */}
      {selectedFile && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileVideo className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={uploadFile}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
            </Button>
            <Button 
              variant="outline"
              onClick={removeSelectedFile}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Botão de seleção de arquivo */}
      {!currentFileUrl && !selectedFile && (
        <div className="space-y-2">
          <label htmlFor="file-input" className="block cursor-pointer">
            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleFileSelect}
              className="sr-only"
            />
            <div className="w-full flex items-center justify-center px-4 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Anexar Vídeo
            </div>
          </label>
          <p className="text-xs text-muted-foreground text-center">
            Formatos aceitos: MP4, MOV, AVI, WebM (máximo 100MB)
          </p>
        </div>
      )}
      
      {isUploading && (
        <div className="text-center text-muted-foreground">
          Enviando arquivo...
        </div>
      )}
    </Card>
  );
};