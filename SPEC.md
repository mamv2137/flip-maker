# Flipbooks MVP — Product & Architecture Spec

> SaaS platform that transforms Markdown/PDF content into premium, interactive web reader experiences with 3D flipbook navigation. Picks-and-shovels play for the Latam creator economy.

---

## Table of Contents

1. [User Roles & Flows](#1-user-roles--flows)
2. [URL Architecture](#2-url-architecture)
3. [Feature Breakdown](#3-feature-breakdown)
4. [Tech Stack](#4-tech-stack)
5. [System Architecture](#5-system-architecture)
6. [Data Model](#6-data-model)
7. [Markdown-to-Web Engine](#7-markdown-to-web-engine)
8. [PDF Processing Pipeline](#8-pdf-processing-pipeline)
9. [Flipbook Reader](#9-flipbook-reader)
10. [Authentication & Magic Links](#10-authentication--magic-links)
11. [Anti-Piracy Layer](#11-anti-piracy-layer)
12. [Monetization & Payments](#12-monetization--payments)
13. [MercadoPago Deep Dive — Creator Commerce](#13-mercadopago-deep-dive--creator-commerce)
14. [Webhook Integration](#14-webhook-integration)
15. [Delivery System](#15-delivery-system)
16. [Deployment & Infrastructure](#16-deployment--infrastructure)
17. [API Routes](#17-api-routes)
18. [MVP Scope & Phases](#18-mvp-scope--phases)

---

## 1. User Roles & Flows

### Creator (Publisher)
1. Signs up via email/password or Google OAuth (Supabase Auth)
2. Lands on dashboard → uploads Markdown or PDF content
3. Content is processed → generates a flipbook with a unique slug
4. Gets a shareable reader URL → distributes to buyers
5. Views basic analytics: total views, unique readers, active sessions

### Buyer (Reader)
1. Receives a magic link via email after purchase (or manual share for MVP)
2. Clicks link → authenticated instantly via JWT → lands on the reader
3. Can browse their library of purchased/accessed books
4. Reads content in a premium flipbook experience with optional 3D page-turn

---

## 2. URL Architecture

| URL | Purpose |
|---|---|
| `app.flipbooks.com/dashboard` | Creator dashboard (upload, manage, analytics) |
| `app.flipbooks.com/dashboard/books/:id` | Single book management |
| `app.flipbooks.com/library` | Buyer's personal library |
| `app.flipbooks.com/auth/login` | Login (both roles) |
| `app.flipbooks.com/auth/sign-up` | Creator registration |
| `read.flipbooks.com/:slug` | Public reader (clean, shareable) |

**Why this structure:**
- `read.` subdomain is short, clean, and optimized for caching/CDN independently
- `app.` groups all authenticated experiences (creator + buyer)
- The reader URL is what gets shared — it must look premium and trustworthy

---

## 3. Feature Breakdown

### MVP (Phase 1)
- [ ] Creator auth (email/password + Google OAuth via Supabase)
- [ ] Creator dashboard: upload Markdown or PDF, list books, get shareable link
- [ ] Markdown-to-flipbook rendering engine
- [ ] PDF-to-image processing pipeline (each PDF page → flipbook page)
- [ ] Flipbook reader with 3D page-turn effect (toggleable to flat mode)
- [ ] Responsive reader (desktop + mobile touch/swipe)
- [ ] Magic link system for buyer access (JWT-based, permanent access)
- [ ] Buyer library page
- [ ] Basic analytics (views, unique readers per book)
- [ ] Anti-piracy: concurrent session limits (max 2), IP logging
- [ ] Image support in Markdown content
- [ ] Code block rendering with syntax highlighting

### Phase 2 — Platform Billing + Creator Commerce

- [ ] Polar.sh integration for creator subscriptions (free/pro/business tiers)
- [ ] MercadoPago Marketplace setup (OAuth connect for creators)
- [ ] Hosted checkout per book (MercadoPago Checkout Pro with split payments)
- [ ] Sales dashboard for creators (revenue, transactions, pending payments)
- [ ] Webhook receivers: Hotmart, Shopify (for creators already on those platforms)
- [ ] Automated delivery on `order_paid` events
- [ ] Device fingerprinting for anti-piracy

### Phase 3 — WhatsApp Commerce + Growth

- [ ] WhatsApp selling bot via Ycloud B2B provider
- [ ] WhatsApp delivery (magic link via WhatsApp instead of email)
- [ ] Creator custom branding (colors, logo on reader)
- [ ] Embedded video support in content
- [ ] Polar.sh webhook for subscription lifecycle management

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, SSR + SSG) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui (new-york style) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password, Google OAuth, magic links) |
| **File Storage** | Cloudflare R2 (zero egress fees) |
| **Hosting** | Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`) |
| **PDF Processing** | Dedicated Cloudflare Worker (Browser Rendering API) |
| **Flipbook Engine** | StPageFlip (forked from `laposa/st-page-flip`, MIT) + custom React wrapper |
| **Markdown Parsing** | `unified` + `remark` + `rehype` ecosystem |
| **Syntax Highlighting** | `rehype-pretty-code` (uses Shiki) |
| **Data Fetching** | TanStack Query v5 (client), Server Components (server) |
| **State Management** | React Server Components + TanStack Query (no global state needed for MVP) |
| **Email** | Supabase Auth emails (magic links) + Resend (transactional) |
| **Platform Billing** | Polar.sh (creator subscriptions) |
| **Creator Payments** | MercadoPago (Marketplace model with split payments) |
| **WhatsApp** | Ycloud B2B (Phase 3) |
| **Analytics** | Custom (Supabase tables) + Vercel Analytics |
| **Package Manager** | pnpm |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Network                    │
│                                                         │
│  ┌──────────────────────┐    ┌───────────────────────┐  │
│  │  Next.js Worker      │    │  PDF Processing Worker│  │
│  │  (OpenNext)          │    │  (Browser Rendering)  │  │
│  │                      │    │                       │  │
│  │  - App Router        │    │  - Receives PDF from  │  │
│  │  - API Routes        │◄──►│    R2                 │  │
│  │  - Server Components │    │  - Renders pages to   │  │
│  │  - Server Actions    │    │    images via Puppeteer│  │
│  │  - Middleware (auth)  │    │  - Writes images to R2│  │
│  └──────────┬───────────┘    └───────────────────────┘  │
│             │                                           │
│  ┌──────────▼───────────┐                               │
│  │   Cloudflare R2      │                               │
│  │                      │                               │
│  │  - PDF uploads       │                               │
│  │  - Generated images  │                               │
│  │  - ISR cache         │                               │
│  └──────────────────────┘                               │
└─────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│                     Supabase                            │
│                                                         │
│  ┌──────────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │  PostgreSQL   │  │  Auth    │  │  Realtime         │ │
│  │  (all data)   │  │  (JWT,   │  │  (future:         │ │
│  │              │  │  OAuth)  │  │   live analytics)  │ │
│  └──────────────┘  └──────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Request flow for reader:**
1. Buyer hits `read.flipbooks.com/:slug`
2. Next.js middleware validates JWT (from magic link or session)
3. Server Component fetches book metadata from Supabase
4. Reader loads — pages are images served from R2 (PDF) or rendered Markdown
5. Anti-piracy middleware logs session, checks concurrent limit

---

## 6. Data Model

### Supabase PostgreSQL Schema

```sql
-- Creators (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'creator' CHECK (role IN ('creator', 'buyer')),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Books
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('markdown', 'pdf')),
  -- For markdown: raw markdown stored here
  markdown_content TEXT,
  -- For PDF: reference to R2 object
  pdf_r2_key TEXT,
  -- Processing status
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  page_count INTEGER DEFAULT 0,
  -- Settings
  flip_effect_enabled BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_books_creator ON public.books(creator_id);
CREATE INDEX idx_books_slug ON public.books(slug);

-- Book Pages (for PDF-based books, each page is an image)
CREATE TABLE public.book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_r2_key TEXT NOT NULL, -- R2 key for the rendered page image
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id, page_number)
);

CREATE INDEX idx_book_pages_book ON public.book_pages(book_id);

-- Access Grants (who can read what)
CREATE TABLE public.access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  buyer_email TEXT NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id), -- null until buyer signs up
  granted_by TEXT DEFAULT 'manual' CHECK (granted_by IN ('manual', 'shopify', 'hotmart', 'mercadopago', 'polar')),
  webhook_event_id TEXT, -- external event reference
  magic_link_token TEXT UNIQUE, -- JWT token identifier
  accessed_at TIMESTAMPTZ, -- first access
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id, buyer_email)
);

CREATE INDEX idx_access_grants_email ON public.access_grants(buyer_email);
CREATE INDEX idx_access_grants_token ON public.access_grants(magic_link_token);

-- Sessions (anti-piracy tracking)
CREATE TABLE public.reader_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_grant_id UUID NOT NULL REFERENCES public.access_grants(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT, -- Phase 2
  started_at TIMESTAMPTZ DEFAULT now(),
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_reader_sessions_grant ON public.reader_sessions(access_grant_id);
CREATE INDEX idx_reader_sessions_active ON public.reader_sessions(access_grant_id, is_active);

-- Analytics Events
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  access_grant_id UUID REFERENCES public.access_grants(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'page_turn', 'session_start', 'session_end')),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_book ON public.analytics_events(book_id);
CREATE INDEX idx_analytics_type ON public.analytics_events(event_type);

-- Webhook Events (for audit trail, Phase 2)
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('shopify', 'hotmart', 'mercadopago', 'polar')),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);
```

### Row Level Security (RLS) Policies

```sql
-- Profiles: users can read/update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Books: creators see their own, buyers see books they have access to
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators manage own books" ON public.books FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Buyers read accessible books" ON public.books FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.access_grants
    WHERE access_grants.book_id = books.id
    AND access_grants.buyer_id = auth.uid()
  )
);

-- Access Grants: creators manage grants for their books
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators manage own book grants" ON public.access_grants FOR ALL USING (
  EXISTS (SELECT 1 FROM public.books WHERE books.id = book_id AND books.creator_id = auth.uid())
);
CREATE POLICY "Buyers view own grants" ON public.access_grants FOR SELECT USING (buyer_id = auth.uid());
```

---

## 7. Markdown-to-Web Engine

### Processing Pipeline

```
Upload .md file
      │
      ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Parse with   │────►│ Transform     │────►│ Split into      │
│ unified/     │     │ with rehype   │     │ pages           │
│ remark       │     │ plugins       │     │ (by headings or │
│              │     │               │     │  --- separators) │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Store pages as   │
                                          │ HTML chunks in   │
                                          │ Supabase         │
                                          └─────────────────┘
```

### Key Libraries

```
unified                    - Core processing engine
remark-parse               - Markdown → mdast
remark-gfm                 - GitHub Flavored Markdown (tables, strikethrough)
remark-rehype              - mdast → hast
rehype-pretty-code         - Syntax highlighting via Shiki
rehype-stringify           - hast → HTML string
rehype-sanitize            - XSS prevention
```

### Page Splitting Strategy

Markdown content is split into flipbook pages using these rules (in priority order):
1. **Explicit separator:** `---` (horizontal rule) creates a hard page break
2. **H1 headings:** Each `# Heading` starts a new page
3. **Overflow:** If content exceeds the viewport height, split at the nearest paragraph boundary

Each page is stored as a pre-rendered HTML string. The reader renders these chunks inside the flipbook component.

### Implementation

```typescript
// src/lib/markdown/processor.ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

export async function processMarkdown(raw: string): Promise<string[]> {
  // 1. Split by explicit separators (---)
  const sections = raw.split(/\n---\n/)

  const pages: string[] = []
  for (const section of sections) {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypePrettyCode, { theme: 'github-dark' })
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(section)

    pages.push(String(result))
  }

  return pages
}
```

---

## 8. PDF Processing Pipeline

### Architecture

PDF processing runs in a **separate Cloudflare Worker** using the Browser Rendering API, keeping heavy rendering off the main Next.js worker.

```
Creator uploads PDF
        │
        ▼
┌─────────────────┐     ┌──────────────────────┐     ┌──────────┐
│ Next.js API      │────►│ PDF Processing Worker │────►│ R2       │
│ Route            │     │ (Browser Rendering)   │     │ Storage  │
│                  │     │                       │     │          │
│ 1. Upload to R2  │     │ 1. Fetch PDF from R2  │     │ - PDF    │
│ 2. Create book   │     │ 2. Open in Puppeteer  │     │ - Images │
│    record         │     │ 3. Screenshot each pg │     │          │
│ 3. Trigger worker│     │ 4. Save images to R2  │     └──────────┘
│ 4. Return book id│     │ 5. Update Supabase    │
└─────────────────┘     └──────────────────────┘
```

### Worker Implementation Sketch

```typescript
// workers/pdf-processor.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { bookId, pdfR2Key } = await request.json()

    // 1. Get PDF from R2
    const pdfObject = await env.FLIPBOOKS_BUCKET.get(pdfR2Key)
    if (!pdfObject) return new Response('PDF not found', { status: 404 })

    // 2. Create a temporary URL or pass as data URI
    const pdfBuffer = await pdfObject.arrayBuffer()

    // 3. Use Browser Rendering to render each page
    const browser = await puppeteer.launch(env.BROWSER)
    const page = await browser.newPage()

    // Load PDF in browser, get page count, screenshot each page
    // ... (implementation details)

    // 4. Upload each page image to R2
    for (let i = 0; i < pageCount; i++) {
      const imageKey = `books/${bookId}/pages/${i + 1}.webp`
      await env.FLIPBOOKS_BUCKET.put(imageKey, pageImageBuffer)

      // 5. Insert page record in Supabase
      await supabase.from('book_pages').insert({
        book_id: bookId,
        page_number: i + 1,
        image_r2_key: imageKey,
        width: viewport.width,
        height: viewport.height,
      })
    }

    // 6. Update book status
    await supabase
      .from('books')
      .update({ status: 'ready', page_count: pageCount })
      .eq('id', bookId)

    await browser.close()
    return new Response(JSON.stringify({ success: true, pageCount }))
  },
}
```

### R2 Bucket Structure

```
flipbooks-bucket/
  books/
    {book_id}/
      original.pdf          # Original uploaded PDF
      pages/
        1.webp              # Page images (WebP for size/quality)
        2.webp
        ...
      cover.webp            # Auto-generated from first page
  uploads/
    {temp_id}.pdf           # Temporary upload before processing
```

---

## 9. Flipbook Reader

### Library Choice: StPageFlip (laposa fork)

**Why:** Most realistic open-source 3D page-curl physics (canvas-based). MIT license. The `laposa/st-page-flip` fork is actively maintained (as of Dec 2024).

**Strategy:** Fork and vendor the library into the repo at `src/lib/page-flip/` for full control. The original `react-pageflip` npm package is abandoned — do not depend on it.

### Reader Component Architecture

```
src/
  components/
    reader/
      FlipbookReader.tsx        # Main reader component (dynamic import, no SSR)
      FlipbookPage.tsx          # Single page wrapper (handles both HTML and image pages)
      ReaderToolbar.tsx          # Top bar: title, page nav, settings, fullscreen
      ReaderSettings.tsx         # Toggle 3D effect, font size, theme
      TableOfContents.tsx        # Chapter/section navigation
      PageNavigator.tsx          # Bottom: page slider, current/total pages
  lib/
    page-flip/                  # Vendored StPageFlip fork
      index.ts
```

### Rendering Modes

| Content Type | How Pages Render |
|---|---|
| **PDF** | Each page is an `<img>` loaded from R2 (`/books/{id}/pages/{n}.webp`) |
| **Markdown** | Each page is a `<div>` with pre-rendered HTML injected via `dangerouslySetInnerHTML` (sanitized at processing time) |

### 3D Toggle

The reader supports two modes controlled by user preference (persisted in localStorage):

1. **Flipbook mode (default):** StPageFlip canvas with 3D page-curl animation
2. **Flat mode:** CSS slide transition (simple left/right animation). When flat mode is selected, bypass StPageFlip entirely and use a lightweight custom component with `transform: translateX()` transitions

```typescript
// src/components/reader/FlipbookReader.tsx
'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { FlatReader } from './FlatReader'

const PageFlipReader = dynamic(() => import('./PageFlipReader'), { ssr: false })

type Props = {
  pages: Array<{ type: 'html' | 'image'; content: string }>
  defaultFlipEnabled: boolean
}

export function FlipbookReader({ pages, defaultFlipEnabled }: Props) {
  const [flipEnabled, setFlipEnabled] = useState(defaultFlipEnabled)

  if (flipEnabled) {
    return <PageFlipReader pages={pages} onToggleFlip={() => setFlipEnabled(false)} />
  }

  return <FlatReader pages={pages} onToggleFlip={() => setFlipEnabled(true)} />
}
```

### Keyboard & Touch Controls

| Input | Action |
|---|---|
| Arrow Left / Swipe Right | Previous page |
| Arrow Right / Swipe Left | Next page |
| Home | First page |
| End | Last page |
| F | Toggle fullscreen |
| Escape | Exit fullscreen |
| Pinch (mobile) | Zoom (Phase 2) |

---

## 10. Authentication & Magic Links

### Auth Strategy

Uses **Supabase Auth** for all authentication:

| Flow | Method |
|---|---|
| Creator sign-up | Email/password or Google OAuth |
| Creator login | Email/password or Google OAuth |
| Buyer first access | Magic link (email with JWT) |
| Buyer return visits | Supabase session (cookie-based) |

### Magic Link Flow

```
Creator shares book → System generates magic link
                           │
                           ▼
               ┌───────────────────────┐
               │ POST /api/access/grant │
               │                       │
               │ 1. Create access_grant │
               │ 2. Generate JWT token │
               │ 3. Send email with    │
               │    magic link URL     │
               └───────────┬───────────┘
                           │
                           ▼
            Email to buyer: "Read your book"
            Link: read.flipbooks.com/:slug?token=eyJhb...
                           │
                           ▼
               ┌───────────────────────┐
               │ Middleware validates    │
               │ JWT token             │
               │                       │
               │ 1. Verify JWT sig     │
               │ 2. Check access_grant │
               │    exists & active    │
               │ 3. Create/update      │
               │    Supabase session   │
               │ 4. Set session cookie │
               │ 5. Redirect to reader │
               └───────────────────────┘
```

### JWT Token Structure

```json
{
  "sub": "access_grant_id",
  "book_id": "uuid",
  "email": "buyer@example.com",
  "iat": 1710000000,
  "iss": "flipbooks"
  // No expiration — permanent access
}
```

The JWT is signed with a server-side secret (`MAGIC_LINK_SECRET` env var). On first use, the system creates a Supabase Auth user (if none exists) and links it to the access grant. Subsequent visits use normal Supabase session cookies.

---

## 11. Anti-Piracy Layer

### MVP: Concurrent Session Limits + IP Logging

**Max 2 concurrent sessions per access grant.** This is simple, effective, and doesn't hurt legitimate users (e.g., phone + laptop).

### Session Lifecycle

```
Reader opens book
       │
       ▼
┌──────────────────────────┐
│ POST /api/sessions/start  │
│                          │
│ 1. Count active sessions │
│    for this access_grant │
│ 2. If >= 2:             │
│    → Terminate oldest    │
│    → Notify user         │
│ 3. Create new session    │
│    record with IP +      │
│    User-Agent            │
│ 4. Return session_id     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Heartbeat (every 30s)    │
│ PUT /api/sessions/:id    │
│                          │
│ Updates last_heartbeat   │
│ Sessions with no         │
│ heartbeat for 2 min      │
│ are auto-expired         │
└──────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│ Reader closes / navigates│
│ away                     │
│ DELETE /api/sessions/:id │
│                          │
│ (also: beforeunload      │
│  sends beacon)           │
└──────────────────────────┘
```

### IP Anomaly Detection (Lightweight)

Log IPs per access grant. Flag if:
- More than 5 unique IPs in 24 hours (likely link sharing)
- IPs from 3+ different countries in 24 hours

Flagging creates an entry in an `anomalies` table for the creator to review. No automatic blocking in MVP — just visibility.

### Phase 2: Device Fingerprinting

Add `@fingerprintjs/fingerprintjs` (open-source) on the reader client. Store the fingerprint hash in `reader_sessions.device_fingerprint`. Add a max unique devices per grant (e.g., 3 devices).

---

## 12. Monetization & Payments

There are **two separate payment flows** in this platform:

### A. Platform Revenue — How Flipbooks Gets Paid

Creators pay a subscription to use the platform. Revenue model: **tiered subscriptions via Polar.sh.**

| Plan | Price | Commission on Sales | Features |
| --- | --- | --- | --- |
| **Free** | $0/mo | 10% per sale | 3 books, 100 readers/mo, Flipbooks branding on reader |
| **Pro** | $19/mo | 5% per sale | Unlimited books, unlimited readers, custom branding |
| **Business** | $49/mo | 3% per sale | Everything in Pro + API access, priority support, WhatsApp bot |

**Why Polar.sh for platform billing:**

- Built for developer/creator tool subscriptions
- Handles international payments (Stripe under the hood)
- Clean API, webhook support for `subscription.active`, `subscription.canceled`
- Merchant of Record model — they handle tax/VAT

**Commission model rationale:** The tiered commission incentivizes plan upgrades while ensuring free-tier creators still contribute revenue. The commission is taken automatically via MercadoPago's split payment (`marketplace_fee`) — the platform never touches the creator's full amount.

### B. Creator Revenue — How Creators Sell Ebooks

Two distinct selling flows, both using **MercadoPago** as the payment processor for Latam:

| Flow | Description | Phase |
| --- | --- | --- |
| **Hosted Checkout** | Creator gets a checkout URL per book (like Hotmart). Buyer pays → auto-delivery via magic link | Phase 2 |
| **WhatsApp Commerce** | Bot receives "quiero comprar X" → sends MP payment link → on payment → sends magic link via WhatsApp | Phase 3 |
| **External Providers** | Creators already selling on Hotmart/Shopify keep their setup → webhooks trigger delivery | Phase 2 |

**Why MercadoPago for creator commerce (not Stripe/Polar):**

- Latam buyers expect local payment methods: PIX (Brazil), OXXO (Mexico), boleto, PSE (Colombia), Rapipago (Argentina)
- MercadoPago has 80%+ market penetration in Latam e-commerce
- Native split payment support (`marketplace_fee`) — commission is deducted automatically at payment time
- No need for creators to have their own MP account (marketplace model) OR they connect their own account (split model)

---

## 13. MercadoPago Deep Dive — Creator Commerce

### Integration Model: Marketplace with Split Payments

Flipbooks operates as a **MercadoPago Marketplace**. This means:

1. **Flipbooks has a main MercadoPago account** (the marketplace)
2. **Each creator connects their MercadoPago account** via OAuth (MP Connect)
3. When a buyer pays, the money is **split automatically**: creator gets their share, platform gets the commission
4. The platform never holds the creator's funds — MercadoPago handles the split at transaction time

```
Buyer pays $10 for ebook
        │
        ▼
┌─────────────────────────────┐
│  MercadoPago processes $10  │
│                             │
│  Creator share (90%): $9.00 │──► Creator's MP account
│  Platform fee (10%):  $1.00 │──► Flipbooks MP account
│  MP processing fee:  ~$0.45 │──► MercadoPago
└─────────────────────────────┘
```

### Creator Onboarding (MP Connect OAuth)

```
Creator dashboard → "Connect MercadoPago" button
        │
        ▼
┌───────────────────────────────────┐
│ Redirect to MercadoPago OAuth     │
│                                   │
│ URL: https://auth.mercadopago.com │
│   ?client_id=FLIPBOOKS_APP_ID    │
│   &response_type=code             │
│   &redirect_uri=app.flipbooks.com │
│     /api/integrations/mp/callback │
│   &state={creator_id}             │
└─────────────┬─────────────────────┘
              │
              ▼
┌───────────────────────────────────┐
│ Creator authorizes Flipbooks      │
│ → Redirected back with auth code  │
│                                   │
│ Callback exchanges code for:      │
│   - access_token                  │
│   - refresh_token                 │
│   - mp_user_id (collector_id)     │
│                                   │
│ Stored in creator_integrations    │
└───────────────────────────────────┘
```

### Checkout Flow — Hosted Checkout (Checkout Pro)

Each book gets a **MercadoPago Checkout Pro preference** — a hosted payment page that handles all local payment methods automatically.

```
Buyer clicks "Buy" on book page
        │
        ▼
┌──────────────────────────────────────────┐
│ POST /api/checkout/create                │
│                                          │
│ 1. Look up book + creator's MP tokens    │
│ 2. Calculate platform commission         │
│ 3. Create MP Preference:                 │
│    {                                     │
│      items: [{ title, unit_price }],     │
│      marketplace_fee: platform_cut,      │
│      back_urls: {                        │
│        success: read.flipbooks.com/slug, │
│        failure: app.flipbooks.com/...,   │
│        pending: app.flipbooks.com/...    │
│      },                                  │
│      notification_url:                   │
│        app.flipbooks.com/api/webhooks/mp,│
│      metadata: {                         │
│        book_id, buyer_email              │
│      }                                   │
│    }                                     │
│ 4. Return init_point URL                 │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ Buyer is redirected to MercadoPago       │
│ hosted checkout page                     │
│                                          │
│ Payment methods shown automatically:     │
│ - Credit/debit card                      │
│ - PIX (Brazil)                           │
│ - OXXO (Mexico)                          │
│ - Boleto (Brazil)                        │
│ - PSE (Colombia)                         │
│ - Rapipago/PagoFacil (Argentina)         │
│ - Account balance                        │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ Payment confirmed → MP sends webhook     │
│ POST /api/webhooks/mercadopago           │
│                                          │
│ 1. Verify webhook signature              │
│ 2. Fetch payment details from MP API     │
│ 3. If status == "approved":              │
│    a. Create access_grant                │
│    b. Record transaction in sales table  │
│    c. Send magic link email to buyer     │
│ 4. If status == "pending":              │
│    a. Mark as pending (boleto/OXXO)      │
│    b. Will resolve on next webhook       │
└──────────────────────────────────────────┘
```

### WhatsApp Commerce Flow (Phase 3)

```
Buyer messages WhatsApp bot: "Quiero comprar el libro de Python"
        │
        ▼
┌────────────────────────────────────────────┐
│ Ycloud webhook → POST /api/whatsapp/inbound│
│                                            │
│ 1. NLP/keyword match to identify product   │
│ 2. Look up book + price                    │
│ 3. Create MP payment link (Checkout Pro)   │
│ 4. Reply via Ycloud API:                   │
│    "Aqui esta tu link de pago: {mp_link}   │
│     Precio: R$29.90"                       │
└────────────────────┬───────────────────────┘
                     │
                     ▼ (buyer pays via MP link)
┌────────────────────────────────────────────┐
│ MP webhook fires → payment approved        │
│                                            │
│ 1. Create access_grant                     │
│ 2. Send magic link via WhatsApp (not email)│
│    using Ycloud API:                       │
│    "Tu libro esta listo! Lee aqui:         │
│     {magic_link}"                          │
└────────────────────────────────────────────┘
```

### Implementation: API Route for Creating Checkout

```typescript
// src/app/api/checkout/create/route.ts
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { bookId, buyerEmail } = await request.json()

  // 1. Get book and creator's MP credentials
  const { data: book } = await supabase
    .from('books')
    .select('*, profiles!inner(*), creator_integrations!inner(*)')
    .eq('id', bookId)
    .single()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('book_id', bookId)
    .eq('is_active', true)
    .single()

  // 2. Calculate commission based on creator's plan
  const commissionRate = getCommissionRate(book.profiles.plan) // 0.10, 0.05, or 0.03
  const platformFee = Math.round(product.price_cents * commissionRate)

  // 3. Create MP preference using creator's access token
  const mpClient = new MercadoPagoConfig({
    accessToken: book.creator_integrations.mp_access_token,
  })
  const preference = new Preference(mpClient)

  const result = await preference.create({
    body: {
      items: [
        {
          id: book.id,
          title: book.title,
          quantity: 1,
          unit_price: product.price_cents / 100,
          currency_id: product.currency, // 'BRL', 'MXN', 'ARS', 'COP'
        },
      ],
      marketplace_fee: platformFee / 100, // Platform commission
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_READER_URL}/${book.slug}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending`,
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      metadata: {
        book_id: book.id,
        buyer_email: buyerEmail,
        creator_id: book.creator_id,
      },
      // Auto-redirect after payment
      auto_return: 'approved',
    },
  })

  return Response.json({
    checkout_url: result.init_point,
    preference_id: result.id,
  })
}

function getCommissionRate(plan: string): number {
  switch (plan) {
    case 'business': return 0.03
    case 'pro': return 0.05
    default: return 0.10
  }
}
```

### Implementation: MercadoPago Webhook Handler

```typescript
// src/app/api/webhooks/mercadopago/route.ts
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createServiceClient } from '@/supabase/service'

export async function POST(request: Request) {
  const body = await request.json()

  // 1. Verify webhook authenticity
  const signature = request.headers.get('x-signature')
  if (!verifyMPSignature(signature, body)) {
    return new Response('Invalid signature', { status: 401 })
  }

  // 2. Only process payment notifications
  if (body.type !== 'payment') {
    return new Response('OK', { status: 200 })
  }

  // 3. Log the raw event
  const supabase = createServiceClient()
  await supabase.from('webhook_events').insert({
    provider: 'mercadopago',
    event_type: body.type,
    payload: body,
    status: 'pending',
  })

  // 4. Fetch full payment details from MP API
  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  })
  const paymentClient = new Payment(mpClient)
  const payment = await paymentClient.get({ id: body.data.id })

  // 5. Process based on payment status
  if (payment.status === 'approved') {
    const { book_id, buyer_email, creator_id } = payment.metadata

    // Create access grant
    const { data: grant } = await supabase
      .from('access_grants')
      .upsert(
        {
          book_id,
          buyer_email,
          granted_by: 'mercadopago',
          webhook_event_id: String(payment.id),
        },
        { onConflict: 'book_id,buyer_email' }
      )
      .select()
      .single()

    // Record the sale
    await supabase.from('sales').insert({
      book_id,
      creator_id,
      access_grant_id: grant.id,
      provider: 'mercadopago',
      payment_id: String(payment.id),
      amount_cents: Math.round(payment.transaction_amount * 100),
      platform_fee_cents: Math.round(payment.marketplace_fee * 100),
      currency: payment.currency_id,
      buyer_email,
      status: 'completed',
    })

    // Send magic link
    await sendMagicLinkEmail(buyer_email, book_id, grant.id)

    // Update webhook event status
    await supabase
      .from('webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('payload->>data->>id', String(payment.id))
  }

  if (payment.status === 'pending') {
    // Boleto, OXXO, etc. — payment not yet confirmed
    // Will receive another webhook when confirmed
    await supabase.from('pending_payments').upsert({
      payment_id: String(payment.id),
      book_id: payment.metadata.book_id,
      buyer_email: payment.metadata.buyer_email,
      status: 'pending',
    })
  }

  return new Response('OK', { status: 200 })
}
```

### Data Model Additions for Commerce

```sql
-- Creator integrations (MercadoPago OAuth tokens)
CREATE TABLE public.creator_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('mercadopago', 'shopify', 'hotmart', 'polar')),
  access_token TEXT NOT NULL,           -- encrypted at rest
  refresh_token TEXT,                   -- encrypted at rest
  external_user_id TEXT,                -- MP collector_id, Shopify shop_id, etc.
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creator_id, provider)
);

