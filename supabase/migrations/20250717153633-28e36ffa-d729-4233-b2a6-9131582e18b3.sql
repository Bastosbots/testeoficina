-- Add video_url field back to checklists table
ALTER TABLE public.checklists ADD COLUMN video_url text;

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('checklist-videos', 'checklist-videos', true);

-- Create storage policies for video uploads
CREATE POLICY "Anyone can view checklist videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'checklist-videos');

CREATE POLICY "Authenticated users can upload checklist videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'checklist-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own checklist videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'checklist-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete checklist videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'checklist-videos' AND auth.role() = 'authenticated');