-- Add bio to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Book ratings table
CREATE TABLE public.book_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_id, user_id)
);

CREATE INDEX idx_book_ratings_book ON public.book_ratings(book_id);
CREATE INDEX idx_book_ratings_user ON public.book_ratings(user_id);

ALTER TABLE public.book_ratings ENABLE ROW LEVEL SECURITY;

-- Users can read ratings on published books
CREATE POLICY "Anyone can read ratings on published books"
  ON public.book_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = book_id AND books.is_published = true
    )
  );

-- Users can manage their own ratings
CREATE POLICY "Users manage own ratings"
  ON public.book_ratings FOR ALL
  USING (auth.uid() = user_id);

-- Creators can read ratings on their books
CREATE POLICY "Creators read ratings on own books"
  ON public.book_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = book_id AND books.creator_id = auth.uid()
    )
  );

-- Update trigger for ratings
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.book_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
