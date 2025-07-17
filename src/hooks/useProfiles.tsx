
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
      
      // Verificar se o perfil existe e se o usuário tem permissão para editá-lo
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se o usuário atual é admin
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.user.id)
        .single();

      if (!currentProfile || currentProfile.role !== 'admin') {
        throw new Error('Sem permissão para editar usuários');
      }

      // Fazer o update do perfil
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
        throw new Error('Perfil não encontrado ou sem permissão para atualizar');
      }
      
      console.log('Profile updated successfully:', data[0]);
      return data[0];
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

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string, newPassword: string }) => {
      console.log('Updating password for user:', userId);
      
      // Verificar se o usuário atual é admin
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.user.id)
        .single();

      if (!currentProfile || currentProfile.role !== 'admin') {
        throw new Error('Sem permissão para alterar senhas');
      }

      // Como não podemos usar auth.admin no cliente, vamos orientar o usuário
      // a fazer isso através do painel do Supabase ou implementar uma edge function
      throw new Error('Alteração de senha deve ser feita através do painel administrativo do Supabase');
    },
    onError: (error: any) => {
      console.error('Password update error:', error);
      toast.error('Erro ao alterar senha: ' + error.message);
    },
  });
};
