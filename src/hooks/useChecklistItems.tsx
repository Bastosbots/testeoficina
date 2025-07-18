
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_CHECKLIST_ITEMS = [
  { id: 'oil', name: 'Nível de Óleo', category: 'Motor', checked: false, observation: '' },
  { id: 'coolant', name: 'Líquido de Arrefecimento', category: 'Motor', checked: false, observation: '' },
  { id: 'brake-fluid', name: 'Fluido de Freio', category: 'Freios', checked: false, observation: '' },
  { id: 'brake-pads', name: 'Pastilhas de Freio', category: 'Freios', checked: false, observation: '' },
  { id: 'front-tires', name: 'Pneus Dianteiros', category: 'Pneus', checked: false, observation: '' },
  { id: 'rear-tires', name: 'Pneus Traseiros', category: 'Pneus', checked: false, observation: '' },
  { id: 'tire-pressure', name: 'Pressão dos Pneus', category: 'Pneus', checked: false, observation: '' },
  { id: 'battery', name: 'Bateria', category: 'Elétrico', checked: false, observation: '' },
  { id: 'lights', name: 'Sistema de Iluminação', category: 'Elétrico', checked: false, observation: '' },
  { id: 'air-filter', name: 'Filtro de Ar', category: 'Filtros', checked: false, observation: '' },
  { id: 'cabin-filter', name: 'Filtro do Ar Condicionado', category: 'Filtros', checked: false, observation: '' },
  { id: 'suspension', name: 'Sistema de Suspensão', category: 'Suspensão', checked: false, observation: '' }
];

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
      if (!checklistId) return DEFAULT_CHECKLIST_ITEMS;
      
      const { data: savedItems, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('category');
      
      if (error) throw error;

      // Mesclar itens padrão com itens salvos
      const mergedItems = DEFAULT_CHECKLIST_ITEMS.map(defaultItem => {
        const savedItem = savedItems?.find(saved => saved.item_name === defaultItem.name);
        
        if (savedItem) {
          return {
            id: savedItem.id,
            item_name: savedItem.item_name,
            category: savedItem.category,
            checked: savedItem.checked || false,
            observation: savedItem.observation || ''
          };
        }
        
        // Se não foi salvo, retorna o item padrão
        return {
          id: defaultItem.id,
          item_name: defaultItem.name,
          category: defaultItem.category,
          checked: false,
          observation: ''
        };
      });

      return mergedItems;
    },
    enabled: !!checklistId,
  });
};
