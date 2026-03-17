-- Flipbooks MVP Schema
-- Core tables for profiles, books, access grants, sessions, and analytics

-- ============================================================================
-- PROFILES
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('creator', 'buyer')),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- BOOKS
-- ============================================================================

CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('markdown', 'pdf')),
  markdown_content TEXT,
  pdf_r2_key TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  page_count INTEGER DEFAULT 0,
  flip_effect_enabled BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_books_creator ON public.books(creator_id);
CREATE INDEX idx_books_slug ON public.books(slug);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage own books"
  ON public.books FOR ALL
  USING (auth.uid() = creator_id);

-- Published books are readable by anyone (reader page handles access via app logic)
CREATE POLICY "Anyone can read published books"
  ON public.books FOR SELECT
  USING (is_published = true);

-- ============================================================================
-- BOOK PAGES (for PDF-based books, each page is an image)
-- ============================================================================

CREATE TABLE public.book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_r2_key TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_id, page_number)
);

CREATE INDEX idx_book_pages_book ON public.book_pages(book_id);

ALTER TABLE public.book_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage own book pages"
  ON public.book_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = book_id AND books.creator_id = auth.uid()
    )
  );

-- Pages of published books are readable by anyone (reader page handles access via app logic)
CREATE POLICY "Anyone can read published book pages"
  ON public.book_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = book_pages.book_id AND books.is_published = true
    )
  );

-- ============================================================================
-- ACCESS GRANTS (who can read what)
-- ============================================================================

CREATE TABLE public.access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  buyer_email TEXT NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id),
  granted_by TEXT NOT NULL DEFAULT 'manual' CHECK (granted_by IN ('manual', 'shopify', 'hotmart', 'mercadopago', 'polar')),
  webhook_event_id TEXT,
  magic_link_token TEXT UNIQUE,
  accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_id, buyer_email)
);

CREATE INDEX idx_access_grants_email ON public.access_grants(buyer_email);
CREATE INDEX idx_access_grants_token ON public.access_grants(magic_link_token);
CREATE INDEX idx_access_grants_buyer ON public.access_grants(buyer_id);

ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage own book grants"
  ON public.access_grants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = book_id AND books.creator_id = auth.uid()
    )
  );

CREATE POLICY "Buyers view own grants"
  ON public.access_grants FOR SELECT
  USING (buyer_id = auth.uid());

-- ============================================================================
-- READER SESSIONS (anti-piracy tracking)
-- ============================================================================

CREATE TABLE public.reader_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_grant_id UUID NOT NULL REFERENCES public.access_grants(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_reader_sessions_grant ON public.reader_sessions(access_grant_id);
CREATE INDEX idx_reader_sessions_active ON public.reader_sessions(access_grant_id) WHERE is_active = true;

ALTER TABLE public.reader_sessions ENABLE ROW LEVEL SECURITY;

-- Sessions are managed by the server via service role, not directly by users

-- ============================================================================
-- ANALYTICS EVENTS
-- ============================================================================

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  access_grant_id UUID REFERENCES public.access_grants(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'page_turn', 'session_start', 'session_end')),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_book ON public.analytics_events(book_id);
CREATE INDEX idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators read own book analytics"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = book_id AND books.creator_id = auth.uid()
    )
  );

-- Analytics are inserted by the server via service role

-- ============================================================================
-- WEBHOOK EVENTS (audit trail for external integrations)
-- ============================================================================

CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('shopify', 'hotmart', 'mercadopago', 'polar')),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Webhook events are managed by the server via service role

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
