
-- Primeiro, vamos criar a tabela security_audit_log se ela não existir
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativar RLS na tabela
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Política para permitir que apenas admins vejam os logs
CREATE POLICY "Admin can view security logs" 
  ON public.security_audit_log 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para permitir inserção de logs
CREATE POLICY "System can insert security logs" 
  ON public.security_audit_log 
  FOR INSERT 
  WITH CHECK (true);

-- Criar a função get_security_audit_logs
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
  -- Verificar se o usuário é admin
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

-- Criar função para registrar eventos de segurança
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource,
    p_details
  );
END;
$$;
