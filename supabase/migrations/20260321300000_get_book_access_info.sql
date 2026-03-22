-- Function to get minimal book info for access control.
-- Bypasses RLS so unauthenticated users can see the gate page
-- for private/password books instead of a generic 404.
-- Does NOT expose content, only metadata needed for the gate.
CREATE OR REPLACE FUNCTION public.get_book_access_info(book_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  creator_id UUID,
  visibility TEXT,
  is_published BOOLEAN,
  status TEXT,
  password_hash TEXT,
  content_type TEXT,
  cover_image_url TEXT,
  slug TEXT,
  flip_effect_enabled BOOLEAN,
  pdf_r2_key TEXT,
  drive_file_id TEXT,
  pdf_first_page_is_cover BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id, b.title, b.creator_id, b.visibility, b.is_published,
    b.status, b.password_hash, b.content_type, b.cover_image_url,
    b.slug, b.flip_effect_enabled, b.pdf_r2_key, b.drive_file_id,
    b.pdf_first_page_is_cover
  FROM public.books b
  WHERE b.slug = book_slug
  LIMIT 1;
$$;
