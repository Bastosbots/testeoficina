
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
    mutationFn: async ({ userId, email, fullName }: { userId: string, email?: string, fullName?: string }) => {
      console.log('Updating user data:', userId, { email, fullName });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('update-user-data', {
        body: { userId, email, fullName },
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
  
  return useMutation({
    mutationFn: async ({ id, username, role }: { id: string, username: string, role: string }) => {
      console.log('Updating profile with ID:', id, 'Data:', { username, role });
      
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

      // Atualizar o perfil (as políticas RLS agora permitem que admins atualizem qualquer perfil)
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          username: username,
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*');
      
      console.log('Update result:', { data, error });
      
      if (error) {
        console.error('Update error:', error);
        throw new Error(`Erro ao atualizar perfil: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        throw new Error('Nenhuma linha foi atualizada. Usuário não encontrado.');
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
