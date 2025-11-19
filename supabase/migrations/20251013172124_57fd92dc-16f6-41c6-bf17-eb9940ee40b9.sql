-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdfs', 'pdfs', true);

-- Create table for resource metadata
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semester INTEGER NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read resources
CREATE POLICY "Resources are viewable by everyone" 
ON public.resources 
FOR SELECT 
USING (true);

-- Allow authenticated users to insert resources
CREATE POLICY "Authenticated users can upload resources" 
ON public.resources 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Storage policies for PDFs bucket
CREATE POLICY "PDF files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pdfs');

CREATE POLICY "Authenticated users can upload PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pdfs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete their PDFs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'pdfs' AND auth.uid() IS NOT NULL);