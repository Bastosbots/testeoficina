import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtime } from './useRealtime';

export interface Budget {
  id: string;
  mechanic_id: string;
  customer_name: string;
  vehicle_name?: string;
  vehicle_plate?: string;
  vehicle_year?: string;
  budget_number: string;
  total_amount: number;
  discount_amount?: number;
  final_amount: number;
  observations?: string;
  status: string;
  created_at: string;
  updated_at: string;
  mechanic?: {
    full_name: string;
  };
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  service_id?: string;
  service_name: string;
  service_category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export const useBudgets = () => {
  // Setup realtime subscription using the centralized hook
  useRealtime({
    table: 'budgets',
    queryKey: ['budgets'],
    channelName: 'budgets-realtime'
  });

  // Also listen to budget_items changes to refresh budgets list
  useRealtime({
    table: 'budget_items',
    queryKey: ['budgets'],
    channelName: 'budget-items-for-budgets'
  });

  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      console.log('Fetching budgets data...');
      
      // First get all budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (budgetsError) {
        console.error('Error fetching budgets:', budgetsError);
        throw budgetsError;
      }

      // Then get all mechanics
      const { data: mechanics, error: mechanicsError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (mechanicsError) {
        console.error('Error fetching mechanics:', mechanicsError);
        throw mechanicsError;
      }

      // Combine the data
      const budgetsWithMechanics = budgets?.map(budget => ({
        ...budget,
        mechanic: mechanics?.find(m => m.id === budget.mechanic_id) || null
      })) || [];

      console.log('Budgets fetched successfully:', budgetsWithMechanics.length, 'budgets');
      return budgetsWithMechanics as Budget[];
    },
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

export const useBudgetItems = (budgetId: string) => {
  // Setup realtime subscription for budget items
  useRealtime({
    table: 'budget_items',
    queryKey: ['budget-items', budgetId],
    filter: `budget_id=eq.${budgetId}`,
    channelName: `budget-items-${budgetId}`
  });

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
    enabled: !!budgetId,
    staleTime: 0,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetData: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'budget_number' | 'mechanic'>) => {
      // Gerar número do orçamento
      const { data: budgetNumber, error: numberError } = await supabase.rpc('generate_budget_number');
      
      if (numberError) {
        throw new Error(`Erro ao gerar número do orçamento: ${numberError.message}`);
      }

      const budgetToInsert = {
        ...budgetData,
        budget_number: budgetNumber
      };

      const { data, error } = await supabase
        .from('budgets')
        .insert(budgetToInsert)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar orçamento: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate multiple queries to ensure immediate UI update
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Orçamento criado com sucesso!');
      console.log('Budget created successfully, queries invalidated');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao criar orçamento: ${errorMessage}`);
      console.error('Error creating budget:', error);
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
      // Invalidate multiple queries to ensure immediate UI update
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Orçamento atualizado com sucesso!');
      console.log('Budget updated successfully, queries invalidated');
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

      if (error) {
        throw new Error(`Erro ao criar itens do orçamento: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate multiple queries to ensure immediate UI update
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast.success('Itens do orçamento adicionados com sucesso!');
      console.log('Budget items created successfully, queries invalidated');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao adicionar itens ao orçamento: ${errorMessage}`);
      console.error('Error creating budget items:', error);
    },
  });
};

export const useUpdateBudgetItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ budgetId, items }: { budgetId: string; items: Omit<BudgetItem, 'id' | 'created_at' | 'budget_id'>[] }) => {
      // Primeiro, deletar todos os itens existentes do orçamento
      const { error: deleteError } = await supabase
        .from('budget_items')
        .delete()
        .eq('budget_id', budgetId);

      if (deleteError) {
        throw new Error(`Erro ao remover itens antigos: ${deleteError.message}`);
      }

      // Depois inserir os novos itens
      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          ...item,
          budget_id: budgetId
        }));

        const { data, error: insertError } = await supabase
          .from('budget_items')
          .insert(itemsToInsert)
          .select();

        if (insertError) {
          throw new Error(`Erro ao inserir novos itens: ${insertError.message}`);
        }

        return data;
      }

      return [];
    },
    onSuccess: () => {
      // Invalidate multiple queries to ensure immediate UI update
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast.success('Itens do orçamento atualizados com sucesso!');
      console.log('Budget items updated successfully, queries invalidated');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao atualizar itens do orçamento: ${errorMessage}`);
      console.error('Error updating budget items:', error);
    },
  });
};
