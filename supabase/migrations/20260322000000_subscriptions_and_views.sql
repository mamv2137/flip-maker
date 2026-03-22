-- Creator subscription plan (synced from Polar.sh webhooks)
ALTER TABLE public.profiles
  ADD COLUMN plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'pro_seller', 'agency')),
  ADD COLUMN polar_customer_id TEXT,
  ADD COLUMN polar_subscription_id TEXT,
  ADD COLUMN subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  ADD COLUMN current_period_end TIMESTAMPTZ;

-- Monthly view counter per book (for plan enforcement)
CREATE TABLE public.book_view_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- format: '2026-03'
  view_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(book_id, month)
);

CREATE INDEX idx_book_view_counts_book_month ON public.book_view_counts(book_id, month);

ALTER TABLE public.book_view_counts ENABLE ROW LEVEL SECURITY;

-- Creators can read their own book view counts
CREATE POLICY "Creators read own book view counts"
  ON public.book_view_counts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = book_id AND books.creator_id = auth.uid()
    )
  );

-- Function to increment view count (called from API, SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.increment_book_view(
  p_book_id UUID,
  p_month TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.book_view_counts (book_id, month, view_count)
  VALUES (p_book_id, p_month, 1)
  ON CONFLICT (book_id, month)
  DO UPDATE SET view_count = book_view_counts.view_count + 1;
END;
$$;

-- Function to get creator's total monthly views across all books
CREATE OR REPLACE FUNCTION public.get_creator_monthly_views(
  p_creator_id UUID,
  p_month TEXT
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(bvc.view_count), 0)::INTEGER
  FROM public.book_view_counts bvc
  JOIN public.books b ON b.id = bvc.book_id
  WHERE b.creator_id = p_creator_id AND bvc.month = p_month;
$$;
