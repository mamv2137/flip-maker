'use client'

import { useEffect } from 'react'
import { createClient } from '@/supabase/client'

/**
 * Captures Google OAuth tokens from the Supabase session immediately after login
 * and persists them server-side for later Drive API use.
 */
export function useSaveGoogleTokens() {
  useEffect(() => {
    async function saveTokens() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) return

      const provider = session.user?.app_metadata?.provider
      const hasToken = !!session.provider_token

      console.log('[save-google-tokens] Provider:', provider, '| Has token:', hasToken)

      if (!session.provider_token || provider !== 'google') return

      try {
        const res = await fetch('/api/drive/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token || null,
          }),
        })
        const data = await res.json()
        console.log('[save-google-tokens] Save result:', data)
      } catch (err) {
        console.error('[save-google-tokens] Failed:', err)
      }
    }

    saveTokens()
  }, [])
}
