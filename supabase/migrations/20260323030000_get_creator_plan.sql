-- Function to get a creator's plan (bypasses RLS for the reader/watermark check)
CREATE OR REPLACE FUNCTION public.get_creator_plan(creator_uuid UUID)
RETURNS TABLE (plan TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.plan FROM public.profiles p WHERE p.id = creator_uuid LIMIT 1;
$$;
