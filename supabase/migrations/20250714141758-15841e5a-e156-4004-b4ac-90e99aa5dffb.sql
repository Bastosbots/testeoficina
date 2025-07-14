
-- Verificar se já existe usuário admin e limpar se necessário
DO $$
BEGIN
    -- Deletar perfil admin se existir
    DELETE FROM public.profiles WHERE username = 'admin';
    
    -- Deletar usuário auth se existir
    DELETE FROM auth.users WHERE email = 'admin@mecsys.local';
END $$;

-- Inserir usuário administrador na tabela auth.users com ID fixo para garantir consistência
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
    updated_at,
    confirmation_token,
    email_confirmed_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin@mecsys.local',
    crypt('admin', gen_salt('bf')),
    now(),
    '{"full_name": "Administrador", "role": "admin", "username": "admin"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    now()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

-- Inserir o perfil do administrador na tabela profiles
INSERT INTO public.profiles (id, full_name, role, username, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Administrador',
    'admin',
    'admin',
    now(),
    now()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    username = EXCLUDED.username,
    updated_at = now();
