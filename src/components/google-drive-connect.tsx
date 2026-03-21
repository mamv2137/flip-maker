'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HardDrive, ExternalLink, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/supabase/client'
import { useState, useEffect } from 'react'

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly'

export function GoogleDriveConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check if user already has Drive scope by looking at provider token
  useEffect(() => {
    async function checkConnection() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const provider = session?.user?.app_metadata?.provider
      const providerToken = session?.provider_token

      // User logged in with Google and has a provider token
      if (provider === 'google' && providerToken) {
        setIsConnected(true)
      }
      setChecking(false)
    }
    checkConnection()
  }, [])

  const handleConnect = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile`,
          scopes: DRIVE_SCOPE,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    } catch {
      setIsLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking connection...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-lg border p-4">
        <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
          <HardDrive className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Google Drive</h3>
            {isConnected ? (
              <Badge variant="default" className="bg-emerald-500 text-[10px] hover:bg-emerald-600">
                <Check className="mr-1 h-2.5 w-2.5" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                Not connected
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {isConnected
              ? 'Your Google Drive is connected. You can import PDFs directly from your Drive when creating flipbooks.'
              : 'Connect your Google Drive to import PDFs directly and keep your flipbooks in sync.'}
          </p>
          <div className="mt-3">
            {isConnected ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Ready to use — select &quot;Google Drive URL&quot; when creating a new book.
              </p>
            ) : (
              <Button size="sm" onClick={handleConnect} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Connect Google Drive
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
