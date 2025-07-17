
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
      
      // Primeiro vamos verificar quantos registros existem com esse ID
      const { data: checkData, error: checkError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('id', id);
      
      console.log('Profile check - Count:', count, 'Data:', checkData, 'Error:', checkError);
      
      if (checkError) {
        console.error('Error checking profile:', checkError);
        throw checkError;
      }
      
      if (count === 0) {
        throw new Error('Perfil não encontrado');
      }
      
      if (count && count > 1) {
        console.error('Multiple profiles found with same ID:', count);
        throw new Error('Múltiplos perfis encontrados com o mesmo ID');
      }
      
      // Agora fazer o update sem usar .single() para evitar o erro
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select('*');
      
      console.log('Update result:', { data, error });
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Nenhuma linha foi atualizada');
      }
      
      if (data.length > 1) {
        console.warn('Multiple rows updated:', data.length);
      }
      
      console.log('Profile updated successfully:', data[0]);
      return data[0]; // Retornar o primeiro registro
    },
    onSuccess: (data) => {
      console.log('Mutation success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao atualizar perfil: ' + error.message);
    },
  });
};
