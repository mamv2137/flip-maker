-- Enable RLS on webhook_events to prevent public access via PostgREST.
-- No policies are needed: webhooks are processed server-side using the
-- service_role key, which bypasses RLS.
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
