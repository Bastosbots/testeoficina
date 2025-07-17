
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
      
      // Primeiro vamos verificar se o perfil existe
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      console.log('Existing profile check:', existingProfile, checkError);
      
      if (checkError) {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }
      
      if (!existingProfile) {
        throw new Error('Perfil não encontrado');
      }
      
      // Verificar se há mudanças reais nos dados
      const hasChanges = Object.keys(updateData).some(key => {
        return existingProfile[key] !== updateData[key];
      });
      
      console.log('Has changes:', hasChanges);
      
      if (!hasChanges) {
        console.log('No changes detected, returning existing profile');
        return existingProfile;
      }
      
      // Agora fazemos a atualização
      const { data, error, count } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      console.log('Update result:', { data, error, count });
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      if (!data) {
        // Tentar buscar o perfil novamente para ver se a atualização funcionou
        const { data: updatedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        console.log('Refetch after update:', updatedProfile, fetchError);
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (updatedProfile) {
          return updatedProfile;
        }
        
        throw new Error('Erro ao atualizar: perfil não encontrado após atualização');
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
