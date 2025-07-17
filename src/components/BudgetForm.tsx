
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
  vehicle_year: z.string().optional(),
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
      vehicle_year: '',
      discount_amount: 0,
      observations: '',
    },
  });

  const handleVehicleSelect = (vehicle: { customer_name: string; vehicle_name: string; plate: string }) => {
    form.setValue('customer_name', vehicle.customer_name);
    form.setValue('vehicle_name', vehicle.vehicle_name);
    form.setValue('vehicle_plate', vehicle.plate);
  };

  const handleServiceSelect = (service: Service) => {
    const newService: ServiceItem = {
      service_id: service.id,
      service_name: service.name,
      service_category: service.category,
      quantity: 1,
      unit_price: service.unit_price,
      total_price: service.unit_price,
    };
    
    setServices([...services, newService]);
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const updateServiceQuantity = (index: number, quantity: number) => {
    const newServices = [...services];
    newServices[index].quantity = quantity;
    newServices[index].total_price = quantity * newServices[index].unit_price;
    setServices(newServices);
  };

  useEffect(() => {
    const total = services.reduce((sum, service) => sum + service.total_price, 0);
    setTotalAmount(total);
  }, [services]);

  const onSubmit = async (data: BudgetFormData) => {
    if (services.length === 0) {
      toast.error('Adicione pelo menos um serviço ao orçamento');
      return;
    }

    if (!user) {
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
        vehicle_year: data.vehicle_year || null,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        observations: data.observations,
        status: 'Pendente',
      };

      const budget = await createBudget.mutateAsync(budgetData);

      const budgetItems = services.map(service => ({
        budget_id: budget.id,
        service_id: service.service_id,
        service_name: service.service_name,
        service_category: service.service_category,
        quantity: service.quantity,
        unit_price: service.unit_price,
        total_price: service.total_price,
      }));

      await createBudgetItems.mutateAsync(budgetItems);
      onComplete();
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background mobile-card-padding lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="mobile-btn lg:h-10 lg:px-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden lg:inline ml-2">Voltar</span>
          </Button>
          <h1 className="mobile-text-lg lg:text-2xl font-bold">Novo Orçamento</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Dados do Veículo */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Dados do Veículo (Opcional)</CardTitle>
                  <VehicleSelector onVehicleSelect={handleVehicleSelect} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veículo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Honda Civic" />
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
                        <FormLabel>Placa</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABC-1234" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vehicle_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="2020" />
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Serviços</CardTitle>
                <ServiceSelector onServiceSelect={handleServiceSelect} />
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{service.service_name}</h4>
                        <p className="text-sm text-muted-foreground">{service.service_category}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateServiceQuantity(index, parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div>
                        <Label>Preço Unitário</Label>
                        <Input
                          type="number"
                          value={service.unit_price.toFixed(2)}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      
                      <div>
                        <Label>Total</Label>
                        <Input
                          type="number"
                          value={service.total_price.toFixed(2)}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {services.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum serviço adicionado ainda.</p>
                    <p className="text-sm">Use o botão "Adicionar Serviço" para começar.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo do Orçamento */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desconto (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label>Subtotal</Label>
                      <p className="text-lg font-medium">R$ {totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label>Desconto</Label>
                      <p className="text-lg font-medium">R$ {(form.watch('discount_amount') || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <Label>Total Final</Label>
                      <p className="text-xl font-bold text-primary">
                        R$ {(totalAmount - (form.watch('discount_amount') || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createBudget.isPending || createBudgetItems.isPending}
                className="flex-1"
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