-- Products (maps books to prices for selling)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',  -- BRL, MXN, ARS, COP, USD
  mp_preference_id TEXT,                 -- Cached MP Checkout Pro preference ID
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id)
);

-- Sales (transaction records)
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  access_grant_id UUID REFERENCES public.access_grants(id),
  provider TEXT NOT NULL CHECK (provider IN ('mercadopago', 'shopify', 'hotmart', 'polar')),
  payment_id TEXT NOT NULL,              -- External payment ID
  amount_cents INTEGER NOT NULL,         -- Total amount paid
  platform_fee_cents INTEGER NOT NULL,   -- Platform commission taken
  currency TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'disputed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider, payment_id)
);

CREATE INDEX idx_sales_creator ON public.sales(creator_id);
CREATE INDEX idx_sales_book ON public.sales(book_id);

-- Pending payments (boleto, OXXO — async payment methods)
CREATE TABLE public.pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT NOT NULL UNIQUE,
  book_id UUID NOT NULL REFERENCES public.books(id),
  buyer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'expired', 'approved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Creator subscription tracking (synced from Polar.sh webhooks)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  polar_subscription_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'business')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### MercadoPago Environment Variables

```bash
# MercadoPago Marketplace
MP_APP_ID=                    # Marketplace application ID
MP_CLIENT_SECRET=             # For OAuth token exchange
MP_ACCESS_TOKEN=              # Platform's own access token
MP_WEBHOOK_SECRET=            # For webhook signature verification
```

