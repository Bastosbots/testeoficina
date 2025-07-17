
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  mechanic_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  vehicle_name: string;
  vehicle_plate: string;
  vehicle_year?: string;
  budget_number: string;
  total_amount: number;
  discount_amount?: number;
  final_amount: number;
  observations?: string;
  valid_until?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  service_name: string;
  service_category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export const useBudgets = () => {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Budget[];
    },
  });
};

export const useBudgetItems = (budgetId: string) => {
  return useQuery({
    queryKey: ['budget-items', budgetId],
    queryFn: async () => {
      if (!budgetId) return [];
      
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('budget_id', budgetId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as BudgetItem[];
    },
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetData: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'budget_number'>) => {
      // Gerar número do orçamento
      const { data: budgetNumber, error: numberError } = await supabase.rpc('generate_budget_number');
      if (numberError) throw numberError;

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budgetData,
          budget_number: budgetNumber
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar orçamento:', error);
      toast.error('Erro ao criar orçamento');
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...budgetData }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(budgetData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar orçamento:', error);
      toast.error('Erro ao atualizar orçamento');
    },
  });
};

export const useCreateBudgetItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Omit<BudgetItem, 'id' | 'created_at'>[]) => {
      const { data, error } = await supabase
        .from('budget_items')
        .insert(items)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['budget-items', variables[0].budget_id] });
      }
    },
    onError: (error) => {
      console.error('Erro ao criar itens do orçamento:', error);
      toast.error('Erro ao adicionar itens ao orçamento');
    },
  });
};
