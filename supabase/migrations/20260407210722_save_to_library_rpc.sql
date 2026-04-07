-- RPC for readers to save public books to their library
CREATE OR REPLACE FUNCTION public.save_book_to_library(p_book_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_book_visibility TEXT;
  v_book_published BOOLEAN;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  -- Verify book is public and published
  SELECT visibility, is_published INTO v_book_visibility, v_book_published
  FROM public.books WHERE id = p_book_id;

  IF v_book_published IS NOT TRUE THEN
    RAISE EXCEPTION 'Book not found';
  END IF;

  IF v_book_visibility != 'public' THEN
    RAISE EXCEPTION 'Only public books can be saved to library';
  END IF;

  -- Insert access grant (ignore if already exists)
  INSERT INTO public.access_grants (book_id, buyer_email, buyer_id, granted_by)
  VALUES (p_book_id, v_user_email, v_user_id, 'manual')
  ON CONFLICT (book_id, buyer_email) DO NOTHING;

  RETURN TRUE;
END;
$$;
