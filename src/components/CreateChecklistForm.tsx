
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Car, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Video,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/useChecklists";
import { useAuth } from "@/hooks/useAuth";

interface CreateChecklistFormProps {
  onBack: () => void;
  onComplete: () => void;
}

const CreateChecklistForm = ({ onBack, onComplete }: CreateChecklistFormProps) => {
  const { user } = useAuth();
  const createChecklistMutation = useCreateChecklist();
  
  const [vehicleData, setVehicleData] = useState({
    vehicleName: '',
    plate: '',
    customerName: '',
    serviceOrder: '',
    priority: 'Média'
  });

  const [formData, setFormData] = useState({
    generalObservations: '',
    videoUrl: '',
  });

  const [checklistItems] = useState([
    { id: 'oil', name: 'Nível de Óleo', category: 'Motor', checked: false, observation: '' },
    { id: 'coolant', name: 'Líquido de Arrefecimento', category: 'Motor', checked: false, observation: '' },
    { id: 'brake-fluid', name: 'Fluido de Freio', category: 'Freios', checked: false, observation: '' },
    { id: 'brake-pads', name: 'Pastilhas de Freio', category: 'Freios', checked: false, observation: '' },
    { id: 'front-tires', name: 'Pneus Dianteiros', category: 'Pneus', checked: false, observation: '' },
    { id: 'rear-tires', name: 'Pneus Traseiros', category: 'Pneus', checked: false, observation: '' },
    { id: 'tire-pressure', name: 'Pressão dos Pneus', category: 'Pneus', checked: false, observation: '' },
    { id: 'battery', name: 'Bateria', category: 'Elétrico', checked: false, observation: '' },
    { id: 'lights', name: 'Sistema de Iluminação', category: 'Elétrico', checked: false, observation: '' },
    { id: 'air-filter', name: 'Filtro de Ar', category: 'Filtros', checked: false, observation: '' },
    { id: 'cabin-filter', name: 'Filtro do Ar Condicionado', category: 'Filtros', checked: false, observation: '' },
    { id: 'suspension', name: 'Sistema de Suspensão', category: 'Suspensão', checked: false, observation: '' }
  ]);

  const [items, setItems] = useState(checklistItems);

  const categories = Array.from(new Set(items.map(item => item.category)));

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked } : item
    ));
  };

  const handleItemObservation = (itemId: string, observation: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, observation } : item
    ));
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Usuário não autenticado!');
      return;
    }

    // Validar dados do veículo
    if (!vehicleData.vehicleName || !vehicleData.plate || !vehicleData.customerName || !vehicleData.serviceOrder) {
      toast.error('Preencha todos os dados obrigatórios do veículo!');
      return;
    }

    const checkedItems = items.filter(item => item.checked);
    
    if (checkedItems.length === 0) {
      toast.error('Selecione pelo menos um item do checklist!');
      return;
    }

    try {
      const checklistData = {
        mechanic_id: user.id,
        vehicle_name: vehicleData.vehicleName,
        plate: vehicleData.plate,
        customer_name: vehicleData.customerName,
        service_order: vehicleData.serviceOrder,
        priority: vehicleData.priority,
        general_observations: formData.generalObservations || null,
        video_url: formData.videoUrl || null,
        completed_at: new Date().toISOString()
      };

      const itemsData = checkedItems.map(item => ({
        name: item.name,
        category: item.category,
        checked: item.checked,
        observation: item.observation || null
      }));

      console.log('Saving checklist:', { checklistData, itemsData });

      await createChecklistMutation.mutateAsync({
        checklistData,
        items: itemsData
      });

      onComplete();
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  const getStatusColor = (checked: boolean) => {
    return checked ? 'text-green-600' : 'text-slate-400';
  };

  const checkedCount = items.filter(item => item.checked).length;
  const totalItems = items.length;
  const progress = (checkedCount / totalItems) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Criar Novo Checklist</h1>
              <p className="text-muted-foreground">
                Inspeção antes do início do serviço
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progresso</p>
              <p className="font-semibold text-primary">{checkedCount}/{totalItems} itens</p>
            </div>
            <Button 
              onClick={handleSave} 
              className="flex items-center gap-2"
              disabled={createChecklistMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {createChecklistMutation.isPending ? 'Salvando...' : 'Salvar Checklist'}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progresso do Checklist</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checklist Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Itens de Verificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categories.map(category => (
                  <div key={category} className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Badge variant="outline">{category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        ({items.filter(item => item.category === category && item.checked).length}/
                        {items.filter(item => item.category === category).length})
                      </span>
                    </h3>
                    
                    <div className="space-y-4">
                      {items.filter(item => item.category === category).map(item => (
                        <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={item.id}
                              checked={item.checked}
                              onCheckedChange={(checked) => handleItemCheck(item.id, !!checked)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <label htmlFor={item.id} className="cursor-pointer">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`font-medium ${getStatusColor(item.checked)}`}>
                                    {item.name}
                                  </span>
                                  {item.checked ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </label>
                              <Textarea
                                placeholder="Observações específicas (opcional)..."
                                value={item.observation}
                                onChange={(e) => handleItemObservation(item.id, e.target.value)}
                                className="text-sm"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Vehicle Data & Additional Info */}
          <div className="space-y-6">
            {/* Vehicle Information Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Dados do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vehicle-name">Nome do Veículo *</Label>
                  <Input
                    id="vehicle-name"
                    value={vehicleData.vehicleName}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, vehicleName: e.target.value }))}
                    placeholder="Ex: Honda Civic 2020"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plate">Placa *</Label>
                  <Input
                    id="plate"
                    value={vehicleData.plate}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer-name">Nome do Cliente *</Label>
                  <Input
                    id="customer-name"
                    value={vehicleData.customerName}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="João da Silva"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="service-order">Ordem de Serviço *</Label>
                  <Input
                    id="service-order"
                    value={vehicleData.serviceOrder}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, serviceOrder: e.target.value }))}
                    placeholder="OS-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={vehicleData.priority} onValueChange={(value) => setVehicleData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* General Observations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Descreva observações gerais sobre o veículo, problemas encontrados, recomendações, etc..."
                  value={formData.generalObservations}
                  onChange={(e) => setFormData(prev => ({ ...prev, generalObservations: e.target.value }))}
                  rows={5}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Video URL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Vídeo (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="video-url" className="text-sm font-medium">
                    Link do Vídeo (YouTube, Google Drive, etc.)
                  </Label>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChecklistForm;