### Creator Dashboard — Sales Analytics

Creators see in their dashboard:

- **Total revenue** (with currency breakdown)
- **Platform fee taken** (transparent — builds trust)
- **Sales by book** (chart)
- **Recent transactions** (table: buyer, amount, date, payment method)
- **Pending payments** (boleto/OXXO awaiting confirmation)
- **MercadoPago connection status**

---

## 14. Webhook Integration

### Unified Webhook Architecture

All payment providers hit a single entry point that normalizes events:

```
POST /api/webhooks/:provider
     │
     ▼
┌────────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Verify signature   │────►│ Normalize event  │────►│ Process      │
│ (provider-specific)│     │ to common format │     │              │
│                    │     │                  │     │ 1. Log event │
│ - Shopify: HMAC   │     │ {                │     │ 2. Find book │
│ - Hotmart: token   │     │   provider,     │     │ 3. Grant     │
│ - MercadoPago: sig │     │   event_type,   │     │    access    │
│ - Polar: sig       │     │   buyer_email,  │     │ 4. Record    │
│                    │     │   product_id,   │     │    sale      │
│                    │     │   amount,       │     │ 5. Send      │
│                    │     │   currency      │     │    magic link│
│                    │     │ }               │     │              │
└────────────────────┘     └──────────────────┘     └──────────────┘
```

