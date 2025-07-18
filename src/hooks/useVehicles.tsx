
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtime } from './useRealtime';

export interface Vehicle {
  id: string;
  customer_name: string;
  vehicle_name: string;
  plate: string;
  status: string;
  priority: string;
  service_order: string;
  scheduled_time?: string;
  created_at: string;
  updated_at: string;
}

export const useVehicles = () => {
  // Setup realtime subscription
  useRealtime({
    table: 'vehicles',
    queryKey: ['vehicles']
  });

  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Vehicle[];
    },
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Veículo criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar veículo:', error);
      toast.error('Erro ao criar veículo');
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vehicleData }: Partial<Vehicle> & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Veículo atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar veículo:', error);
      toast.error('Erro ao atualizar veículo');
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Veículo excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir veículo:', error);
      toast.error('Erro ao excluir veículo');
    },
  });
};
