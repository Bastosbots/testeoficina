import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useUpdateChecklist } from "@/hooks/useChecklists";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { VideoUpload } from "./VideoUpload";

interface EditChecklistFormProps {
  checklist: any;
  onBack: () => void;
  onSave: () => void;
}

const EditChecklistForm = ({ checklist, onBack, onSave }: EditChecklistFormProps) => {
  const updateChecklistMutation = useUpdateChecklist();
  const { data: checklistItems = [] } = useChecklistItems(checklist.id);
  
  const [formData, setFormData] = useState({
    vehicle_name: checklist.vehicle_name || '',
    plate: checklist.plate || '',
    customer_name: checklist.customer_name || '',
    priority: checklist.priority || 'Média',
    status: checklist.status || 'Em Andamento',
    general_observations: checklist.general_observations || '',
    video_url: checklist.video_url || '',
  });

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (Array.isArray(checklistItems) && checklistItems.length > 0) {
      console.log('Loaded checklist items:', checklistItems);
      setItems(checklistItems);
    }
  }, [checklistItems]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    try {
      console.log('Starting save process...');
      console.log('Form data:', formData);
      console.log('Items to save:', items);

      const itemsForUpdate = items.map(item => ({
        name: item.item_name,
        category: item.category,
        checked: item.checked || false,
        observation: item.observation || ''
      }));

      console.log('Formatted items:', itemsForUpdate);

      await updateChecklistMutation.mutateAsync({
        id: checklist.id,
        updateData: formData,
        items: itemsForUpdate
      });

      toast.success('Checklist atualizado com sucesso!');
      onSave();
    } catch (error: any) {
      console.error('Error saving checklist:', error);
      toast.error(error.message || 'Erro ao atualizar checklist');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const priorityOptions = ['Baixa', 'Média', 'Alta'];
  const statusOptions = ['Em Andamento', 'Concluído', 'Cancelado'];

  // Agrupar itens por categoria
  const itemsByCategory = Array.isArray(items) ? items.reduce((acc, item) => {
    const category = item.category || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>) : {};

  return (
    <div className="min-h-screen bg-background mobile-card-padding lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6 space-y-3 lg:space-y-0">
        <div className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2"
          >
            <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="mobile-text-xs lg:text-sm">Voltar</span>
          </Button>
          <div>
            <h1 className="mobile-text-lg lg:text-2xl font-bold text-foreground">Editar Checklist</h1>
            <p className="mobile-text-xs lg:text-base text-muted-foreground">
              Modificar informações e status do checklist
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 lg:gap-2">
          <Badge className={`${getStatusColor(formData.status)} mobile-text-xs lg:text-sm px-1 lg:px-3 py-0.5 lg:py-1`}>
            {formData.status}
          </Badge>
          <Button 
            onClick={handleSave}
            disabled={updateChecklistMutation.isPending}
            className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2"
          >
            <Save className="h-3 w-3 lg:h-4 lg:w-4" />
            <span className="mobile-text-xs lg:text-sm">
              {updateChecklistMutation.isPending ? 'Salvando...' : 'Salvar'}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
        {/* Informações Básicas */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="mobile-card-padding lg:p-6">
              <CardTitle className="mobile-text-sm lg:text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="mobile-card-padding lg:p-6 space-y-3 lg:space-y-4">
              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="vehicle_name" className="mobile-text-xs lg:text-sm">Nome e Cor do Veículo</Label>
                <Input
                  id="vehicle_name"
                  value={formData.vehicle_name}
                  onChange={(e) => handleInputChange('vehicle_name', e.target.value)}
                  className="mobile-input lg:h-10"
                />
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="plate" className="mobile-text-xs lg:text-sm">Placa</Label>
                <Input
                  id="plate"
                  value={formData.plate}
                  onChange={(e) => handleInputChange('plate', e.target.value)}
                  className="mobile-input lg:h-10"
                />
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="customer_name" className="mobile-text-xs lg:text-sm">Cliente</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className="mobile-input lg:h-10"
                />
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="priority" className="mobile-text-xs lg:text-sm">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="mobile-input lg:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority} className="mobile-text-xs lg:text-sm">
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="status" className="mobile-text-xs lg:text-sm">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="mobile-input lg:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status} className="mobile-text-xs lg:text-sm">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 lg:space-y-2">
                <Label htmlFor="general_observations" className="mobile-text-xs lg:text-sm">Observações Gerais</Label>
                <Textarea
                  id="general_observations"
                  value={formData.general_observations}
                  onChange={(e) => handleInputChange('general_observations', e.target.value)}
                  rows={3}
                  className="mobile-text-xs lg:text-sm min-h-16 lg:min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Video Upload */}
          <div className="mt-3 lg:mt-6">
            <VideoUpload 
              onVideoUploaded={(url) => handleInputChange('video_url', url)}
              currentVideoUrl={formData.video_url}
              onVideoRemoved={() => handleInputChange('video_url', '')}
            />
          </div>
        </div>

        {/* Itens do Checklist */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="mobile-card-padding lg:p-6">
              <CardTitle className="mobile-text-sm lg:text-lg">Itens do Checklist</CardTitle>
            </CardHeader>
            <CardContent className="mobile-card-padding lg:p-6">
              <div className="space-y-4 lg:space-y-6">
                {Object.entries(itemsByCategory).map(([category, categoryItems]) => {
                  const categoryItemsArray = Array.isArray(categoryItems) ? categoryItems : [];
                  return (
                    <div key={category}>
                      <h3 className="mobile-text-sm lg:text-lg font-semibold text-foreground mb-2 lg:mb-3 flex items-center gap-1 lg:gap-2">
                        {category}
                        <Badge variant="outline" className="mobile-text-xs lg:text-xs px-1 lg:px-2 py-0.5">
                          {categoryItemsArray.filter(item => item.checked).length}/{categoryItemsArray.length}
                        </Badge>
                      </h3>
                      
                      <div className="space-y-2 lg:space-y-3">
                        {categoryItemsArray.map((item) => (
                          <div key={item.id} className="border rounded-lg mobile-card-padding lg:p-4 bg-card">
                            <div className="flex items-start gap-2 lg:gap-3">
                              <Checkbox
                                checked={item.checked || false}
                                onCheckedChange={(checked) => 
                                  handleItemChange(item.id, 'checked', checked)
                                }
                                className="mt-1"
                              />
                              <div className="flex-1 space-y-1 lg:space-y-2">
                                <div className="mobile-text-xs lg:text-sm font-medium text-foreground">
                                  {item.item_name}
                                </div>
                                <Textarea
                                  value={item.observation || ''}
                                  onChange={(e) => 
                                    handleItemChange(item.id, 'observation', e.target.value)
                                  }
                                  placeholder="Observações sobre este item..."
                                  rows={2}
                                  className="mobile-text-xs lg:text-sm min-h-12 lg:min-h-16"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {category !== Object.keys(itemsByCategory)[Object.keys(itemsByCategory).length - 1] && (
                        <Separator className="mt-4 lg:mt-6" />
                      )}
                    </div>
                  );
                })}

                {Object.keys(itemsByCategory).length === 0 && (
                  <div className="text-center py-6 lg:py-8 text-muted-foreground">
                    <p className="mobile-text-xs lg:text-base">Nenhum item encontrado para este checklist.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditChecklistForm;
