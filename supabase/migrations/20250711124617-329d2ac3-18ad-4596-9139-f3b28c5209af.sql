
-- Inserir usuário administrador padrão na tabela auth.users
-- Primeiro, vamos criar o usuário admin com email temporário
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at
) VALUES (
    'admin-uuid-12345678-1234-1234-1234-123456789012',
    '00000000-0000-0000-0000-000000000000',
    'admin@mecsys.local',
    crypt('admin', gen_salt('bf')),
    now(),
    '{"full_name": "Administrador", "role": "admin", "username": "admin"}',
    'authenticated',
    'authenticated',
    now(),
    now()
);

-- Inserir o perfil do administrador na tabela profiles
INSERT INTO public.profiles (id, full_name, role, username, created_at, updated_at)
VALUES (
    'admin-uuid-12345678-1234-1234-1234-123456789012',
    'Administrador',
    'admin',
    'admin',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Atualizar política RLS para permitir que apenas admins vejam todos os perfis para cadastro
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);

-- Adicionar política para permitir que apenas admins insiram novos perfis
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
