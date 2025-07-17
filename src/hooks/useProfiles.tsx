
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProfiles = () => {
  const queryClient = useQueryClient();

  // Configurar listener de realtime
  useEffect(() => {
    const channel = supabase
      .channel('profiles-list-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Realtime profiles change:', payload);
          queryClient.invalidateQueries({ queryKey: ['profiles'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      console.log('Updating profile with ID:', id, 'Data:', updateData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Perfil não encontrado ou não foi possível atualizar');
      }
      
      console.log('Profile updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao atualizar perfil: ' + error.message);
    },
  });
};
