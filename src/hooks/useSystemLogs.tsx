
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type SystemLog = Tables<'system_logs'>;

export const useSystemLogs = () => {
  return useQuery({
    queryKey: ['system-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SystemLog[];
    },
  });
};

export const useSystemLogsByTable = (tableName?: string) => {
  return useQuery({
    queryKey: ['system-logs', tableName],
    queryFn: async () => {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (tableName) {
        query = query.eq('table_name', tableName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SystemLog[];
    },
    enabled: !!tableName,
  });
};
