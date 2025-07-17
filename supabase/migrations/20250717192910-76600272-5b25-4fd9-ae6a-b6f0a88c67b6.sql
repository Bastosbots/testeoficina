
-- Criar tabela para orçamentos
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mechanic_id UUID REFERENCES auth.users NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  vehicle_name TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  vehicle_year TEXT,
  budget_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  observations TEXT,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para itens do orçamento (serviços)
CREATE TABLE public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_budgets_mechanic_id ON public.budgets(mechanic_id);
CREATE INDEX idx_budgets_status ON public.budgets(status);
CREATE INDEX idx_budgets_created_at ON public.budgets(created_at);
CREATE INDEX idx_budget_items_budget_id ON public.budget_items(budget_id);

-- Habilitar RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para budgets
CREATE POLICY "Users can view all budgets" 
  ON public.budgets 
  FOR SELECT 
  USING (true);

CREATE POLICY "Mechanics can create budgets" 
  ON public.budgets 
  FOR INSERT 
  WITH CHECK (auth.uid() = mechanic_id);

CREATE POLICY "Mechanics can update their budgets" 
  ON public.budgets 
  FOR UPDATE 
  USING (auth.uid() = mechanic_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can delete budgets" 
  ON public.budgets 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Políticas RLS para budget_items
CREATE POLICY "Users can view budget items" 
  ON public.budget_items 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM budgets 
    WHERE budgets.id = budget_items.budget_id
  ));

CREATE POLICY "Mechanics can manage budget items" 
  ON public.budget_items 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM budgets 
    WHERE budgets.id = budget_items.budget_id 
    AND (budgets.mechanic_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ))
  ));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_budgets_updated_at_trigger
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_budgets_updated_at();

-- Função para gerar número do orçamento
CREATE OR REPLACE FUNCTION generate_budget_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    budget_number TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(budget_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM budgets
    WHERE budget_number LIKE year_part || '-%';
    
    budget_number := year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN budget_number;
END;
$$ LANGUAGE plpgsql;
