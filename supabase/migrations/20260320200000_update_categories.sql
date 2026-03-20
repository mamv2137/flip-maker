-- Replace categories with more generic ones including emojis
-- Add emoji column and refresh seed data

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS emoji TEXT;

-- Clear existing categories (no books should reference them yet)
TRUNCATE public.categories CASCADE;

INSERT INTO public.categories (name, name_es, emoji, slug, sort_order) VALUES
  ('Education',       'Educación',       '📚', 'education',       1),
  ('Business',        'Negocios',        '💼', 'business',        2),
  ('Technology',      'Tecnología',      '💻', 'technology',      3),
  ('Food & Drinks',   'Alimentación',    '🍳', 'food',            4),
  ('Health',          'Salud',           '🏥', 'health',          5),
  ('Art & Design',    'Arte y Diseño',   '🎨', 'art-design',      6),
  ('Entertainment',   'Entretenimiento', '🎬', 'entertainment',   7),
  ('Travel',          'Viajes',          '✈️', 'travel',           8),
  ('Sports',          'Deportes',        '⚽', 'sports',          9),
  ('Science',         'Ciencia',         '🔬', 'science',        10),
  ('Documentation',   'Documentación',   '📄', 'documentation',  11),
  ('Marketing',       'Marketing',       '📣', 'marketing',      12),
  ('Finance',         'Finanzas',        '💰', 'finance',        13),
  ('Fashion',         'Moda',            '👗', 'fashion',        14),
  ('Photography',     'Fotografía',      '📷', 'photography',    15),
  ('Music',           'Música',          '🎵', 'music',          16),
  ('Fiction',         'Ficción',         '📖', 'fiction',        17),
  ('Other',           'Otro',            '📁', 'other',          18);
