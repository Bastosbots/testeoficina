
-- Primeiro, vamos criar um usuário admin usando a função do Supabase
-- que vai automaticamente acionar o trigger para criar o perfil

-- Inserir diretamente na tabela auth.users usando a extensão pgcrypto
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    aud,
    role,
    email_confirm_token,
    recovery_token,
    phone_confirm_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin@mecsys.local',
    crypt('admin123', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"username": "admin", "full_name": "Administrador", "role": "admin"}'::jsonb,
    'authenticated',
    'authenticated',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;

-- Garantir que o perfil seja criado na tabela profiles
INSERT INTO public.profiles (
    id,
    username,
    full_name,
    role,
    created_at,
    updated_at
)
SELECT 
    au.id,
    'admin',
    'Administrador',
    'admin',
    now(),
    now()
FROM auth.users au
WHERE au.email = 'admin@mecsys.local'
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();
