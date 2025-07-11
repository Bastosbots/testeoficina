
-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'mechanic' CHECK (role IN ('admin', 'mechanic')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de veículos
CREATE TABLE public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_name TEXT NOT NULL,
    plate TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    service_order TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Média' CHECK (priority IN ('Alta', 'Média', 'Baixa')),
    scheduled_time TIME,
    status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Andamento', 'Concluído')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de checklists
CREATE TABLE public.checklists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    mechanic_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    general_observations TEXT,
    video_url TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de itens do checklist
CREATE TABLE public.checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para vehicles
CREATE POLICY "Users can view all vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Admins can manage vehicles" ON public.vehicles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Políticas para checklists
CREATE POLICY "Users can view all checklists" ON public.checklists FOR SELECT USING (true);
CREATE POLICY "Mechanics can create checklists" ON public.checklists FOR INSERT WITH CHECK (
    auth.uid() = mechanic_id
);
CREATE POLICY "Mechanics can update own checklists" ON public.checklists FOR UPDATE USING (
    auth.uid() = mechanic_id
);

-- Políticas para checklist_items
CREATE POLICY "Users can view checklist items" ON public.checklist_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.checklists WHERE id = checklist_id)
);
CREATE POLICY "Users can manage checklist items" ON public.checklist_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.checklists 
        WHERE id = checklist_id AND mechanic_id = auth.uid()
    )
);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'mechanic')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir alguns dados de exemplo
INSERT INTO public.vehicles (vehicle_name, plate, customer_name, service_order, priority, scheduled_time) VALUES
('Honda Civic', 'ABC-1234', 'Maria Silva', 'OS-001', 'Alta', '09:00:00'),
('Toyota Corolla', 'XYZ-5678', 'João Santos', 'OS-002', 'Média', '14:30:00'),
('Ford Focus', 'DEF-9012', 'Ana Costa', 'OS-003', 'Baixa', '16:00:00');

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
