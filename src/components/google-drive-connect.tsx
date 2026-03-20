'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HardDrive, ExternalLink } from 'lucide-react'

export function GoogleDriveConnect() {
  // TODO: Implement Google Drive OAuth flow
  // For now, show the integration card with a "coming soon" state
  const isConnected = false

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
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                Not connected
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Import PDFs and Markdown files directly from your Google Drive.
            Export your flipbooks back to Drive for backup.
          </p>
          <div className="mt-3">
            {isConnected ? (
              <Button variant="outline" size="sm" disabled>
                Disconnect
              </Button>
            ) : (
              <Button size="sm" disabled>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Connect Google Drive
              </Button>
            )}
          </div>
          <p className="text-muted-foreground mt-2 text-[11px]">
            Coming soon — Google Drive integration is under development.
          </p>
        </div>
      </div>
    </div>
  )
}