### Provider Mapping

Creators configure mappings in their dashboard:
- "When product X is sold on Shopify → grant access to Book Y"
- "When product Z is sold on Hotmart → grant access to Book W"

```sql
CREATE TABLE public.webhook_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id),
  provider TEXT NOT NULL,
  external_product_id TEXT NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider, external_product_id)
);
```

External providers (Hotmart, Shopify) don't use the split payment model — they just trigger delivery. The creator handles payment collection on their end. This is for creators who already have an audience on these platforms.

---

## 15. Delivery System

### MVP Flow (Manual + Magic Link)

```
Creator dashboard
  │
  ├── "Share Book" button
  │     │
  │     ▼
  │   Enter buyer email → POST /api/access/grant
  │     │
  │     ▼
  │   System creates access_grant + sends magic link email
  │
  └── "Copy Link" button
        │
        ▼
      Copies read.flipbooks.com/:slug to clipboard
      (Public access — no auth required for public books)
```

### Email Template (via Resend)

```
Subject: Your book is ready — {book_title}

Hi,

{creator_name} has shared "{book_title}" with you.

Click below to start reading instantly — no password needed:

[Read Now →] (magic link URL)

This link is personal to you. Please don't share it.
```

### Post-MVP: Automated Delivery

When a webhook fires `order_paid`:
1. Look up `webhook_mappings` for the product
2. Create `access_grant` for the buyer email from the order
3. Send magic link email automatically
4. (Future) Send WhatsApp message via Ycloud

