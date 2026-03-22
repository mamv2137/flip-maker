-- Store Google OAuth tokens for Drive API access
-- These are refreshed by our app since Supabase doesn't persist provider tokens
ALTER TABLE public.profiles
  ADD COLUMN google_access_token TEXT,
  ADD COLUMN google_refresh_token TEXT,
  ADD COLUMN google_token_expires_at TIMESTAMPTZ;
