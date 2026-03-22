-- Function to find a book by webhook secret (SECURITY DEFINER to bypass RLS)
-- Used by webhook endpoints to create access grants
CREATE OR REPLACE FUNCTION public.get_book_by_webhook_secret(secret_uuid UUID)
RETURNS TABLE (id UUID, creator_id UUID, title TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.creator_id, b.title
  FROM public.books b
  WHERE b.webhook_secret = secret_uuid
  LIMIT 1;
$$;
