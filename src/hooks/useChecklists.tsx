
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
    mutationFn: async ({ checklistData, items }: { checklistData: any, items: any[] }) => {
      console.log('Creating checklist with data:', { checklistData, items });
      
      // Criar o checklist
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists')
        .insert([checklistData])
        .select()
        .single();
      
      if (checklistError) {
        console.error('Error creating checklist:', checklistError);
        throw checklistError;
      }

      console.log('Checklist created:', checklist);

      // Salvar os itens usando a função do banco
      if (items && items.length > 0) {
        const { error: itemsError } = await supabase.rpc('save_checklist_items', {
          p_checklist_id: checklist.id,
          p_items: items
        });

        if (itemsError) {
          console.error('Error saving checklist items:', itemsError);
          throw itemsError;
        }

        console.log('Checklist items saved successfully');
      }
      
      return checklist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Full error object:', error);
      toast.error('Erro ao criar checklist: ' + error.message);
    },
  });
};

export const useUpdateChecklist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updateData, items }: { id: string, updateData: any, items?: any[] }) => {
      console.log('Updating checklist:', { id, updateData, items });
      
      // Atualizar o checklist
      const { data, error } = await supabase
        .from('checklists')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating checklist:', error);
        throw error;
      }

      // Atualizar os itens se fornecidos
      if (items && items.length > 0) {
        const { error: itemsError } = await supabase.rpc('save_checklist_items', {
          p_checklist_id: id,
          p_items: items
        });

        if (itemsError) {
          console.error('Error updating checklist items:', itemsError);
          throw itemsError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error('Erro ao atualizar checklist: ' + error.message);
    },
  });
};

export const useDeleteChecklist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist deletado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao deletar checklist: ' + error.message);
    },
  });
};
