import { createClient } from '@/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // OAuth flow: exchange code for session
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Save Google tokens
      const session = data.session
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

        await supabase
          .from('profiles')
          .update(updates)
          .eq('id', session.user.id)
      }

      redirect(next)
    }

    if (error) {
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`)
    }
  }

  // Email OTP flow: verify token hash
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      redirect(next)
    }
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/auth/error?error=${encodeURIComponent('Invalid confirmation link')}`)
}
