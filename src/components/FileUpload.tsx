import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Upload, FileImage, X, Eye, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesUploaded: (fileUrls: string[]) => void;
  currentFileUrls?: string[];
  onFilesRemoved?: () => void;
}

export const FileUpload = ({ onFilesUploaded, currentFileUrls = [], onFilesRemoved }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const maxFiles = 10;
    const totalFiles = currentFileUrls.length + selectedFiles.length + files.length;
    
    if (totalFiles > maxFiles) {
      toast.error(`Máximo de ${maxFiles} imagens permitidas`);
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      // Verificar se é um arquivo de imagem
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`);
        continue;
      }

      // Verificar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`${file.name} é muito grande. Máximo permitido: 10MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} imagem(ns) selecionada(s)!`);
    }

    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of selectedFiles) {
        const fileExtension = file.name.split('.').pop();
        const fileName = `checklist-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
        
        const { data, error } = await supabase.storage
          .from('checklist-videos')
          .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('checklist-videos')
          .getPublicUrl(data.path);
        
        uploadedUrls.push(urlData.publicUrl);
      }

      onFilesUploaded([...currentFileUrls, ...uploadedUrls]);
      setSelectedFiles([]);
      toast.success(`${uploadedUrls.length} imagem(ns) enviada(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar as imagens');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('Imagem removida da seleção');
  };

  const removeCurrentFile = (index: number) => {
    if (onFilesRemoved) {
      const newUrls = currentFileUrls.filter((_, i) => i !== index);
      onFilesUploaded(newUrls);
      toast.success('Imagem removida');
    }
  };

  const openFile = (url: string) => {
    window.open(url, '_blank');
  };

  const canAddMore = currentFileUrls.length + selectedFiles.length < 10;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Imagens da Inspeção</h3>
        <span className="text-sm text-muted-foreground">
          {currentFileUrls.length + selectedFiles.length}/10
        </span>
      </div>
      
      {/* Imagens atuais salvas */}
      {currentFileUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Imagens anexadas:</h4>
          <div className="grid grid-cols-2 gap-2">
            {currentFileUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={url} 
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => openFile(url)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeCurrentFile(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imagens selecionadas para upload */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Imagens selecionadas:</h4>
          <div className="grid grid-cols-2 gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-1 right-1">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeSelectedFile(index)}
                    disabled={isUploading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={uploadFiles}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? 'Enviando imagens...' : `Enviar ${selectedFiles.length} imagem(ns)`}
          </Button>
        </div>
      )}

      {/* Botão de seleção de arquivos */}
      {canAddMore && (
        <div className="space-y-2">
          <label htmlFor="file-input" className="block cursor-pointer">
            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="sr-only"
            />
            <div className="w-full flex items-center justify-center px-4 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              {currentFileUrls.length + selectedFiles.length === 0 ? 'Anexar Imagens' : 'Adicionar Mais Imagens'}
            </div>
          </label>
          <p className="text-xs text-muted-foreground text-center">
            Selecione múltiplas imagens - JPG, PNG, GIF, WebP (máximo 10MB cada)
          </p>
        </div>
      )}
      
      {isUploading && (
        <div className="text-center text-muted-foreground">
          Enviando imagens...
        </div>
      )}
    </Card>
  );
};