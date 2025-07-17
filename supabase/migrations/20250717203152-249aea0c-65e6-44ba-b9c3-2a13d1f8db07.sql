
-- Corrigir a função generate_budget_number para evitar ambiguidade de coluna
CREATE OR REPLACE FUNCTION generate_budget_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    budget_number TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(b.budget_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM budgets b
    WHERE b.budget_number LIKE year_part || '-%';
    
    budget_number := year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN budget_number;
END;
$$ LANGUAGE plpgsql;
