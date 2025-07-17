
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
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/useChecklists";
import { useAuth } from "@/hooks/useAuth";
import { VideoUpload } from "./VideoUpload";

interface CreateChecklistFormProps {
  onBack: () => void;
  onComplete: () => void;
}

const CreateChecklistForm = ({ onBack, onComplete }: CreateChecklistFormProps) => {
  const { user } = useAuth();
  const createChecklistMutation = useCreateChecklist();
  
  const [vehicleData, setVehicleData] = useState({
    vehicleName: '',
    vehicleColor: '',
    plate: '',
    customerName: '',
    priority: 'Média'
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
  const [videoUrl, setVideoUrl] = useState<string>('');

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
    if (!vehicleData.vehicleName || !vehicleData.vehicleColor || !vehicleData.plate || !vehicleData.customerName) {
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
        vehicle_name: `${vehicleData.vehicleName} - ${vehicleData.vehicleColor}`,
        plate: vehicleData.plate,
        customer_name: vehicleData.customerName,
        priority: vehicleData.priority,
        general_observations: null,
        video_url: videoUrl || null,
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
      <header className="bg-card border-b border-border mobile-spacing-x mobile-spacing-y">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center mobile-spacing-sm">
            <Button variant="outline" onClick={onBack} className="mobile-btn-sm flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <div>
              <h1 className="mobile-text-lg font-bold text-foreground">Criar Novo Checklist</h1>
              <p className="mobile-text-sm text-muted-foreground">
                Inspeção antes do início do serviço
              </p>
            </div>
          </div>
          <div className="flex items-center mobile-spacing-sm flex-wrap">
            <div className="text-right">
              <p className="mobile-text-xs text-muted-foreground">Progresso</p>
              <p className="mobile-text-sm font-semibold text-primary">{checkedCount}/{totalItems} itens</p>
            </div>
            <Button 
              onClick={handleSave} 
              className="mobile-btn-sm flex items-center gap-2"
              disabled={createChecklistMutation.isPending}
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{createChecklistMutation.isPending ? 'Salvando...' : 'Salvar Checklist'}</span>
              <span className="sm:hidden">Salvar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mobile-spacing-full">
        {/* Progress Bar */}
        <Card className="mobile-card mb-4">
          <CardContent className="mobile-spacing-card">
            <div className="flex items-center justify-between mb-2">
              <span className="mobile-text-sm font-medium text-foreground">Progresso do Checklist</span>
              <span className="mobile-text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 mobile-spacing-grid">
          {/* Checklist Items */}
          <div className="lg:col-span-2">
            <Card className="mobile-card">
              <CardHeader className="mobile-spacing-card-header">
                <CardTitle className="mobile-text-base flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Itens de Verificação
                </CardTitle>
              </CardHeader>
              <CardContent className="mobile-spacing-card">
                {categories.map(category => (
                  <div key={category} className="mobile-spacing-lg">
                    <h3 className="mobile-text-sm font-semibold text-foreground mobile-spacing-xs flex items-center gap-2">
                      <Badge variant="outline" className="mobile-text-xs">{category}</Badge>
                      <span className="mobile-text-xs text-muted-foreground">
                        ({items.filter(item => item.category === category && item.checked).length}/
                        {items.filter(item => item.category === category).length})
                      </span>
                    </h3>
                    
                    <div className="mobile-spacing-md">
                      {items.filter(item => item.category === category).map(item => (
                        <div key={item.id} className="border rounded-lg mobile-spacing-card hover:bg-muted/50 transition-colors">
                          <div className="flex items-start mobile-spacing-xs">
                            <Checkbox
                              id={item.id}
                              checked={item.checked}
                              onCheckedChange={(checked) => handleItemCheck(item.id, !!checked)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <label htmlFor={item.id} className="cursor-pointer">
                                <div className="flex items-center gap-2 mobile-spacing-xs">
                                  <span className={`mobile-text-sm font-medium ${getStatusColor(item.checked)}`}>
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
                                className="mobile-input-sm mobile-text-xs"
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
          <div className="mobile-spacing-lg">
            {/* Vehicle Information Form */}
            <Card className="mobile-card">
              <CardHeader className="mobile-spacing-card-header">
                <CardTitle className="mobile-text-base flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Dados do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="mobile-spacing-md">
                <div>
                  <Label htmlFor="vehicle-name" className="mobile-text-sm">Nome do Veículo *</Label>
                  <Input
                    id="vehicle-name"
                    value={vehicleData.vehicleName}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, vehicleName: e.target.value }))}
                    placeholder="Ex: Honda Civic 2020"
                    className="mobile-input-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-color" className="mobile-text-sm">Cor do Veículo *</Label>
                  <Input
                    id="vehicle-color"
                    value={vehicleData.vehicleColor}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, vehicleColor: e.target.value }))}
                    placeholder="Ex: Prata, Preto, Branco"
                    className="mobile-input-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plate" className="mobile-text-sm">Placa *</Label>
                  <Input
                    id="plate"
                    value={vehicleData.plate}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                    placeholder="ABC-1234"
                    className="mobile-input-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer-name" className="mobile-text-sm">Nome do Cliente *</Label>
                  <Input
                    id="customer-name"
                    value={vehicleData.customerName}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="João da Silva"
                    className="mobile-input-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority" className="mobile-text-sm">Prioridade *</Label>
                  <Select value={vehicleData.priority} onValueChange={(value) => setVehicleData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="mobile-input-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa" className="mobile-text-sm">Baixa</SelectItem>
                      <SelectItem value="Média" className="mobile-text-sm">Média</SelectItem>
                      <SelectItem value="Alta" className="mobile-text-sm">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Video Upload */}
            <div className="mobile-spacing-lg">
              <VideoUpload 
                onVideoUploaded={setVideoUrl}
                currentVideoUrl={videoUrl}
                onVideoRemoved={() => setVideoUrl('')}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChecklistForm;
