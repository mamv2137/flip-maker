# Flipbooks

> Turn your Google Drive PDFs into premium interactive flipbooks. Zero uploads, zero friction.

A SaaS platform for the Latam creator economy. Creators connect their Google Drive, pick a PDF, and get a beautiful 3D flipbook reader they can share, embed, or sell — in seconds.

## Features

- **Google Drive native** — Browse your Drive or paste a link. PDFs are read on-demand, never copied.
- **3D flipbook reader** — Realistic page-turn animation with physics-based page curl (StPageFlip).
- **Access control** — Public, password-protected, or private with email verification.
- **Custom file picker** — Browse Drive folders, search, select PDFs — no Google Picker API needed.
- **Star ratings** — Readers rate books (1-5 stars), visible in the library.
- **Categories** — 18 predefined categories with emojis.
- **Animated UX** — Motion-powered animations throughout (upload progress, onboarding, page transitions).
- **i18n** — Spanish (default) + English, with SEO-optimized subpath routing for the landing page.
- **Dark landing page** — Animated with Magic UI components (border beam, marquee, shiny text).
- **Responsive** — Works on desktop, tablet, and mobile with touch/swipe gestures.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york)
- **Animations**: Motion (framer-motion v12) + Magic UI
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **PDF Source**: Google Drive API v3
- **Storage**: Seafile (uploads) + Google Drive (primary)
- **Hosting**: Vercel
- **Package Manager**: pnpm

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `MAGIC_LINK_SECRET` | Secret for signing magic link JWTs |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (for Drive token refresh) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SEAFILE_URL` | Seafile instance URL (for file uploads) |
| `SEAFILE_TOKEN` | Seafile API token |
| `SEAFILE_REPO_ID` | Seafile library ID |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server (localhost:3000) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm type-check` | TypeScript compiler check |
| `pnpm test` | Run tests (Vitest) |
| `pnpm test:ci` | Run tests in CI mode |

## Project Structure

```
src/
  app/
    page.tsx                    # Landing page (Spanish)
    en/page.tsx                 # Landing page (English)
    dashboard/                  # Creator dashboard
      books/[id]/page.tsx       # Book detail + edit
      books/new/page.tsx        # Create new book
      analytics/page.tsx        # Analytics (coming soon)
      integrations/page.tsx     # Integrations (coming soon)
      profile/page.tsx          # Profile settings
    library/page.tsx            # Reader library
    read/[slug]/page.tsx        # Flipbook reader
    embed/[slug]/page.tsx       # Embeddable reader
    auth/                       # Auth pages
    api/
      books/                    # Book CRUD + access APIs
      drive/                    # Google Drive proxy + file picker
      webhooks/                 # Shopify webhook handler
  components/
    landing/                    # Landing page sections
    reader/                     # Flipbook reader components
    ui/                         # shadcn/ui + Magic UI components
  i18n/                         # Internationalization
  hooks/                        # Custom React hooks
  lib/                          # Utilities (storage, google-drive, etc.)
supabase/
  migrations/                   # Database migrations
```

## Architecture

- **Google Drive as primary storage** — PDFs stay in the creator's Drive. We proxy them via server-side API using the creator's OAuth token, auto-refreshed when expired.
- **Three access levels** — Public (open), password (SHA-256 hashed), private (email-based access grants).
- **RPC functions** — SECURITY DEFINER PostgreSQL functions bypass RLS for cross-user operations (Drive proxy token lookup, access gate info).
- **Client-side PDF rendering** — pdfjs-dist renders at 3x scale to PNG for crisp text on retina displays.

## License

MIT
