-- Make email lookup case-insensitive (Polar may send the email as the user typed it,
-- while Supabase Auth stores it normalized to lowercase).
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email TEXT)
RETURNS TABLE (id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id
  FROM auth.users au
  WHERE LOWER(au.email) = LOWER(TRIM(user_email))
  LIMIT 1;
$$;

-- Lookup profile by polar_customer_id, bypassing RLS so the unauthenticated
-- webhook handler can find returning subscribers.
CREATE OR REPLACE FUNCTION public.get_user_by_polar_customer_id(p_customer_id TEXT)
RETURNS TABLE (id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id
  FROM public.profiles p
  WHERE p.polar_customer_id = p_customer_id
  LIMIT 1;
$$;
