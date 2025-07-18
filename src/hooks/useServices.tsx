
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Service {
  id: string;
  name: string;
  category: string;
  unit_price: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('Buscando serviços cadastrados pela administração...');
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar serviços:', error);
        throw new Error(`Erro ao carregar serviços: ${error.message}`);
      }
      
      console.log('Serviços carregados:', data);
      return data as Service[];
    },
    retry: 3,
    retryDelay: 1000,
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
      queryClient.invalidateQueries({ queryKey: ['services'] });
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
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar serviço:', error);
      toast.error('Erro ao atualizar serviço');
    },
  });
};
