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

export const useUpdateUserData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, email, fullName, username }: { userId: string, email?: string, fullName?: string, username?: string }) => {
      console.log('Updating user data:', userId, { email, fullName, username });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('update-user-data', {
        body: { userId, email, fullName, username },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        console.error('Erro ao chamar função:', error);
        throw new Error(error.message || 'Erro ao alterar dados do usuário');
      }

      if (data.error) {
        console.error('Erro na função:', data.error);
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      console.log('Dados do usuário alterados com sucesso');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Dados do usuário alterados com sucesso!');
    },
    onError: (error: any) => {
      console.error('User data update error:', error);
      toast.error('Erro ao alterar dados: ' + error.message);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const updateUserDataMutation = useUpdateUserData();
  
  return useMutation({
    mutationFn: async ({ id, username, role }: { id: string, username: string, role: string }) => {
      console.log('Updating profile with ID:', id, 'Data:', { username, role });
      
      // Primeiro, buscar os dados atuais do usuário para comparar
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', id)
        .single();

      if (!currentProfile) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se o username já existe em outro usuário
      const { data: usernameCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', id)
        .maybeSingle();

      if (usernameCheck) {
        throw new Error('Nome de usuário já está em uso');
      }

      // Se o username mudou, usar a função para sincronizar com o Auth
      if (username !== currentProfile.username) {
        console.log('Username changed, updating via edge function');
        await updateUserDataMutation.mutateAsync({
          userId: id,
          username: username
        });
      }

      // Atualizar o role no perfil se necessário
      if (role !== currentProfile.role) {
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            role: role,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select('*');
        
        if (error) {
          console.error('Update role error:', error);
          throw new Error(`Erro ao atualizar role: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          throw new Error('Nenhuma linha foi atualizada. Usuário não encontrado.');
        }
        
        return data[0];
      }

      // Se só o username mudou, buscar os dados atualizados
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      return updatedProfile;
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
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { userId, newPassword },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        console.error('Erro ao chamar função:', error);
        throw new Error(error.message || 'Erro ao alterar senha');
      }

      if (data.error) {
        console.error('Erro na função:', data.error);
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      console.log('Senha alterada com sucesso');
      toast.success('Senha alterada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Password update error:', error);
      toast.error('Erro ao alterar senha: ' + error.message);
    },
  });
};