---

## 16. Deployment & Infrastructure

### Cloudflare Setup

```
wrangler.jsonc (main Next.js app)
├── main: ".open-next/worker.js"
├── compatibility_flags: ["nodejs_compat"]
├── r2_buckets: [{ binding: "FLIPBOOKS_BUCKET", bucket_name: "flipbooks-prod" }]
├── services: [{ binding: "PDF_WORKER", service: "pdf-processor" }]
└── assets.directory: ".open-next/assets"

wrangler.jsonc (PDF processing worker)
├── main: "workers/pdf-processor.ts"
├── compatibility_flags: ["nodejs_compat"]
├── browser: { binding: "BROWSER" }
├── r2_buckets: [{ binding: "FLIPBOOKS_BUCKET", bucket_name: "flipbooks-prod" }]
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server-side only, for admin operations

# Auth
MAGIC_LINK_SECRET=                   # JWT signing secret for magic links

# Cloudflare R2 (accessed via Worker bindings, not env vars in production)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# Email
RESEND_API_KEY=

# MercadoPago Marketplace (Phase 2)
MP_APP_ID=
MP_CLIENT_SECRET=
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=

# Polar.sh (Phase 2)
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=

# Ycloud WhatsApp (Phase 3)
YCLOUD_API_KEY=
YCLOUD_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://app.flipbooks.com
NEXT_PUBLIC_READER_URL=https://read.flipbooks.com
```

### Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "deploy:pdf-worker": "wrangler deploy --config workers/wrangler.jsonc"
}
```

### OpenNext Config

```typescript
// open-next.config.ts
import { defineConfig } from '@opennextjs/cloudflare'

export default defineConfig({
  incrementalCache: 'r2',
})
```

---

## 17. API Routes

### Creator APIs

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/books` | Create a new book (upload MD or PDF) |
| `GET` | `/api/books` | List creator's books |
| `GET` | `/api/books/:id` | Get book details |
| `PATCH` | `/api/books/:id` | Update book settings |
| `DELETE` | `/api/books/:id` | Delete a book |
| `POST` | `/api/books/:id/upload` | Upload PDF file (returns presigned R2 URL) |
| `GET` | `/api/books/:id/analytics` | Get book analytics |

### Access & Delivery APIs

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/access/grant` | Grant access to a buyer (sends magic link) |
| `GET` | `/api/access/verify` | Verify magic link token |
| `GET` | `/api/library` | Get buyer's accessible books |

### Session & Anti-Piracy APIs

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/sessions/start` | Start a reader session |
| `PUT` | `/api/sessions/:id/heartbeat` | Session heartbeat |
| `DELETE` | `/api/sessions/:id` | End a session |

### Commerce APIs (Phase 2)

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/checkout/create` | Create MP Checkout Pro preference for a book |
| `GET` | `/api/integrations/mp/connect` | Redirect creator to MP OAuth |
| `GET` | `/api/integrations/mp/callback` | MP OAuth callback (exchange code for tokens) |
| `DELETE` | `/api/integrations/mp/disconnect` | Disconnect MP account |
| `GET` | `/api/sales` | Creator's sales list |
| `GET` | `/api/sales/summary` | Revenue summary (total, by book, by period) |

### Webhook APIs (Phase 2-3)

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/webhooks/mercadopago` | MP payment notifications |
| `POST` | `/api/webhooks/polar` | Polar.sh subscription events |
| `POST` | `/api/webhooks/shopify` | Shopify order events |
| `POST` | `/api/webhooks/hotmart` | Hotmart purchase events |
| `POST` | `/api/whatsapp/inbound` | Ycloud inbound messages (Phase 3) |

