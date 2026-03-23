-- View deduplication: track unique views by IP + User-Agent + Book within 24h window
CREATE TABLE public.view_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL, -- SHA-256 of (IP + User-Agent + BookID)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_view_fingerprints_lookup ON public.view_fingerprints(book_id, fingerprint, created_at);

ALTER TABLE public.view_fingerprints ENABLE ROW LEVEL SECURITY;

-- No RLS needed — only accessed via SECURITY DEFINER function

-- Function to check and increment view (deduped by 24h window)
CREATE OR REPLACE FUNCTION public.try_count_view(
  p_book_id UUID,
  p_fingerprint TEXT,
  p_month TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_counted BOOLEAN;
BEGIN
  -- Check if this fingerprint was seen in the last 24 hours
  SELECT EXISTS (
    SELECT 1 FROM public.view_fingerprints
    WHERE book_id = p_book_id
      AND fingerprint = p_fingerprint
      AND created_at > now() - interval '24 hours'
  ) INTO already_counted;

  IF already_counted THEN
    RETURN FALSE;
  END IF;

  -- Record the fingerprint
  INSERT INTO public.view_fingerprints (book_id, fingerprint)
  VALUES (p_book_id, p_fingerprint);

  -- Increment the monthly counter
  INSERT INTO public.book_view_counts (book_id, month, view_count)
  VALUES (p_book_id, p_month, 1)
  ON CONFLICT (book_id, month)
  DO UPDATE SET view_count = book_view_counts.view_count + 1;

  RETURN TRUE;
END;
$$;

-- Cleanup: auto-delete fingerprints older than 48 hours (run periodically via cron or pg_cron)
-- For now, a manual cleanup function:
CREATE OR REPLACE FUNCTION public.cleanup_old_fingerprints()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.view_fingerprints WHERE created_at < now() - interval '48 hours';
$$;
