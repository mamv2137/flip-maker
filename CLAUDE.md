# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flipbooks is a SaaS platform that transforms Markdown/PDF content into premium interactive flipbook reader experiences. Targets the Latam creator economy. Built with Next.js 16 (App Router), Supabase, React 19, TypeScript, Tailwind CSS v4, and shadcn/ui (new-york style). Deploys to Cloudflare via OpenNext.

See `SPEC.md` for full product and architecture spec.

## Commands

- **Dev server:** `pnpm dev` (runs on localhost:3000)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint` (ESLint 9 flat config), fix with `pnpm lint-fix`
- **Format:** `pnpm format` (Prettier), check with `pnpm format-check`
- **Type check:** `pnpm type-check`
- **Tests:** `pnpm test` (watch mode), `pnpm test:ci` (single run), `pnpm test -- src/path/to/file.test.tsx` (single file)
- **Bundle analysis:** `pnpm analyze`

## Architecture

- **Package manager:** pnpm (pinned in package.json `packageManager` field)
- **Path alias:** `@/*` maps to `./src/*`
- **Supabase clients:** `src/supabase/server.ts` (server components/actions — always create a new client per call, never store globally) and `src/supabase/client.ts` (browser client)
- **Middleware:** `src/middleware.ts` handles Supabase session refresh, auth redirects for protected routes (`/dashboard`, `/library`), and passes reader routes (`/read/[slug]`) through for page-level auth.
- **Route structure:**
  - `/` — Redirects to `/dashboard` (auth) or `/auth/login` (no auth)
  - `/auth/*` — Login, sign-up, password reset, email confirmation
  - `/dashboard` — Creator dashboard (book list, management)
  - `/dashboard/books/[id]` — Single book detail/settings
  - `/dashboard/books/new` — Create new book
  - `/library` — Buyer's library of accessed books
  - `/read/[slug]` — Public flipbook reader
- **Providers:** Root layout wraps the app in `ThemeProvider` (next-themes), `ReactQueryProvider` (TanStack Query v5), Vercel Analytics, and NextTopLoader.
- **UI components:** shadcn/ui components in `src/components/ui/`. Utility alias for shadcn is `@/utils/tailwind` (not `@/lib/utils`).
- **Testing:** Vitest + jsdom + React Testing Library. Use `import { render, userEvent } from '@/test/test-utils'` which wraps components with QueryClientProvider. MSW v2 server starts automatically via `vitest.setup.ts` for API mocking — add handlers in `src/mocks/handlers.ts`.
- **Database:** Supabase PostgreSQL with RLS. Migration files in `supabase/migrations/`.
- **Pre-commit hooks:** Husky runs lint-staged (ESLint --fix + Prettier) on staged `.js/.jsx/.ts/.tsx` files.
- **CI:** PR workflow runs type-check, lint, format-check, and test:ci.

## Environment Variables

Required in `.env` (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
