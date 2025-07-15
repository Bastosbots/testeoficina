
-- Criar hook para salvar itens do checklist
CREATE OR REPLACE FUNCTION public.save_checklist_items(
  p_checklist_id UUID,
  p_items JSONB
) RETURNS VOID AS $$
DECLARE
  item JSONB;
BEGIN
  -- Deletar itens existentes
  DELETE FROM public.checklist_items WHERE checklist_id = p_checklist_id;
  
  -- Inserir novos itens
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.checklist_items (
      checklist_id,
      item_name,
      category,
      checked,
      observation
    ) VALUES (
      p_checklist_id,
      item->>'name',
      item->>'category',
      (item->>'checked')::boolean,
      item->>'observation'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar política para permitir que mecânicos insiram itens
CREATE POLICY "Mechanics can insert checklist items" ON public.checklist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE id = checklist_id AND mechanic_id = auth.uid()
    )
  );

-- Adicionar política para permitir que mecânicos atualizem itens
CREATE POLICY "Mechanics can update checklist items" ON public.checklist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE id = checklist_id AND mechanic_id = auth.uid()
    )
  );

-- Adicionar política para permitir que mecânicos deletem itens
CREATE POLICY "Mechanics can delete checklist items" ON public.checklist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.checklists 
      WHERE id = checklist_id AND mechanic_id = auth.uid()
    )
  );

-- Atualizar política de checklists para permitir admins editarem
DROP POLICY IF EXISTS "Mechanics can update own checklists" ON public.checklists;
CREATE POLICY "Users can update checklists" ON public.checklists
  FOR UPDATE USING (
    auth.uid() = mechanic_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Permitir que admins deletem checklists
CREATE POLICY "Admins can delete checklists" ON public.checklists
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
