
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { SecurityAuditLog } from '@/types/security';

export const useSecurityAudit = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['security-audit'],
    queryFn: async (): Promise<SecurityAuditLog[]> => {
      if (profile?.role !== 'admin') {
        throw new Error('Access denied: Admin role required');
      }

      try {
        // Query the security_audit_log table directly using SQL
        const { data, error } = await supabase
          .rpc('get_security_audit_logs' as any)
          .limit(100);
        
        if (error) {
          // Fallback to empty array if function doesn't exist yet
          console.warn('Security audit logs not available:', error);
          return [];
        }
        
        return (data as SecurityAuditLog[]) || [];
      } catch (err) {
        console.warn('Security audit logs not available:', err);
        return [];
      }
    },
    enabled: profile?.role === 'admin',
  });
};

export const useLogSecurityEvent = () => {
  return async (action: string, resource: string, details?: any) => {
    try {
      // Try to call the log_security_event function
      const { error } = await supabase.rpc('log_security_event' as any, {
        p_action: action,
        p_resource: resource,
        p_details: details ? JSON.stringify(details) : null
      });

      if (error) {
        console.error('Failed to log security event:', error);
        // Fallback: log to console for now
        console.log('Security Event:', { action, resource, details });
      }
    } catch (err) {
      console.error('Security logging error:', err);
      // Fallback: log to console for now
      console.log('Security Event:', { action, resource, details });
    }
  };
};
