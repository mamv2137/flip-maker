# Flipbooks — Product & Architecture Spec

> SaaS platform that transforms Google Drive PDFs into premium, interactive web reader experiences with 3D flipbook navigation. Zero-upload model — content stays in the creator's Drive. Targets the Latam creator economy.

---

## Table of Contents

1. [User Roles & Flows](#1-user-roles--flows)
2. [URL Architecture](#2-url-architecture)
3. [Feature Breakdown](#3-feature-breakdown)
4. [Tech Stack](#4-tech-stack)
5. [System Architecture](#5-system-architecture)
6. [Data Model](#6-data-model)
7. [Google Drive Integration](#7-google-drive-integration)
8. [PDF Processing & Rendering](#8-pdf-processing--rendering)
9. [Flipbook Reader](#9-flipbook-reader)
10. [Authentication & Access Control](#10-authentication--access-control)
11. [Anti-Piracy Layer](#11-anti-piracy-layer)
12. [Monetization & Pricing](#12-monetization--pricing)
13. [Payment Integrations](#13-payment-integrations)
14. [Webhook Integrations](#14-webhook-integrations)
15. [Delivery System](#15-delivery-system)
16. [Internationalization](#16-internationalization)
17. [Deployment & Infrastructure](#17-deployment--infrastructure)
18. [API Routes](#18-api-routes)
19. [Roadmap & Phases](#19-roadmap--phases)

---

## 1. User Roles & Flows

### Creator (Publisher)
1. Signs up via email/password or Google OAuth (Supabase Auth)
2. Connects Google Drive (OAuth with `drive.readonly` scope)
3. Browses Drive via custom file picker OR pastes a public Drive link
4. Content is loaded on-demand from Drive → generates a flipbook with unique slug
5. Sets access level: public, password-protected, or private (email invite)
6. Shares the reader URL with buyers/readers
7. Views analytics (coming soon): views, readers, engagement

### Buyer (Reader)
1. Receives a link to the flipbook (direct, via Shopify webhook, or magic link)
2. If private: enters password or verifies email on the Access Gate page
3. Reads content in a premium 3D flipbook reader
4. If not registered: sees a persistent signup banner encouraging account creation
5. Can browse their library of accessed books at `/library`

---

## 2. URL Architecture

| URL | Purpose |
|---|---|
| `/` | Landing page (Spanish, default) |
| `/en` | Landing page (English) |
| `/dashboard` | Creator dashboard (book list, management) |
| `/dashboard/books/new` | Create new book (Drive picker + upload) |
| `/dashboard/books/:id` | Book detail/settings (edit, share, preview) |
| `/dashboard/analytics` | Analytics dashboard (coming soon) |
| `/dashboard/integrations` | Shopify/Hotmart/MercadoPago setup (coming soon) |
| `/dashboard/profile` | Profile settings + Google Drive connection |
| `/library` | Reader's personal library |
| `/auth/*` | Login, sign-up, password reset, OAuth callbacks |
| `/read/:slug` | Public flipbook reader |
| `/embed/:slug` | Embeddable reader (iframe) |

---

## 3. Feature Breakdown

### Implemented (Phase 1)
- [x] Creator auth (email/password + Google OAuth via Supabase)
- [x] Google Drive integration (file picker + public URL paste)
- [x] Custom Drive file picker (browse folders, search, select PDFs)
- [x] Google token persistence + auto-refresh for Drive API access
- [x] PDF upload to Seafile storage (alternative to Drive)
- [x] Markdown upload with auto-pagination
- [x] 3D flipbook reader with page-turn effect (StPageFlip)
- [x] Flat reader mode (CSS transitions)
- [x] Responsive reader (desktop + mobile touch/swipe)
- [x] Access control: public, password-protected, private (email verification)
- [x] Access Gate page with password form, email verification, and login prompt
- [x] Magic link system for buyer access (JWT-based)
- [x] Book categories with emojis (18 predefined)
- [x] Star rating system (1-5, per user per book)
- [x] Cover image upload (manual + auto-extract from first PDF page)
- [x] Book preview before publishing
- [x] Creator onboarding (animated, 3-step)
- [x] Upload progress animation (multi-step with success celebration)
- [x] Logout animation
- [x] Animated error pages (404, auth errors)
- [x] Friendly auth error messages (login + signup)
- [x] Dashboard: compact list view with quick actions (copy link, preview, open reader)
- [x] Book detail: two-column layout (cover + info sidebar, edit + share)
- [x] Share & Access panel: 3 visibility levels with password management
- [x] Signup banner for non-authenticated readers
- [x] Library page with author info, category, star ratings
- [x] Landing page: dark theme, animated (Motion/React), Magic UI components
- [x] Landing page: SEO with hreflang (ES + EN subpaths)
- [x] Internationalization (ES default + EN) — dictionaries, subpath routing for landing
- [x] Google login/signup with OAuth
- [x] Profile: avatar with initials fallback, bio field, avatar URL
- [x] Unified navbar across dashboard and library
- [x] Analytics page (coming soon, with blur overlay)
- [x] Integrations page (coming soon, with Shopify guide preview)
- [x] Shopify webhook endpoint (functional, ready for activation)
- [x] `prefers-reduced-motion` support
- [x] Smooth scroll with offset for sticky navbar
- [x] Accessibility: focus states, aria-labels, semantic HTML

### Phase 2 — Commerce & Integrations
- [ ] Polar.sh integration for platform subscriptions
- [ ] Plan enforcement (book limits, view limits, branding, features)
- [ ] MercadoPago Marketplace (OAuth connect, split payments, Checkout Pro)
- [ ] Shopify webhook activation (remove coming soon overlay)
- [ ] Hotmart webhook receiver
- [ ] Automated delivery on `order_paid` events
- [ ] R2 backup for Drive-hosted PDFs (paid feature)
- [ ] Creator sales dashboard (revenue, transactions)
- [ ] View counting + overage billing ($0.005/view)

### Phase 3 — WhatsApp Commerce + Interactive
- [ ] WhatsApp selling bot via Ycloud B2B
- [ ] WhatsApp delivery (magic link via WhatsApp)
- [ ] Audio book support (MP3/M4A from Drive with embedded player)
- [ ] PDF interactive overlay editor (add buttons, videos, links on top of pages)
- [ ] Creator custom branding (colors, logo on reader)
- [ ] Custom domain support
- [ ] Device fingerprinting for anti-piracy
- [ ] White-label (Agency plan)
- [ ] API access (Agency plan)

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, SSR + SSG) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui (new-york style) |
| **Animations** | Motion (framer-motion v12) + Magic UI components |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Auth** | Supabase Auth (email/password, Google OAuth, magic links) |
| **File Storage** | Seafile (current) / Cloudflare R2 (planned migration) |
| **PDF Source** | Google Drive API v3 (primary) + direct upload (secondary) |
| **Hosting** | Vercel (current) / Cloudflare Workers via OpenNext (planned) |
| **Flipbook Engine** | StPageFlip (forked, vendored) + custom React wrapper |
| **Markdown** | `unified` + `remark` + `rehype` ecosystem |
| **Data Fetching** | TanStack Query v5 (client) + Server Components |
| **i18n** | Custom dictionary-based (ES + EN) |
| **Package Manager** | pnpm |

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Vercel                            │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Next.js 16 App (App Router)                      │   │
│  │                                                    │   │
│  │  Server Components ──► Supabase (PostgreSQL + Auth)│   │
│  │  API Routes ──► Google Drive API v3               │   │
│  │  API Routes ──► Seafile Storage                   │   │
│  │  Middleware ──► Auth redirects + locale detection  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
              │                    │
              ▼                    ▼
┌──────────────────┐    ┌──────────────────┐
│  Google Drive     │    │  Supabase        │
│  (User's PDFs)    │    │  PostgreSQL + Auth│
│                   │    │  + RLS + RPC fns  │
│  - File Picker    │    │                   │
│  - Proxy via API  │    │  Tables:          │
│  - Token refresh  │    │  - profiles       │
└──────────────────┘    │  - books          │
                        │  - book_pages     │
                        │  - categories     │
                        │  - access_grants  │
                        │  - book_ratings   │
                        │  - analytics_events│
                        │  - webhook_events │
                        │  - reader_sessions│
                        └──────────────────┘
```

**Reader request flow:**
1. Reader hits `/read/:slug`
2. Server calls RPC `get_book_access_info` (bypasses RLS)
3. Access control: public → render, password → gate, private → gate
4. For Drive PDFs: proxy via `/api/drive/proxy/:fileId?creator=:uuid`
5. Proxy uses creator's stored Google token (auto-refreshed)
6. PDF rendered client-side via pdfjs-dist at 3x scale → PNG lossless

---

## 6. Data Model

Key tables (see `supabase/migrations/` for full schema):

- **profiles** — User profiles with avatar, bio, Google OAuth tokens
- **books** — Creator's books with Drive file ID, visibility, password, webhook secret, category
- **book_pages** — Pre-rendered HTML pages for Markdown books
- **categories** — 18 predefined categories with emojis
- **access_grants** — Who can read what (email-based, supports Shopify/Hotmart webhooks)
- **book_ratings** — Star ratings (1-5) per user per book
- **reader_sessions** — Anti-piracy concurrent session tracking
- **analytics_events** — View, page_turn, session events
- **webhook_events** — Audit trail for external provider webhooks

**Notable RPC functions (SECURITY DEFINER):**
- `get_book_access_info(slug)` — Get book info bypassing RLS (for access gate)
- `get_creator_drive_token(uuid)` — Get creator's Google tokens (for Drive proxy)
- `get_book_by_webhook_secret(uuid)` — Find book for webhook processing

---

## 7. Google Drive Integration

### Architecture
- **Primary input method**: Creator browses Drive via custom file picker or pastes public URL
- **Zero storage model**: PDFs are read on-demand from Drive, not copied
- **Token management**: OAuth tokens stored in `profiles`, auto-refreshed server-side
- **Proxy**: `/api/drive/proxy/:fileId` uses Drive API v3 `files.get?alt=media` (avoids HTML confirmation pages)

### File Picker
- Custom-built modal (desktop) / drawer (mobile)
- Lists PDFs and folders from user's Drive
- Search with debounce
- Breadcrumb navigation
- Staggered animations on file list

### Two Input Modes (independent, not tabs within same flow)
1. **Browse Drive** — Private files, read with creator's token
2. **Paste URL** — Public files, read without token via proxy

---

## 8. PDF Processing & Rendering

- PDF rendered client-side using `pdfjs-dist`
- Scale: 3x for crisp text on retina displays
- Format: PNG lossless (no compression artifacts)
- Each page rendered to canvas → data URL → flipbook page
- Progress indicator during rendering

---

## 9. Flipbook Reader

- **3D mode**: StPageFlip with physics-based page curl
- **Flat mode**: CSS transitions (toggle in toolbar)
- **Controls**: Arrow keys, swipe, drag corners, fullscreen
- **Signup banner**: Persistent top banner for non-authenticated readers
- **Preview mode**: Creators can preview unpublished books via `?preview=true`

---

## 10. Authentication & Access Control

### Three visibility levels:
| Level | How it works |
|---|---|
| **Public** | Anyone with the link can read |
| **Password** | Reader enters creator-defined password (SHA-256 hashed, stored in cookie for 24h) |
| **Private** | Only users with `access_grant` or magic link can read |

### Access Gate page (animated):
- Shows book title, lock icon
- Password form with show/hide toggle
- Email verification against `access_grants`
- "Sign in" button for authenticated access
- "Create your own flipbook" CTA at bottom

### BookNotFound page (animated):
- When book truly doesn't exist
- "Sign in to check access" + "Go home" buttons
- "Create your own flipbook" CTA

---

## 11. Anti-Piracy Layer

- Concurrent session limits (max 2 per access grant)
- Session heartbeat (30s interval)
- IP logging per session
- Sessions auto-expire after 2 min without heartbeat

---

## 12. Monetization & Pricing

| Plan | Price | Views/mo | Key Features |
|---|---|---|---|
| **Free** | $0 | 200 | 3 flipbooks, watermark, public link only |
| **Creator** | $7/mo ($70/yr) | 2K | Unlimited books, password protection, basic analytics, no watermark |
| **Pro Seller** | $15/mo ($150/yr) | 10K | + MercadoPago, WhatsApp auto, custom domain, R2 backup |
| **Agency** | $39/mo | 50K | + Multi-accounts, white-label, API |
| **Overage** | - | $0.005/view | 90%+ margin |

---

## 13. Payment Integrations

### Platform Revenue (Polar.sh — planned)
- Subscription management for creator plans
- Webhook lifecycle: `subscription.active`, `subscription.canceled`

### Creator Revenue (MercadoPago — planned)
- Marketplace model with split payments (`marketplace_fee`)
- Checkout Pro for local payment methods (PIX, OXXO, boleto, Rapipago)
- Creator connects via OAuth

### External Providers
- **Shopify**: Webhook `order_paid` → auto-create `access_grant` (endpoint ready)
- **Hotmart**: Webhook receiver (planned)

---

## 14. Webhook Integrations

Each book has a unique `webhook_secret` UUID. Webhook URL format:
```
POST /api/webhooks/shopify/{webhook_secret}
```

Flow: Shopify sends order → webhook extracts buyer email → creates `access_grant` → buyer can access book.

---

## 15. Delivery System

### Current (Manual + Access Control)
- Creator shares link directly
- Password or email gate controls access
- Magic links for private book invitations

### Planned (Automated)
- Shopify/Hotmart webhook → auto-grant access
- Email delivery of magic link on purchase
- WhatsApp delivery (Phase 3)

---

## 16. Internationalization

### Approach
- **Landing page**: Subpath routing for SEO (`/` = ES, `/en` = EN)
- **Dashboard/auth**: Cookie-based (`NEXT_LOCALE`)
- **Dictionary-based**: Plain TypeScript objects, type-safe, no i18n library

### Files
- `src/i18n/config.ts` — Locales, defaults
- `src/i18n/dictionaries/es.ts` — Spanish dictionary
- `src/i18n/dictionaries/en.ts` — English dictionary
- `src/i18n/get-dictionary.ts` — Resolve by locale
- `src/i18n/get-locale.ts` — Read from cookie

### SEO
- `<html lang>` set dynamically via middleware header
- `<link rel="alternate" hreflang>` auto-generated by Next.js metadata
- Separate metadata (title/description) per language

---

## 17. Deployment & Infrastructure

### Current
- **Hosting**: Vercel
- **Database**: Supabase (hosted)
- **Storage**: Seafile (file uploads) + Google Drive (primary PDF source)
- **Analytics**: Vercel Analytics

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Auth
MAGIC_LINK_SECRET=

# Google OAuth (for Drive token refresh)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Storage
SEAFILE_URL=
SEAFILE_TOKEN=
SEAFILE_REPO_ID=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 18. API Routes

### Books
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/books` | Create book (file upload, Drive URL, or Drive file ID) |
| `GET` | `/api/books` | List creator's books |
| `GET` | `/api/books/:id` | Get book details |
| `PATCH` | `/api/books/:id` | Update book settings |
| `DELETE` | `/api/books/:id` | Delete book |
| `POST` | `/api/books/:id/cover` | Upload cover image |
| `POST` | `/api/books/:id/password` | Verify book password |
| `PUT` | `/api/books/:id/password` | Set book password |
| `GET/POST` | `/api/books/:id/rating` | Get/submit star rating |
| `POST` | `/api/books/check-access` | Check email access for a book |
| `GET` | `/api/books/check-slug` | Validate slug availability |

### Google Drive
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/drive/files` | List Drive files (PDFs + folders) |
| `POST` | `/api/drive/validate` | Validate a public Drive URL |
| `GET` | `/api/drive/proxy/:fileId` | Proxy PDF from Drive (with creator token) |
| `GET/POST` | `/api/drive/token` | Check/save Google tokens |

### Auth & Profile
| Method | Path | Description |
|---|---|---|
| `PATCH` | `/api/profile` | Update profile (name, avatar, bio) |
| `GET` | `/auth/callback` | OAuth callback (Google) |
| `GET` | `/auth/confirm` | Email OTP + OAuth code exchange |

### Webhooks
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/webhooks/shopify/:secret` | Shopify order_paid webhook |

### Storage
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/storage/*` | Proxy for Seafile-stored files |

---

## 19. Roadmap & Phases

### Phase 1 — Core MVP ✅ (Complete)
- Google Drive integration (picker + URL)
- 3D flipbook reader
- Access control (public/password/private)
- Creator dashboard with onboarding
- i18n (ES + EN)
- Animated UX throughout

### Phase 2 — Commerce (Next)
- Polar.sh subscriptions
- MercadoPago integration
- Shopify/Hotmart webhook activation
- R2 backup for paid plans
- Analytics dashboard (real data)
- View counting + plan enforcement

### Phase 3 — Growth Features
- WhatsApp commerce bot
- Audio book support (Drive-hosted MP3)
- PDF interactive overlay editor
- Custom branding + custom domains
- White-label + API (Agency plan)
