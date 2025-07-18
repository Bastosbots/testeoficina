
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
  onImageUploaded?: () => void; // Nova prop para callback após upload bem-sucedido
}

export const FileUpload = ({ onFilesUploaded, currentFileUrls = [], onFilesRemoved, onImageUploaded }: FileUploadProps) => {
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

  const uploadFileWithRetry = async (file: File, maxRetries = 3): Promise<string> => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `checklist-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Uploading file (attempt ${attempt}/${maxRetries}):`, fileName, 'Size:', file.size, 'Type:', file.type);
        
        const { data, error } = await supabase.storage
          .from('checklist-videos')
          .upload(fileName, file, {
            cacheControl: '3600',

            upsert: false
          });
        
        if (error) {
          console.error(`Upload error (attempt ${attempt}):`, error);
          if (attempt === maxRetries) {
            throw new Error(`Erro ao enviar ${file.name}: ${error.message}`);
          }
          // Aguardar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        console.log('Upload successful:', data);
        
        const { data: urlData } = supabase.storage
          .from('checklist-videos')
          .getPublicUrl(data.path);
        
        return urlData.publicUrl;
      } catch (error: any) {
        console.error(`Upload attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw new Error(`Falha ao enviar ${file.name} após ${maxRetries} tentativas`);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // Upload sequencial para evitar sobrecarregar a conexão no mobile
      for (const file of selectedFiles) {
        try {
          const url = await uploadFileWithRetry(file);
          uploadedUrls.push(url);
          successCount++;
          
          // Pequena pausa entre uploads para melhorar estabilidade no mobile
          if (successCount < selectedFiles.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error: any) {
          console.error(`Failed to upload ${file.name}:`, error);
          errorCount++;
          toast.error(`Erro ao enviar ${file.name}: ${error.message}`);
        }
      }

      if (uploadedUrls.length > 0) {
        const allUrls = [...currentFileUrls, ...uploadedUrls];
        onFilesUploaded(allUrls);
        setSelectedFiles([]);
        
        // Chamar callback após upload bem-sucedido
        if (onImageUploaded) {
          onImageUploaded();
        }
        
        if (errorCount === 0) {
          toast.success(`${uploadedUrls.length} imagem(ns) enviada(s) com sucesso!`);
        } else {
          toast.success(`${uploadedUrls.length} imagem(ns) enviada(s). ${errorCount} falharam.`);
        }
      } else {
        toast.error('Nenhuma imagem foi enviada com sucesso');
      }
      
    } catch (error: any) {
      console.error('Erro geral no upload:', error);
      toast.error('Erro geral no envio das imagens. Verifique sua conexão.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('Imagem removida da seleção');
  };

  const removeCurrentFile = (index: number) => {
    const newUrls = currentFileUrls.filter((_, i) => i !== index);
    onFilesUploaded(newUrls);
    toast.success('Imagem removida');
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
                    onError={(e) => {
                      console.error('Error loading image:', url);
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    type="button"
                    variant="secondary" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => openFile(url)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button 
                    type="button"
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
              <div key={`${file.name}-${index}`} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={(e) => {
                      // Limpar URL object quando a imagem for carregada
                      const img = e.target as HTMLImageElement;
                      setTimeout(() => {
                        if (img.src.startsWith('blob:')) {
                          URL.revokeObjectURL(img.src);
                        }
                      }, 1000);
                    }}
                  />
                </div>
                <div className="absolute top-1 right-1">
                  <Button 
                    type="button"
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
            type="button"
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
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Enviando imagens...
          </div>
        </div>
      )}
    </Card>
  );
};
