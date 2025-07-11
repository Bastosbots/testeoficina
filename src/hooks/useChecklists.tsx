
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useChecklists = () => {
  return useQuery({
    queryKey: ['checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          vehicles:vehicle_id (*),
          profiles:mechanic_id (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateChecklist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checklistData: any) => {
      const { data, error } = await supabase
        .from('checklists')
        .insert([checklistData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar checklist: ' + error.message);
    },
  });
};

export const useUpdateChecklist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('checklists')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar checklist: ' + error.message);
    },
  });
};
