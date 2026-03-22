import { createClient } from '@/supabase/server'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

/**
 * Get a valid Google access token for the current user.
 * Tries: 1) fresh session token, 2) stored token, 3) refresh token.
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log('[google-tokens] No authenticated user')
    return null
  }

  // 1. Check stored tokens in profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('google_access_token, google_refresh_token, google_token_expires_at')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.log('[google-tokens] Profile fetch error:', profileError.message)
    return null
  }

  if (!profile?.google_access_token) {
    console.log('[google-tokens] No google_access_token in profile for user:', user.id)
    return null
  }

  // 2. Check if token is still valid (5 min buffer)
  const expiresAt = profile.google_token_expires_at
    ? new Date(profile.google_token_expires_at)
    : null
  const isExpired = !expiresAt || expiresAt.getTime() < Date.now() + 5 * 60 * 1000

  if (!isExpired) {
    console.log('[google-tokens] Using stored token (valid until', expiresAt?.toISOString(), ')')
    return profile.google_access_token
  }

  console.log('[google-tokens] Token expired, attempting refresh...')

  // 3. Refresh the token
  if (!profile.google_refresh_token) {
    console.log('[google-tokens] No refresh token available')
    return null
  }

  const refreshed = await refreshGoogleToken(profile.google_refresh_token)
  if (!refreshed) {
    console.log('[google-tokens] Token refresh failed')
    return null
  }

  // 4. Save the new token
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
  await supabase
    .from('profiles')
    .update({
      google_access_token: refreshed.access_token,
      google_token_expires_at: newExpiresAt,
    })
    .eq('id', user.id)

  console.log('[google-tokens] Token refreshed successfully')
  return refreshed.access_token
}

async function refreshGoogleToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('[google-tokens] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET')
    return null
  }

  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[google-tokens] Refresh failed:', res.status, text)
      return null
    }

    const data = await res.json()
    return {
      access_token: data.access_token,
      expires_in: data.expires_in || 3600,
    }
  } catch (err) {
    console.error('[google-tokens] Refresh error:', err)
    return null
  }
}
