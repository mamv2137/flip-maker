-- Function to find a user profile by email (for Polar webhook matching)
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email TEXT)
RETURNS TABLE (id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.id
  FROM auth.users au
  WHERE au.email = user_email
  LIMIT 1;
$$;
