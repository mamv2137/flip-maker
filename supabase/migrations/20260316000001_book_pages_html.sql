-- Add content_html to book_pages so markdown books can store HTML per page
-- PDF books use image_r2_key, markdown books use content_html
ALTER TABLE public.book_pages ALTER COLUMN image_r2_key DROP NOT NULL;
ALTER TABLE public.book_pages ADD COLUMN content_html TEXT;

-- A page must have either an image or HTML content
ALTER TABLE public.book_pages ADD CONSTRAINT page_has_content
  CHECK (image_r2_key IS NOT NULL OR content_html IS NOT NULL);
