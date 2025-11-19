-- Make year nullable for notes that don't need a specific year
ALTER TABLE public.resources 
ALTER COLUMN year DROP NOT NULL;