---

## 18. MVP Scope & Phases

### Phase 1 — Core (Weeks 1-4)

**Week 1-2: Foundation**
- [ ] Project setup: OpenNext + Cloudflare R2 + Supabase schema
- [ ] Supabase Auth: email/password + Google OAuth for creators
- [ ] Creator dashboard layout (shadcn/ui): book list, upload form
- [ ] Markdown processing pipeline (unified/remark/rehype)
- [ ] Store processed pages in Supabase

**Week 2-3: Reader**
- [ ] Vendor StPageFlip (laposa fork) into repo
- [ ] Build FlipbookReader component with 3D toggle
- [ ] Markdown page rendering in flipbook
- [ ] Reader toolbar, page navigation, keyboard/touch controls
- [ ] Responsive layout (mobile + desktop)

**Week 3-4: PDF + Delivery**
- [ ] PDF upload to R2
- [ ] PDF processing worker (Browser Rendering → page images)
- [ ] Image-based flipbook pages
- [ ] Magic link generation + email delivery (Resend)
- [ ] Buyer library page
- [ ] Anti-piracy: session tracking + concurrent limit

**Week 4: Polish**
- [ ] Basic analytics (view counts, unique readers)
- [ ] Creator book settings (flip effect toggle, publish/unpublish)
- [ ] Error handling, loading states, empty states
- [ ] Deploy to Cloudflare production

