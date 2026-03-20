-- Fix: restrict "Anyone can read published books" to exclude the creator's own books.
-- Previously, this policy let ALL authenticated users see every published book,
-- which caused other users' books to appear in the dashboard.
--
-- The new policy only allows reading published books when the requester is NOT the creator.
-- The creator already has full access via "Creators manage own books" (FOR ALL).

DROP POLICY IF EXISTS "Anyone can read published books" ON public.books;

CREATE POLICY "Anyone can read published books"
  ON public.books FOR SELECT
  USING (is_published = true AND auth.uid() != creator_id);
