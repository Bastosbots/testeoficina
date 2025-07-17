
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useChecklistItems = (checklistId: string) => {
  const queryClient = useQueryClient();

  // Configurar listener de realtime para checklist_items
  useEffect(() => {
    const channel = supabase
      .channel('checklist-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklist_items'
        },
        (payload) => {
          console.log('Realtime checklist items change:', payload);
          queryClient.invalidateQueries({ queryKey: ['checklist-items', checklistId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, checklistId]);

  return useQuery({
    queryKey: ['checklist-items', checklistId],
    queryFn: async () => {
      if (!checklistId) return [];
      
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('category');
      
      if (error) throw error;
      return data;
    },
    enabled: !!checklistId,
  });
};