### Phase 2 — Platform Billing + Creator Commerce (Weeks 5-8)

**Week 5-6: Platform Billing**
- [ ] Polar.sh integration: subscription plans (free/pro/business)
- [ ] Plan enforcement: book limits, branding, commission rates
- [ ] Subscription status synced via Polar webhooks

**Week 6-7: MercadoPago Commerce**
- [ ] MP Marketplace application setup
- [ ] Creator MP Connect (OAuth flow)
- [ ] Checkout Pro integration with split payments (`marketplace_fee`)
- [ ] MP webhook handler (payment approved/pending/refunded)
- [ ] Async payment support (boleto, OXXO — pending → approved lifecycle)
- [ ] Sales dashboard for creators

**Week 7-8: External Providers + Polish**
- [ ] Hotmart webhook receiver + delivery automation
- [ ] Shopify webhook receiver + delivery automation
- [ ] Device fingerprinting for anti-piracy
- [ ] Creator sales analytics (revenue charts, transaction history)

### Phase 3 — WhatsApp Commerce (Weeks 9-12)

- [ ] Ycloud B2B integration (inbound message handling)
- [ ] WhatsApp bot: product catalog, purchase intent detection
- [ ] MP payment link generation from WhatsApp conversation
- [ ] Magic link delivery via WhatsApp (post-purchase)
- [ ] Creator custom branding (colors, logo on reader)
- [ ] Embedded video support
