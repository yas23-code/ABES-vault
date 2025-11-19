-- Add subject column to resources table for categorizing notes
ALTER TABLE public.resources
ADD COLUMN subject TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN public.resources.subject IS 'Subject/category for notes (e.g., maths-4, Dstl, etc.)';