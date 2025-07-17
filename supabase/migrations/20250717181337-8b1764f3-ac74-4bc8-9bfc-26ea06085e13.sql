
-- Remover o status 'Pendente' do sistema
-- Primeiro, vamos atualizar todos os registros que estão como 'Pendente' para 'Em Andamento'
UPDATE public.checklists 
SET status = 'Em Andamento' 
WHERE status = 'Pendente';

UPDATE public.vehicles 
SET status = 'Em Andamento' 
WHERE status = 'Pendente';

-- Atualizar as constraints para remover 'Pendente' dos valores permitidos
ALTER TABLE public.checklists 
DROP CONSTRAINT IF EXISTS checklists_status_check;

ALTER TABLE public.checklists 
ADD CONSTRAINT checklists_status_check 
CHECK (status IN ('Em Andamento', 'Concluído', 'Cancelado'));

-- Alterar o default para 'Em Andamento' em vez de 'Pendente'
ALTER TABLE public.checklists 
ALTER COLUMN status SET DEFAULT 'Em Andamento';

ALTER TABLE public.vehicles 
ALTER COLUMN status SET DEFAULT 'Em Andamento';

-- Atualizar o enum do checklist_status se existir
DROP TYPE IF EXISTS public.checklist_status CASCADE;
CREATE TYPE public.checklist_status AS ENUM ('Em Andamento', 'Concluído', 'Cancelado');

-- Atualizar a coluna para usar o novo enum
ALTER TABLE public.checklists 
ALTER COLUMN status TYPE public.checklist_status 
USING status::public.checklist_status;
