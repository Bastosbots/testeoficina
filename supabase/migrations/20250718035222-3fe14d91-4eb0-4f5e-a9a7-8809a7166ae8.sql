
-- Phase 1: Critical Privilege Escalation Fix
-- Remove the dangerous "Users can update own profile" policy that allows role changes
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a security definer function for safe profile updates (excluding role changes)
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to update their own profile
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: Can only update own profile';
  END IF;

  -- Update only allowed fields (NOT role)
  UPDATE profiles 
  SET 
    full_name = COALESCE(p_full_name, full_name),
    username = COALESCE(p_username, username),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Create a restricted profile update policy
CREATE POLICY "Users can update own profile safely" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  -- Prevent role changes by regular users
  OLD.role = NEW.role OR EXISTS (
    SELECT 1 FROM public.profiles admin_profile
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);

-- Phase 2: Database Function Security - Fix search_path vulnerabilities
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'mechanic'),
        COALESCE(NEW.raw_user_meta_data->>'username', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_budgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_budget_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    budget_number TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(b.budget_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.budgets b
    WHERE b.budget_number LIKE year_part || '-%';
    
    budget_number := year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN budget_number;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.save_checklist_items(p_checklist_id uuid, p_items jsonb)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
BEGIN
  -- Verify user has permission to update this checklist
  IF NOT EXISTS (
    SELECT 1 FROM public.checklists 
    WHERE id = p_checklist_id 
    AND (mechanic_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ))
  ) THEN
    RAISE EXCEPTION 'Access denied: Cannot update checklist items';
  END IF;

  -- Delete existing items
  DELETE FROM public.checklist_items WHERE checklist_id = p_checklist_id;
  
  -- Insert new items
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
$$;

-- Phase 3: Create security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Phase 4: Add security audit logging
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource,
    p_details
  );
END;
$$;

-- Phase 5: Add constraints to prevent data integrity issues
-- Ensure usernames are unique when not null
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique 
ON public.profiles (username) 
WHERE username IS NOT NULL;

-- Add check constraint for valid roles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'mechanic'));

-- Add check constraint for valid priorities
ALTER TABLE public.checklists 
DROP CONSTRAINT IF EXISTS checklists_priority_check;

ALTER TABLE public.checklists 
ADD CONSTRAINT checklists_priority_check 
CHECK (priority IN ('Alta', 'Média', 'Baixa'));

-- Add check constraint for valid vehicle priorities
ALTER TABLE public.vehicles 
DROP CONSTRAINT IF EXISTS vehicles_priority_check;

ALTER TABLE public.vehicles 
ADD CONSTRAINT vehicles_priority_check 
CHECK (priority IN ('Alta', 'Média', 'Baixa'));
