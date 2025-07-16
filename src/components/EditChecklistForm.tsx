
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
    service_order: checklist.service_order || '',
    priority: checklist.priority || 'Média',
    status: checklist.status || 'Pendente',
    general_observations: checklist.general_observations || '',
    video_url: checklist.video_url || '',
  });

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (checklistItems.length > 0) {
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
      const itemsForUpdate = items.map(item => ({
        name: item.item_name,
        category: item.category,
        checked: item.checked,
        observation: item.observation || ''
      }));

      await updateChecklistMutation.mutateAsync({
        id: checklist.id,
        updateData: formData,
        items: itemsForUpdate
      });

      toast.success('Checklist atualizado com sucesso!');
      onSave();
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast.error('Erro ao atualizar checklist');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const priorityOptions = ['Baixa', 'Média', 'Alta'];
  const statusOptions = ['Pendente', 'Em Andamento', 'Concluído', 'Cancelado'];

  // Agrupar itens por categoria
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editar Checklist</h1>
            <p className="text-muted-foreground">
              Modificar informações e status do checklist
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(formData.status)}>
            {formData.status}
          </Badge>
          <Button 
            onClick={handleSave}
            disabled={updateChecklistMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateChecklistMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_name">Nome do Veículo</Label>
                <Input
                  id="vehicle_name"
                  value={formData.vehicle_name}
                  onChange={(e) => handleInputChange('vehicle_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  value={formData.plate}
                  onChange={(e) => handleInputChange('plate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_name">Cliente</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_order">Ordem de Serviço</Label>
                <Input
                  id="service_order"
                  value={formData.service_order}
                  onChange={(e) => handleInputChange('service_order', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">URL do Vídeo</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => handleInputChange('video_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="general_observations">Observações Gerais</Label>
                <Textarea
                  id="general_observations"
                  value={formData.general_observations}
                  onChange={(e) => handleInputChange('general_observations', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itens do Checklist */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      {category}
                      <Badge variant="outline" className="text-xs">
                        {categoryItems.filter(item => item.checked).length}/{categoryItems.length}
                      </Badge>
                    </h3>
                    
                    <div className="space-y-3">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 bg-card">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={(checked) => 
                                handleItemChange(item.id, 'checked', checked)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="font-medium text-foreground">
                                {item.item_name}
                              </div>
                              <Textarea
                                value={item.observation || ''}
                                onChange={(e) => 
                                  handleItemChange(item.id, 'observation', e.target.value)
                                }
                                placeholder="Observações sobre este item..."
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {category !== Object.keys(itemsByCategory)[Object.keys(itemsByCategory).length - 1] && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}

                {Object.keys(itemsByCategory).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum item encontrado para este checklist.</p>
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
