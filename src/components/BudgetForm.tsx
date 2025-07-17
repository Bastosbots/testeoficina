
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Minus, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCreateBudget, useCreateBudgetItems } from '@/hooks/useBudgets';
import { toast } from 'sonner';

const budgetSchema = z.object({
  customer_name: z.string().min(2, 'Nome do cliente é obrigatório'),
  customer_phone: z.string().optional(),
  customer_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  vehicle_name: z.string().min(2, 'Nome do veículo é obrigatório'),
  vehicle_plate: z.string().min(3, 'Placa do veículo é obrigatória'),
  vehicle_year: z.string().optional(),
  discount_amount: z.number().min(0, 'Desconto não pode ser negativo').optional(),
  observations: z.string().optional(),
  valid_until: z.date().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface ServiceItem {
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
      customer_phone: '',
      customer_email: '',
      vehicle_name: '',
      vehicle_plate: '',
      vehicle_year: '',
      discount_amount: 0,
      observations: '',
    },
  });

  const addService = () => {
    setServices([...services, {
      service_name: '',
      service_category: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    }]);
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const updateService = (index: number, field: keyof ServiceItem, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newServices[index].total_price = newServices[index].quantity * newServices[index].unit_price;
    }
    
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
        customer_phone: data.customer_phone,
        customer_email: data.customer_email,
        vehicle_name: data.vehicle_name,
        vehicle_plate: data.vehicle_plate,
        vehicle_year: data.vehicle_year,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        observations: data.observations,
        valid_until: data.valid_until?.toISOString().split('T')[0],
        status: 'Pendente',
      };

      const budget = await createBudget.mutateAsync(budgetData);

      const budgetItems = services.map(service => ({
        budget_id: budget.id,
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <FormField
                    control={form.control}
                    name="customer_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customer_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
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
                <CardTitle>Dados do Veículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veículo *</FormLabel>
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
                        <FormLabel>Placa *</FormLabel>
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
                <Button type="button" onClick={addService} className="mobile-btn lg:h-10 lg:px-4">
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline ml-2">Adicionar Serviço</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Serviço {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Serviço *</Label>
                        <Input
                          value={service.service_name}
                          onChange={(e) => updateService(index, 'service_name', e.target.value)}
                          placeholder="Ex: Troca de óleo"
                        />
                      </div>
                      
                      <div>
                        <Label>Categoria *</Label>
                        <Input
                          value={service.service_category}
                          onChange={(e) => updateService(index, 'service_category', e.target.value)}
                          placeholder="Ex: Manutenção"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Quantidade *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      
                      <div>
                        <Label>Preço Unitário *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.unit_price}
                          onChange={(e) => updateService(index, 'unit_price', parseFloat(e.target.value) || 0)}
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
                    <Button type="button" onClick={addService} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Serviço
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo e Detalhes Finais */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="valid_until"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Válido até</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Selecionar data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
