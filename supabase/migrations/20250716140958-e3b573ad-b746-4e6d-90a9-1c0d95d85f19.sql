
-- Adicionar coluna de status na tabela checklists
ALTER TABLE public.checklists 
ADD COLUMN status TEXT NOT NULL DEFAULT 'Pendente';

-- Criar enum para status (opcional, mas recomendado para consistência)
CREATE TYPE public.checklist_status AS ENUM ('Pendente', 'Em Andamento', 'Concluído', 'Cancelado');

-- Alterar a coluna para usar o enum
ALTER TABLE public.checklists 
ALTER COLUMN status TYPE public.checklist_status 
USING status::public.checklist_status;

-- Adicionar trigger para atualizar updated_at quando status mudar
CREATE OR REPLACE FUNCTION public.update_checklist_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o status mudou para 'Concluído' e completed_at era null, definir completed_at
    IF NEW.status = 'Concluído' AND OLD.completed_at IS NULL THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- Se o status mudou de 'Concluído' para outro, limpar completed_at
    IF OLD.status = 'Concluído' AND NEW.status != 'Concluído' THEN
        NEW.completed_at = NULL;
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_checklist_status
    BEFORE UPDATE ON public.checklists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_checklist_status();
