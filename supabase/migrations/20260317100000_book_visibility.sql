-- Add visibility column to books
-- 'public' = anyone with the link can read
-- 'private' = only whitelisted emails (via access_grants + magic links) can read
ALTER TABLE books
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'private'));

-- Update RLS policy: private books need access grant check at app level
-- (We keep the existing "published books readable by anyone" RLS policy
--  because access control for private books is enforced at the application layer
--  via token verification in the reader page, not at the DB level.)
