'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HardDrive, ExternalLink, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/supabase/client'
import { useState, useEffect } from 'react'

export function GoogleDriveConnect() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'not-connected'>('checking')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/drive/token')
        const data = await res.json()
        setStatus(data.hasToken ? 'connected' : 'not-connected')
      } catch {
        setStatus('not-connected')
      }
    }
    check()
  }, [])

  const handleConnect = async () => {
    setIsLoading(true)
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile`,
        scopes: 'https://www.googleapis.com/auth/drive.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
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
            {status === 'checking' ? (
              <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
            ) : status === 'connected' ? (
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
            {status === 'connected'
              ? 'Your Google Drive is connected. You can browse and select PDFs directly when creating flipbooks.'
              : 'Connect your Google Drive to browse and import PDFs directly into your flipbooks.'}
          </p>
          <div className="mt-3">
            {status === 'connected' ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Ready to use — select &quot;Google Drive&quot; when creating a new book.
              </p>
            ) : status !== 'checking' ? (
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
