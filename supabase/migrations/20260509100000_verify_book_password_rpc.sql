-- Verify a book password by precomputed hash, bypassing RLS so anonymous
-- readers (who can't SELECT from books directly) can authenticate at the gate.
-- The API hashes the password (sha256 hex) before calling this function.
CREATE OR REPLACE FUNCTION public.verify_book_password(
  p_book_id UUID,
  p_password_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.books
    WHERE id = p_book_id
      AND password_hash IS NOT NULL
      AND password_hash = p_password_hash
  );
$$;

GRANT EXECUTE ON FUNCTION public.verify_book_password(UUID, TEXT) TO anon, authenticated;
