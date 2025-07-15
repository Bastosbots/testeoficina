
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useChecklistItems = (checklistId: string) => {
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
