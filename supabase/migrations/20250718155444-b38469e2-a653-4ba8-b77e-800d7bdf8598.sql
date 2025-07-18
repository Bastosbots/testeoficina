
-- Tornar o campo customer_name opcional na tabela budgets
ALTER TABLE public.budgets ALTER COLUMN customer_name DROP NOT NULL;
