import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// The app's own hostnames — requests from these are handled normally
const APP_HOSTNAMES = new Set(
  [
    process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
      : null,
    'localhost',
  ].filter(Boolean) as string[],
)

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/en',
  '/auth/login',
  '/auth/sign-up',
  '/auth/sign-up-success',
  '/auth/forgot-password',
  '/auth/update-password',
  '/auth/confirm',
  '/auth/callback',
  '/auth/error',
  '/terms',
  '/privacy',
]

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/library']

// Reader/embed routes have their own auth logic (magic links)
const READER_PREFIX = '/read/'
const EMBED_PREFIX = '/embed/'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] ?? ''

  // Custom domain: rewrite to the reader route so /read/[slug]/page.tsx handles it
  if (!APP_HOSTNAMES.has(hostname)) {
    const url = request.nextUrl.clone()
    // Pass the custom domain as a search param so the reader page can look it up
    url.pathname = `/read/_domain`
    url.searchParams.set('domain', hostname)
    return NextResponse.rewrite(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh the session — must happen before any auth checks
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  const { pathname } = request.nextUrl

  // Reader/embed routes: allow through (handled by page-level magic link/session logic)
  if (pathname.startsWith(READER_PREFIX) || pathname.startsWith(EMBED_PREFIX)) {
    return supabaseResponse
  }

  // Protected routes: redirect to login if no session
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  )
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Auth routes: redirect to dashboard if already logged in
  const isAuthRoute = pathname.startsWith('/auth/')
  if (isAuthRoute && user && pathname !== '/auth/update-password') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Set locale header for root layout
  const locale = pathname.startsWith('/en') ? 'en' : 'es'
  supabaseResponse.headers.set('x-locale', locale)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
