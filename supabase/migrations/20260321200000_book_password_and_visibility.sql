-- Add password protection for books
ALTER TABLE public.books ADD COLUMN password_hash TEXT;

-- Change default visibility to private
ALTER TABLE public.books ALTER COLUMN visibility SET DEFAULT 'private';

-- Add 'password' as a valid visibility option
-- Current check is ('public', 'private'), update to include 'password'
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_visibility_check;
ALTER TABLE public.books ADD CONSTRAINT books_visibility_check
  CHECK (visibility IN ('public', 'private', 'password'));
