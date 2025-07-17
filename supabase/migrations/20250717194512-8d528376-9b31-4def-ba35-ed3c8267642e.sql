
-- Criar tabela de serviços que será gerenciada pela administração
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(is_active);

-- Habilitar RLS para services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para services
CREATE POLICY "Users can view active services" 
  ON public.services 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage services" 
  ON public.services 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Modificar a tabela budget_items para referenciar services
ALTER TABLE public.budget_items ADD COLUMN service_id UUID REFERENCES public.services(id);

-- Remover campos desnecessários da tabela budgets
ALTER TABLE public.budgets DROP COLUMN IF EXISTS customer_phone;
ALTER TABLE public.budgets DROP COLUMN IF EXISTS customer_email;
ALTER TABLE public.budgets DROP COLUMN IF EXISTS valid_until;

-- Tornar campos de veículo opcionais
ALTER TABLE public.budgets ALTER COLUMN vehicle_name DROP NOT NULL;
ALTER TABLE public.budgets ALTER COLUMN vehicle_plate DROP NOT NULL;

-- Trigger para atualizar updated_at em services
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at_trigger
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION update_services_updated_at();

-- Inserir alguns serviços de exemplo
INSERT INTO public.services (name, category, unit_price, description) VALUES
('Troca de Óleo', 'Manutenção', 120.00, 'Troca de óleo do motor com filtro'),
('Alinhamento', 'Suspensão', 80.00, 'Alinhamento das rodas dianteiras'),
('Balanceamento', 'Suspensão', 60.00, 'Balanceamento das 4 rodas'),
('Troca de Pastilhas', 'Freios', 180.00, 'Substituição das pastilhas de freio'),
('Revisão Geral', 'Manutenção', 250.00, 'Revisão completa do veículo'),
('Troca de Pneu', 'Pneus', 150.00, 'Instalação de pneu novo'),
('Diagnóstico Eletrônico', 'Elétrica', 100.00, 'Diagnóstico com scanner automotivo');
