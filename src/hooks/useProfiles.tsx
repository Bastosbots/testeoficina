
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLogSecurityEvent } from '@/hooks/useSecurityAudit';

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
  const logSecurityEvent = useLogSecurityEvent();
  
  return useMutation({
    mutationFn: async ({ userId, fullName, username }: { userId: string, fullName?: string, username?: string }) => {
      console.log('Updating user data via secure function:', userId, { fullName, username });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Usuário não autenticado');
      }

      // Try to use the new secure update function, with fallback to direct update
      try {
        const { error } = await supabase.rpc('update_user_profile', {
          p_user_id: userId,
          p_full_name: fullName || null,
          p_username: username || null
        });

        if (error) {
          console.error('Erro ao chamar função segura:', error);
          
          // Log security event for failed attempts
          await logSecurityEvent('profile_update_failed', 'profiles', {
            target_user_id: userId,
            attempted_changes: { fullName, username },
            error: error.message
          });
          
          throw new Error(error.message || 'Erro ao alterar dados do usuário');
        }

        // Log successful admin action
        await logSecurityEvent('admin_action', 'profiles', {
          action: 'profile_update',
          target_user_id: userId,
          changes: { fullName, username }
        });

      } catch (funcError) {
        // Fallback to direct update if function doesn't exist yet
        console.warn('Function not available, using direct update:', funcError);
        
        const updates: any = {};
        if (fullName !== undefined) updates.full_name = fullName;
        if (username !== undefined) updates.username = username;
        
        const { error: directError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);

        if (directError) {
          await logSecurityEvent('profile_update_failed', 'profiles', {
            target_user_id: userId,
            attempted_changes: { fullName, username },
            error: directError.message
          });
          throw new Error(directError.message);
        }

        await logSecurityEvent('admin_action', 'profiles', {
          action: 'profile_update_direct',
          target_user_id: userId,
          changes: { fullName, username }
        });
      }

      return { success: true };
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
  const logSecurityEvent = useLogSecurityEvent();
  
  return useMutation({
    mutationFn: async ({ id, username, role }: { id: string, username: string, role: string }) => {
      console.log('Updating profile with ID:', id, 'Data:', { username, role });
      
      // First, get current profile data for comparison
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', id)
        .single();

      if (!currentProfile) {
        throw new Error('Usuário não encontrado');
      }

      // Check if username already exists for another user
      const { data: usernameCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', id)
        .maybeSingle();

      if (usernameCheck) {
        await logSecurityEvent('admin_action_failed', 'profiles', {
          action: 'profile_update',
          target_user_id: id,
          error: 'Username already exists',
          attempted_username: username
        });
        throw new Error('Nome de usuário já está em uso');
      }

      // Track what's being changed
      const changes: any = {};
      if (username !== currentProfile.username) changes.username = username;
      if (role !== currentProfile.role) changes.role = role;

      // Update username using secure function if changed and available
      if (username !== currentProfile.username) {
        try {
          const { error } = await supabase.rpc('update_user_profile', {
            p_user_id: id,
            p_username: username
          });

          if (error) {
            await logSecurityEvent('admin_action_failed', 'profiles', {
              action: 'username_update',
              target_user_id: id,
              error: error.message
            });
            throw new Error(`Erro ao atualizar username: ${error.message}`);
          }
        } catch (funcError) {
          // Fallback to direct update if function doesn't exist yet
          console.warn('Function not available, using direct update for username');
          const { error: directError } = await supabase
            .from('profiles')
            .update({ username })
            .eq('id', id);

          if (directError) {
            await logSecurityEvent('admin_action_failed', 'profiles', {
              action: 'username_update_direct',
              target_user_id: id,
              error: directError.message
            });
            throw new Error(`Erro ao atualizar username: ${directError.message}`);
          }
        }
      }

      // Update role directly (only admins can do this due to RLS policy)
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
          
          // Log potential privilege escalation attempt
          await logSecurityEvent('privilege_escalation_attempt', 'profiles', {
            target_user_id: id,
            attempted_role: role,
            current_role: currentProfile.role,
            error: error.message
          });
          
          throw new Error(`Erro ao atualizar role: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          throw new Error('Nenhuma linha foi atualizada. Usuário não encontrado.');
        }
      }

      // Log successful admin action
      await logSecurityEvent('admin_action', 'profiles', {
        action: 'profile_update',
        target_user_id: id,
        changes: changes
      });

      // Get updated profile data
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
  const logSecurityEvent = useLogSecurityEvent();
  
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
        
        await logSecurityEvent('admin_action_failed', 'auth', {
          action: 'password_update',
          target_user_id: userId,
          error: error.message
        });
        
        throw new Error(error.message || 'Erro ao alterar senha');
      }

      if (data.error) {
        console.error('Erro na função:', data.error);
        
        await logSecurityEvent('admin_action_failed', 'auth', {
          action: 'password_update',
          target_user_id: userId,
          error: data.error
        });
        
        throw new Error(data.error);
      }

      // Log successful password change
      await logSecurityEvent('admin_action', 'auth', {
        action: 'password_update',
        target_user_id: userId
      });

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
