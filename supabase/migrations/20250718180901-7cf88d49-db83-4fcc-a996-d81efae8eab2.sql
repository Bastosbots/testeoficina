
-- Criar bucket para logos do sistema
INSERT INTO storage.buckets (id, name, public) 
VALUES ('system-logos', 'system-logos', true);

-- Política para permitir visualização pública dos logos
CREATE POLICY "Public can view system logos" ON storage.objects
FOR SELECT USING (bucket_id = 'system-logos');

-- Política para permitir que admins façam upload de logos
CREATE POLICY "Admins can upload system logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'system-logos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Política para permitir que admins atualizem logos
CREATE POLICY "Admins can update system logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'system-logos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Política para permitir que admins deletem logos
CREATE POLICY "Admins can delete system logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'system-logos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
