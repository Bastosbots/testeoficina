
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealtime } from './useRealtime';

export interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  role: 'admin' | 'mechanic';
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  // Setup realtime subscription
  useRealtime({
    table: 'profiles',
    queryKey: ['profiles']
  });

  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      fullName, 
      username 
    }: { 
      userId: string; 
      fullName?: string; 
      username?: string; 
    }) => {
      const { error } = await supabase.rpc('update_user_profile', {
        p_user_id: userId,
        p_full_name: fullName || null,
        p_username: username || null
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao atualizar perfil: ${message}`);
    },
  });
};
