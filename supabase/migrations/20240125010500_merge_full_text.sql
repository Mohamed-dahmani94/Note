-- Drop the separate table and its policies
DROP TABLE IF EXISTS public.publication_texts;

-- Add full_text column to the main publications table
ALTER TABLE public.publications 
ADD COLUMN IF NOT EXISTS full_text TEXT;

-- Comment
COMMENT ON COLUMN public.publications.full_text IS 'Full text content for AI prompts (merged for simpler permissions)';
