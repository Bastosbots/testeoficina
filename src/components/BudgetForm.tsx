
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Minus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCreateBudget, useCreateBudgetItems } from '@/hooks/useBudgets';
import { Service } from '@/hooks/useServices';
import { toast } from 'sonner';
import VehicleSelector from './VehicleSelector';
import ServiceSelector from './ServiceSelector';

const budgetSchema = z.object({
  customer_name: z.string().min(2, 'Nome do cliente é obrigatório'),
  vehicle_name: z.string().optional(),
  vehicle_plate: z.string().optional(),
  discount_amount: z.number().min(0, 'Desconto não pode ser negativo').optional(),
  observations: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface ServiceItem {
  service_id: string;
  service_name: string;
  service_category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface BudgetFormProps {
  onBack: () => void;
  onComplete: () => void;
}

const BudgetForm = ({ onBack, onComplete }: BudgetFormProps) => {
  const { user } = useAuth();
  const createBudget = useCreateBudget();
  const createBudgetItems = useCreateBudgetItems();
  
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      customer_name: '',
      vehicle_name: '',
      vehicle_plate: '',
      discount_amount: 0,
      observations: '',
    },
  });

  console.log('BudgetForm - Estado atual do usuário:', user);
  console.log('BudgetForm - Serviços selecionados:', services);

  const handleVehicleSelect = (vehicle: { customer_name: string; vehicle_name: string; plate: string }) => {
    console.log('Veículo selecionado:', vehicle);
    form.setValue('customer_name', vehicle.customer_name);
    form.setValue('vehicle_name', vehicle.vehicle_name);
    form.setValue('vehicle_plate', vehicle.plate);
    toast.success('Dados do veículo preenchidos automaticamente');
  };

  const handleServiceSelect = (service: Service) => {
    console.log('Adicionando serviço ao orçamento:', service);
    
    const newService: ServiceItem = {
      service_id: service.id,
      service_name: service.name,
      service_category: service.category,
      quantity: 1,
      unit_price: service.unit_price,
      total_price: service.unit_price,
    };
    
    setServices(prevServices => {
      const updatedServices = [...prevServices, newService];
      console.log('Serviços atualizados:', updatedServices);
      return updatedServices;
    });
    
    toast.success(`Serviço "${service.name}" adicionado ao orçamento`);
  };

  const removeService = (index: number) => {
    const serviceToRemove = services[index];
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
    toast.success(`Serviço "${serviceToRemove.service_name}" removido do orçamento`);
  };

  const updateServiceQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const newServices = [...services];
    newServices[index].quantity = quantity;
    newServices[index].total_price = quantity * newServices[index].unit_price;
    setServices(newServices);
  };

  useEffect(() => {
    const total = services.reduce((sum, service) => sum + service.total_price, 0);
    setTotalAmount(total);
    console.log('Total atualizado:', total);
  }, [services]);

  const onSubmit = async (data: BudgetFormData) => {
    console.log('=== INICIANDO CRIAÇÃO DO ORÇAMENTO ===');
    console.log('Dados do formulário:', data);
    console.log('Serviços selecionados:', services);
    console.log('Usuário autenticado:', user);

    if (services.length === 0) {
      console.error('Erro: Nenhum serviço selecionado');
      toast.error('Adicione pelo menos um serviço ao orçamento');
      return;
    }

    if (!user?.id) {
      console.error('Erro: Usuário não autenticado ou sem ID');
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const discountAmount = data.discount_amount || 0;
      const finalAmount = totalAmount - discountAmount;

      const budgetData = {
        mechanic_id: user.id,
        customer_name: data.customer_name,
        vehicle_name: data.vehicle_name || null,
        vehicle_plate: data.vehicle_plate || null,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        observations: data.observations || null,
        status: 'Pendente',
      };

      console.log('Dados do orçamento a serem enviados:', budgetData);

      // Criar o orçamento
      console.log('Criando orçamento...');
      const budget = await createBudget.mutateAsync(budgetData);
      console.log('Orçamento criado com sucesso:', budget);

      // Preparar itens do orçamento
      const budgetItems = services.map(service => ({
        budget_id: budget.id,
        service_id: service.service_id,
        service_name: service.service_name,
        service_category: service.service_category,
        quantity: service.quantity,
        unit_price: service.unit_price,
        total_price: service.total_price,
      }));

      console.log('Itens do orçamento a serem criados:', budgetItems);

      // Criar itens do orçamento
      console.log('Criando itens do orçamento...');
      await createBudgetItems.mutateAsync(budgetItems);
      console.log('Itens do orçamento criados com sucesso');
      
      toast.success('Orçamento criado com sucesso!');
      onComplete();
    } catch (error) {
      console.error('=== ERRO DETALHADO AO CRIAR ORÇAMENTO ===');
      console.error('Erro completo:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      console.error('Mensagem do erro:', error instanceof Error ? error.message : String(error));
      
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error(`Erro ao criar orçamento: ${error.message}`);
      } else {
        toast.error('Erro ao criar orçamento. Verifique o console para mais detalhes.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="outline" onClick={onBack} size="sm" className="sm:h-10 sm:px-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Voltar</span>
          </Button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Novo Orçamento</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Dados do Cliente */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Nome do Cliente *</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-sm sm:text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Dados do Veículo */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <CardTitle className="text-base sm:text-lg">Dados do Veículo (Opcional)</CardTitle>
                  <div className="w-full sm:w-auto">
                    <VehicleSelector onVehicleSelect={handleVehicleSelect} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Veículo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Honda Civic" className="text-sm sm:text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vehicle_plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">Placa</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABC-1234" className="text-sm sm:text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Serviços */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base sm:text-lg">Serviços</CardTitle>
                  <div className="w-full sm:w-auto">
                    <ServiceSelector onServiceSelect={handleServiceSelect} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">{service.service_name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{service.service_category}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(index)}
                        className="shrink-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm">Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateServiceQuantity(index, parseInt(e.target.value) || 1)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm">Preço Unitário</Label>
                        <Input
                          type="number"
                          value={service.unit_price.toFixed(2)}
                          readOnly
                          className="bg-muted text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs sm:text-sm">Total</Label>
                        <Input
                          type="number"
                          value={service.total_price.toFixed(2)}
                          readOnly
                          className="bg-muted text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {services.length === 0 && (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <p className="text-sm sm:text-base">Nenhum serviço adicionado ainda.</p>
                    <p className="text-xs sm:text-sm">Use o botão "Adicionar Serviço" para começar.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo do Orçamento */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Resumo do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Desconto (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="text-sm sm:text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Observações</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} className="text-sm sm:text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                    <div>
                      <Label className="text-xs sm:text-sm">Subtotal</Label>
                      <p className="text-base sm:text-lg font-medium">R$ {totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">Desconto</Label>
                      <p className="text-base sm:text-lg font-medium">R$ {(form.watch('discount_amount') || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">Total Final</Label>
                      <p className="text-lg sm:text-xl font-bold text-primary">
                        R$ {(totalAmount - (form.watch('discount_amount') || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-10 sm:h-12">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createBudget.isPending || createBudgetItems.isPending}
                className="flex-1 h-10 sm:h-12"
              >
                {createBudget.isPending || createBudgetItems.isPending ? 'Criando...' : 'Criar Orçamento'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BudgetForm;
