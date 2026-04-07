-- Add custom domain column to books table
ALTER TABLE public.books ADD COLUMN custom_domain TEXT UNIQUE;

-- Index for fast domain lookups in middleware
CREATE INDEX idx_books_custom_domain ON public.books(custom_domain) WHERE custom_domain IS NOT NULL;

-- RPC to look up a book by custom domain (bypasses RLS for reader access)
CREATE OR REPLACE FUNCTION public.get_book_by_domain(lookup_domain TEXT)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  title TEXT,
  creator_id UUID,
  content_type TEXT,
  status TEXT,
  is_published BOOLEAN,
  visibility TEXT,
  cover_image_url TEXT,
  pdf_r2_key TEXT,
  drive_file_id TEXT,
  flip_effect_enabled BOOLEAN,
  pdf_first_page_is_cover BOOLEAN,
  password_hash TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    b.id,
    b.slug,
    b.title,
    b.creator_id,
    b.content_type,
    b.status,
    b.is_published,
    b.visibility,
    b.cover_image_url,
    b.pdf_r2_key,
    b.drive_file_id,
    b.flip_effect_enabled,
    b.pdf_first_page_is_cover,
    b.password_hash
  FROM public.books b
  WHERE b.custom_domain = lookup_domain
    AND b.is_published = true
    AND b.status = 'ready'
  LIMIT 1;
$$;
