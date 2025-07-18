
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeOptions {
  table: string;
  queryKey: string[];
  filter?: string;
  channelName?: string;
}

export const useRealtime = ({ table, queryKey, filter, channelName }: UseRealtimeOptions) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = channelName || `${table}-changes`;
    
    console.log(`Setting up realtime subscription for ${table}`);
    
    const subscription = supabase
      .channel(channel)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter && { filter })
        },
        (payload) => {
          console.log(`Change detected in ${table}:`, payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      console.log(`Cleaning up realtime subscription for ${table}`);
      supabase.removeChannel(subscription);
    };
  }, [table, JSON.stringify(queryKey), filter, channelName, queryClient]);
};
