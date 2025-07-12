
-- Primeiro, vamos limpar qualquer usuário admin existente para evitar conflitos
DELETE FROM public.profiles WHERE username = 'admin';
DELETE FROM auth.users WHERE email = 'admin@mecsys.local';

-- Inserir usuário administrador padrão na tabela auth.users
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
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@mecsys.local',
    crypt('admin', gen_salt('bf')),
    now(),
    '{"full_name": "Administrador", "role": "admin", "username": "admin"}',
    'authenticated',
    'authenticated',
    now(),
    now()
) ON CONFLICT (email) DO NOTHING;

-- Inserir o perfil do administrador na tabela profiles
-- Usando uma subconsulta para pegar o ID do usuário que acabamos de criar
INSERT INTO public.profiles (id, full_name, role, username, created_at, updated_at)
SELECT 
    u.id,
    'Administrador',
    'admin',
    'admin',
    now(),
    now()
FROM auth.users u 
WHERE u.email = 'admin@mecsys.local'
ON CONFLICT (id) DO NOTHING;
