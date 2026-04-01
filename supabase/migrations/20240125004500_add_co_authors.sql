-- Add co_authors column to publications table
ALTER TABLE publications 
ADD COLUMN IF NOT EXISTS co_authors JSONB DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN publications.co_authors IS 'List of co-authors (max 5) with {name, firstname, role}';
