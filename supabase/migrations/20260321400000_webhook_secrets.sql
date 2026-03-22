-- Webhook secret per book for Shopify/Hotmart integrations
-- Each book gets a unique webhook URL: /api/webhooks/shopify/{webhook_secret}
ALTER TABLE public.books ADD COLUMN webhook_secret UUID DEFAULT gen_random_uuid();

-- Index for fast lookup
CREATE INDEX idx_books_webhook_secret ON public.books(webhook_secret);
