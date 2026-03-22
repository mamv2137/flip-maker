import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (errorParam) {
    const message = errorDescription || errorParam
    redirect(`/auth/error?error=${encodeURIComponent(message)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[auth-callback] Exchange result:', {
      hasSession: !!data?.session,
      hasProviderToken: !!data?.session?.provider_token,
      hasRefreshToken: !!data?.session?.provider_refresh_token,
      provider: data?.session?.user?.app_metadata?.provider,
      error: error?.message,
    })

    if (!error && data.session) {
      const session = data.session

      // Save Google tokens for Drive API
      if (session.provider_token && session.user) {
        const expiresAt = new Date(
          Date.now() + (session.expires_in || 3600) * 1000
        ).toISOString()

        const updates: Record<string, string | null> = {
          google_access_token: session.provider_token,
          google_token_expires_at: expiresAt,
        }
        if (session.provider_refresh_token) {
          updates.google_refresh_token = session.provider_refresh_token
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', session.user.id)

        console.log('[auth-callback] Token save:', {
          userId: session.user.id,
          savedAccessToken: !!session.provider_token,
          savedRefreshToken: !!session.provider_refresh_token,
          updateError: updateError?.message,
        })
      }

      redirect(next)
    }

    if (error) {
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`)
    }
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) {
    redirect('/dashboard')
  }

  redirect('/auth/login')
}
