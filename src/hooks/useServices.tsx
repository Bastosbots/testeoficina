
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Buscando serviços...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar serviços:', error);
        throw error;
      }
      
      console.log('Serviços encontrados:', data);
      return data as Service[];
    },
  });
};
