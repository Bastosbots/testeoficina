
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { FileUpload } from "./FileUpload";

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
    priority: 'Média'
  });

  const [generalObservations, setGeneralObservations] = useState('');

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);

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
    if (!vehicleData.vehicleName || !vehicleData.plate || !vehicleData.customerName) {
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
        priority: vehicleData.priority,
        status: 'Em Andamento',
        general_observations: generalObservations || null,
        video_url: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        completed_at: new Date().toISOString()
      };

      console.log('Saving checklist:', { checklistData });

      await createChecklistMutation.mutateAsync(checklistData);

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
      <header className="bg-card border-b border-border mobile-header-height lg:py-4 px-2 lg:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="outline" onClick={onBack} className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="mobile-text-xs lg:text-sm">Voltar</span>
            </Button>
            <div>
              <h1 className="mobile-text-lg lg:text-2xl font-bold text-foreground">Criar Novo Checklist</h1>
              <p className="mobile-text-xs lg:text-base text-muted-foreground">
                Inspeção antes do início do serviço
              </p>
            </div>
          </div>
          
        </div>
      </header>

      <div className="mobile-card-padding lg:p-6">
        {/* Progress Bar */}
        <Card className="mb-3 lg:mb-6">
          <CardContent className="mobile-card-padding lg:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2 lg:mb-3">
              <span className="mobile-text-sm lg:text-base font-medium text-foreground">Progresso do Checklist</span>
              <span className="mobile-text-sm lg:text-base text-muted-foreground">
                {checkedCount}/{totalItems} itens ({Math.round(progress)}%)
              </span>
            </div>
            <Progress value={progress} className="h-2 lg:h-3" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
          {/* Checklist Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="mobile-card-padding lg:p-6">
                <CardTitle className="mobile-text-base lg:text-xl flex items-center gap-2">
                  <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
                  Itens de Verificação
                </CardTitle>
              </CardHeader>
              <CardContent className="mobile-card-padding lg:p-6">
                {categories.map(category => (
                  <div key={category} className="mb-4 lg:mb-6">
                    <h3 className="mobile-text-sm lg:text-lg font-semibold text-foreground mb-2 lg:mb-3 flex items-center gap-1 lg:gap-2">
                      <Badge variant="outline" className="mobile-text-xs lg:text-sm px-1 lg:px-2 py-0.5">{category}</Badge>
                      <span className="mobile-text-xs lg:text-sm text-muted-foreground">
                        ({items.filter(item => item.category === category && item.checked).length}/
                        {items.filter(item => item.category === category).length})
                      </span>
                    </h3>
                    
                    <div className="space-y-2 lg:space-y-3">
                      {items.filter(item => item.category === category).map(item => (
                        <div key={item.id} className="border rounded-lg mobile-card-padding lg:p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-2 lg:gap-3">
                            <Checkbox
                              id={item.id}
                              checked={item.checked}
                              onCheckedChange={(checked) => handleItemCheck(item.id, !!checked)}
                              className="mt-1 mobile-touch-target"
                            />
                            <div className="flex-1 space-y-1 lg:space-y-2">
                              <label htmlFor={item.id} className="cursor-pointer block">
                                <div className="flex items-center gap-1 lg:gap-2">
                                  <span className={`mobile-text-sm lg:text-base font-medium ${getStatusColor(item.checked)}`}>
                                    {item.name}
                                  </span>
                                  {item.checked ? (
                                    <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </label>
                              <Textarea
                                placeholder="Observações específicas (opcional)..."
                                value={item.observation}
                                onChange={(e) => handleItemObservation(item.id, e.target.value)}
                                className="mobile-text-xs lg:text-sm min-h-12 lg:min-h-16"
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
          <div className="space-y-3 lg:space-y-6">
            {/* Vehicle Information Form */}
            <Card>
              <CardHeader className="mobile-card-padding lg:p-6">
                <CardTitle className="mobile-text-base lg:text-xl flex items-center gap-2">
                  <Car className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                  Dados do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="mobile-card-padding lg:p-6 space-y-3 lg:space-y-4">
                <div className="space-y-1 lg:space-y-2">
                  <Label htmlFor="vehicle-name" className="mobile-text-xs lg:text-sm">Nome e Cor do Veículo *</Label>
                  <Input
                    id="vehicle-name"
                    value={vehicleData.vehicleName}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, vehicleName: e.target.value }))}
                    placeholder="Ex: Honda Civic 2020 Prata"
                    className="mobile-input lg:h-10"
                    required
                  />
                </div>
                <div className="space-y-1 lg:space-y-2">
                  <Label htmlFor="plate" className="mobile-text-xs lg:text-sm">Placa *</Label>
                  <Input
                    id="plate"
                    value={vehicleData.plate}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                    placeholder="ABC-1234"
                    className="mobile-input lg:h-10"
                    required
                  />
                </div>
                <div className="space-y-1 lg:space-y-2">
                  <Label htmlFor="customer-name" className="mobile-text-xs lg:text-sm">Nome do Cliente *</Label>
                  <Input
                    id="customer-name"
                    value={vehicleData.customerName}
                    onChange={(e) => setVehicleData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="João da Silva"
                    className="mobile-input lg:h-10"
                    required
                  />
                </div>
                <div className="space-y-1 lg:space-y-2">
                  <Label htmlFor="priority" className="mobile-text-xs lg:text-sm">Prioridade *</Label>
                  <Select value={vehicleData.priority} onValueChange={(value) => setVehicleData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="mobile-input lg:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa" className="mobile-text-xs lg:text-sm">Baixa</SelectItem>
                      <SelectItem value="Média" className="mobile-text-xs lg:text-sm">Média</SelectItem>
                      <SelectItem value="Alta" className="mobile-text-xs lg:text-sm">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 lg:space-y-2">
                  <Label htmlFor="general-observations" className="mobile-text-xs lg:text-sm">Observações Gerais</Label>
                  <Textarea
                    id="general-observations"
                    value={generalObservations}
                    onChange={(e) => setGeneralObservations(e.target.value)}
                    placeholder="Observações gerais sobre o veículo ou serviço..."
                    rows={3}
                    className="mobile-text-xs lg:text-sm min-h-16 lg:min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video Upload */}
            <FileUpload 
              onFilesUploaded={setImageUrls}
              currentFileUrls={imageUrls}
              onFilesRemoved={() => setImageUrls([])}
            />
          </div>
        </div>

        {/* Botão Salvar no Final */}
        <div className="mt-6 lg:mt-8 flex justify-end">
          <Button 
            onClick={handleSave} 
            className="mobile-btn lg:h-12 lg:px-8 flex items-center gap-2 lg:gap-3 w-full sm:w-auto"
            disabled={createChecklistMutation.isPending}
            size="lg"
          >
            <Save className="h-4 w-4 lg:h-5 lg:w-5" />
            <span className="mobile-text-sm lg:text-base font-medium">
              {createChecklistMutation.isPending ? 'Salvando Checklist...' : 'Salvar Checklist'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateChecklistForm;
