import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useInviteTokens = () => {
  const queryClient = useQueryClient();

  // Configurar listener de realtime
  useEffect(() => {
    const channel = supabase
      .channel('invite-tokens-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invite_tokens'
        },
        (payload) => {
          console.log('Realtime invite token change:', payload);
          queryClient.invalidateQueries({ queryKey: ['invite-tokens'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['invite-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invite_tokens')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateInviteToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tokenData: any) => {
      const { data, error } = await supabase
        .from('invite_tokens')
        .insert([tokenData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invite-tokens'] });
      toast.success('Token de convite criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar token: ' + error.message);
    },
  });
};

export const useDeleteInviteToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invite_tokens')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invite-tokens'] });
      toast.success('Token deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao deletar token: ' + error.message);
    },
  });
};