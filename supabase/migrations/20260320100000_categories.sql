-- Categories for books
-- Predefined categories for the Latam creator economy

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read categories"
  ON public.categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Seed predefined categories
INSERT INTO public.categories (name, name_es, slug, sort_order) VALUES
  ('Courses & Lessons',       'Cursos y Lecciones',       'courses',        1),
  ('Guides & Tutorials',      'Guías y Tutoriales',       'guides',         2),
  ('eBooks',                   'eBooks',                   'ebooks',         3),
  ('Magazines & Newsletters', 'Revistas y Newsletters',   'magazines',      4),
  ('Comics & Manga',          'Cómics y Manga',           'comics',         5),
  ('Portfolios',              'Portafolios',               'portfolios',     6),
  ('Catalogs & Lookbooks',    'Catálogos y Lookbooks',    'catalogs',       7),
  ('Presentations',           'Presentaciones',            'presentations',  8),
  ('Recipes & Cookbooks',     'Recetas y Recetarios',     'recipes',        9),
  ('Reports & Whitepapers',   'Reportes y Whitepapers',   'reports',       10),
  ('Other',                    'Otro',                     'other',         11);

-- Add category_id to books
ALTER TABLE public.books
  ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE INDEX idx_books_category ON public.books(category_id);
