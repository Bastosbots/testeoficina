
-- Create a helper function to get security audit logs
CREATE OR REPLACE FUNCTION public.get_security_audit_logs()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  action TEXT,
  resource TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    sal.id,
    sal.user_id,
    sal.action,
    sal.resource,
    sal.details,
    sal.ip_address,
    sal.user_agent,
    sal.created_at,
    p.full_name as user_name
  FROM public.security_audit_log sal
  LEFT JOIN public.profiles p ON sal.user_id = p.id
  ORDER BY sal.created_at DESC;
END;
$$;
