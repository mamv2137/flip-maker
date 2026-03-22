-- Function to get Google Drive tokens for a creator.
-- Runs as SECURITY DEFINER (bypasses RLS) so the proxy can read
-- any creator's tokens to serve their Drive-hosted PDFs.
CREATE OR REPLACE FUNCTION public.get_creator_drive_token(creator_uuid UUID)
RETURNS TABLE (
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.google_access_token,
    p.google_refresh_token,
    p.google_token_expires_at
  FROM public.profiles p
  WHERE p.id = creator_uuid
  LIMIT 1;
$$;
