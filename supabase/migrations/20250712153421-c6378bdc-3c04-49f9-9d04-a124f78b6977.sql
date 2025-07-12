
-- Criar tabela para tokens de convite
CREATE TABLE public.invite_tokens (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    token text NOT NULL UNIQUE,
    created_by uuid REFERENCES public.profiles(id) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    used_by uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem tokens
CREATE POLICY "Admins can manage invite tokens" 
ON public.invite_tokens 
FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Política para visualizar tokens válidos (para o processo de cadastro)
CREATE POLICY "Anyone can view valid tokens" 
ON public.invite_tokens 
FOR SELECT 
USING (expires_at > now() AND used_at IS NULL);
