
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SystemSettings {
  id: string;
  system_name: string | null;
  system_description: string | null;
  company_name: string | null;
  company_cnpj: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  company_logo_url: string | null;
  app_name: string | null;
  app_description: string | null;
  app_icon_url: string | null;
  app_theme_color: string | null;
  app_background_color: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as SystemSettings;
    }
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<SystemSettings>) => {
      // Remover o ID dos dados de atualização
      const { id, ...updateData } = settings;
      
      if (!id) {
        throw new Error('ID não fornecido para atualização');
      }
      
      const { data, error } = await supabase
        .from('system_settings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Configurações atualizadas com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações');
    }
  });
};
