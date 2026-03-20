-- Add Google Drive file ID column to books
-- When set, the PDF is read from Drive instead of R2/Seafile storage
ALTER TABLE public.books ADD COLUMN drive_file_id TEXT;
