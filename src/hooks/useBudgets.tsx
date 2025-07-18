
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
  const queryClient = useQueryClient();

  // Setup realtime subscription
  useEffect(() => {
    console.log('Setting up realtime subscription for budgets');
    
    const channel = supabase
      .channel('budgets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets'
        },
        (payload) => {
          console.log('Budget change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_items'
        },
        (payload) => {
          console.log('Budget items change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
          
          // Type guard para verificar se payload tem new
          if (payload.new && typeof payload.new === 'object' && 'budget_id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['budget-items', payload.new.budget_id] });
          }
          
          // Type guard para verificar se payload tem old
          if (payload.old && typeof payload.old === 'object' && 'budget_id' in payload.old) {
            queryClient.invalidateQueries({ queryKey: ['budget-items', payload.old.budget_id] });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription for budgets');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      // First get all budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (budgetsError) throw budgetsError;

      // Then get all mechanics
      const { data: mechanics, error: mechanicsError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (mechanicsError) throw mechanicsError;

      // Combine the data
      const budgetsWithMechanics = budgets?.map(budget => ({
        ...budget,
        mechanic: mechanics?.find(m => m.id === budget.mechanic_id) || null
      })) || [];

      return budgetsWithMechanics as Budget[];
    },
  });
};

export const useBudgetItems = (budgetId: string) => {
  const queryClient = useQueryClient();

  // Setup realtime subscription for budget items
  useEffect(() => {
    if (!budgetId) return;

    console.log('Setting up realtime subscription for budget items:', budgetId);
    
    const channel = supabase
      .channel(`budget-items-${budgetId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_items',
          filter: `budget_id=eq.${budgetId}`
        },
        (payload) => {
          console.log('Budget item change detected for budget:', budgetId, payload);
          queryClient.invalidateQueries({ queryKey: ['budget-items', budgetId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription for budget items:', budgetId);
      supabase.removeChannel(channel);
    };
  }, [budgetId, queryClient]);

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
      // No need to manually invalidate as realtime will handle it
      toast.success('Orçamento criado com sucesso!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao criar orçamento: ${errorMessage}`);
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
      // No need to manually invalidate as realtime will handle it
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

      if (error) {
        throw new Error(`Erro ao criar itens do orçamento: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // No need to manually invalidate as realtime will handle it
      toast.success('Itens do orçamento adicionados com sucesso!');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao adicionar itens ao orçamento: ${errorMessage}`);
    },
  });
};
