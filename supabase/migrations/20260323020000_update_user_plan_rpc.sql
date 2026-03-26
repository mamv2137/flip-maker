-- Function to update user plan from webhook (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.update_user_plan(
  p_user_id UUID,
  p_plan TEXT,
  p_polar_customer_id TEXT,
  p_polar_subscription_id TEXT,
  p_subscription_status TEXT,
  p_current_period_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    plan = p_plan,
    polar_customer_id = p_polar_customer_id,
    polar_subscription_id = p_polar_subscription_id,
    subscription_status = p_subscription_status,
    current_period_end = p_current_period_end
  WHERE id = p_user_id;
END;
$$;
