
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSecurityAudit = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['security-audit'],
    queryFn: async () => {
      if (profile?.role !== 'admin') {
        throw new Error('Access denied: Admin role required');
      }

      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: profile?.role === 'admin',
  });
};

export const useLogSecurityEvent = () => {
  return async (action: string, resource: string, details?: any) => {
    try {
      const { error } = await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource: resource,
        p_details: details ? JSON.stringify(details) : null
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (err) {
      console.error('Security logging error:', err);
    }
  };
};
