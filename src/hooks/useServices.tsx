
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtime } from './useRealtime';

export interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
  unit_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useServices = () => {
  // Setup realtime subscription
  useRealtime({
    table: 'services',
    queryKey: ['services']
  });

  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useAllServices = () => {
  // Setup realtime subscription
  useRealtime({
    table: 'services',
    queryKey: ['all-services']
  });

  return useQuery({
    queryKey: ['all-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Serviço criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar serviço:', error);
      toast.error('Erro ao criar serviço');
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...serviceData }: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Serviço atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar serviço:', error);
      toast.error('Erro ao atualizar serviço');
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Serviço excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir serviço:', error);
      toast.error('Erro ao excluir serviço');
    },
  });
};
