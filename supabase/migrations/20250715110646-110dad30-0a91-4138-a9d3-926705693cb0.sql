
-- Remover a referência de foreign key de vehicles na tabela checklists
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS checklists_vehicle_id_fkey;

-- Adicionar colunas de dados do veículo diretamente na tabela checklists
ALTER TABLE public.checklists 
ADD COLUMN IF NOT EXISTS vehicle_name TEXT,
ADD COLUMN IF NOT EXISTS plate TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS service_order TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Média' CHECK (priority IN ('Alta', 'Média', 'Baixa'));

-- Remover a coluna vehicle_id se existir (depois de migrar dados se necessário)
-- Primeiro vamos atualizar os dados existentes
UPDATE public.checklists 
SET 
  vehicle_name = v.vehicle_name,
  plate = v.plate,
  customer_name = v.customer_name,
  service_order = v.service_order,
  priority = v.priority
FROM public.vehicles v 
WHERE checklists.vehicle_id = v.id;

-- Agora podemos remover a coluna vehicle_id
ALTER TABLE public.checklists DROP COLUMN IF EXISTS vehicle_id;

-- Atualizar política para permitir que admins também criem checklists
DROP POLICY IF EXISTS "Mechanics can create checklists" ON public.checklists;
CREATE POLICY "Users can create checklists" ON public.checklists
  FOR INSERT WITH CHECK (
    auth.uid() = mechanic_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tornar as novas colunas obrigatórias (NOT NULL)
ALTER TABLE public.checklists 
ALTER COLUMN vehicle_name SET NOT NULL,
ALTER COLUMN plate SET NOT NULL,
ALTER COLUMN customer_name SET NOT NULL,
ALTER COLUMN service_order SET NOT NULL;
