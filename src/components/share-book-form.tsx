'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Globe,
  Lock,
  Send,
  Check,
  Copy,
  X,
  Loader2,
  Link as LinkIcon,
  Code,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type AccessGrant = {
  id: string
  buyer_email: string
  granted_by: string
  accessed_at: string | null
  created_at: string
}

type Props = {
  bookId: string
  bookSlug: string
  visibility: 'public' | 'private'
}

export function ShareBookForm({ bookId, bookSlug, visibility: initialVisibility }: Props) {
  const [visibility, setVisibility] = useState(initialVisibility)
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sendResult, setSendResult] = useState<{
    success: boolean
    magicLinkUrl?: string
    error?: string
  } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [grants, setGrants] = useState<AccessGrant[]>([])
  const [isLoadingGrants, setIsLoadingGrants] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const router = useRouter()

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const readerUrl = `${appUrl}/read/${bookSlug}`
  const embedUrl = `${appUrl}/embed/${bookSlug}`
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="700" frameborder="0" allowfullscreen></iframe>`

  const fetchGrants = useCallback(async () => {
    setIsLoadingGrants(true)
    try {
      const res = await fetch(`/api/access/grants?bookId=${bookId}`)
      if (res.ok) {
        const data = await res.json()
        setGrants(data)
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingGrants(false)
    }
  }, [bookId])

  useEffect(() => {
    fetchGrants()
  }, [fetchGrants])

  const handleToggleVisibility = async () => {
    const newVisibility = visibility === 'public' ? 'private' : 'public'
    setIsTogglingVisibility(true)
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility }),
      })
      if (res.ok) {
        setVisibility(newVisibility)
        router.refresh()
      }
    } finally {
      setIsTogglingVisibility(false)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setSendResult(null)

    try {
      const res = await fetch('/api/access/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, buyerEmail: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSendResult({ success: false, error: data.error })
      } else {
        setSendResult({ success: true, magicLinkUrl: data.magicLinkUrl })
        setEmail('')
        fetchGrants()
      }
    } catch {
      setSendResult({ success: false, error: 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevoke = async (grantId: string) => {
    setRevokingId(grantId)
    try {
      const res = await fetch('/api/access/revoke', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantId }),
      })
      if (res.ok) {
        setGrants((prev) => prev.filter((g) => g.id !== grantId))
      }
    } finally {
      setRevokingId(null)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Visibility Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {visibility === 'public' ? (
            <Globe className="text-muted-foreground h-5 w-5" />
          ) : (
            <Lock className="text-muted-foreground h-5 w-5" />
          )}
          <div>
            <p className="text-sm font-medium">
              {visibility === 'public' ? 'Public' : 'Private'}
            </p>
            <p className="text-muted-foreground text-xs">
              {visibility === 'public'
                ? 'Anyone with the link can read'
                : 'Only people you invite can read'}
            </p>
          </div>
        </div>
        <Switch
          checked={visibility === 'public'}
          onCheckedChange={handleToggleVisibility}
          disabled={isTogglingVisibility}
        />
      </div>

      {/* Reader Link */}
      <div className="space-y-2">
        <Label className="text-xs">Reader link</Label>
        <div className="flex items-center gap-2">
          <code className="bg-muted flex-1 truncate rounded px-3 py-2 text-xs">
            {readerUrl}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => copyToClipboard(readerUrl, 'reader')}
            title="Copy link"
          >
            {copied === 'reader' ? (
              <Check className="h-4 w-4" />
            ) : (
              <LinkIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Embed Code */}
      <div className="space-y-2">
        <Label className="text-xs">Embed code (Hotmart, websites)</Label>
        <div className="flex items-center gap-2">
          <code className="bg-muted flex-1 truncate rounded px-3 py-2 text-xs">
            {embedCode}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => copyToClipboard(embedCode, 'embed')}
            title="Copy embed code"
          >
            {copied === 'embed' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Code className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Invite by Email (always available, but especially useful for private books) */}
      <div className="border-t pt-4">
        <Label className="mb-2 block text-xs">
          {visibility === 'private'
            ? 'Invite people (required for private books)'
            : 'Send magic link by email'}
        </Label>
        <form onSubmit={handleSendInvite} className="flex gap-2">
          <Input
            type="email"
            placeholder="reader@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={isLoading || !email.trim()} size="sm">
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {isLoading ? 'Sending...' : 'Invite'}
          </Button>
        </form>

        {sendResult?.success && (
          <div className="mt-2 space-y-1">
            <p className="flex items-center gap-1.5 text-xs text-green-600">
              <Check className="h-3.5 w-3.5" />
              Invite sent!
            </p>
            {sendResult.magicLinkUrl && (
              <div className="flex items-center gap-2">
                <code className="bg-muted flex-1 truncate rounded p-2 text-xs">
                  {sendResult.magicLinkUrl}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    copyToClipboard(sendResult.magicLinkUrl!, 'magic')
                  }
                >
                  {copied === 'magic' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {sendResult?.error && (
          <p className="mt-2 text-xs text-red-500">{sendResult.error}</p>
        )}
      </div>

      {/* Whitelist / Access Grants */}
      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-xs">
            People with access ({grants.length})
          </Label>
          {isLoadingGrants && (
            <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
          )}
        </div>

        {grants.length === 0 && !isLoadingGrants && (
          <p className="text-muted-foreground text-xs">
            No one has been invited yet.
          </p>
        )}

        {grants.length > 0 && (
          <div className="space-y-2">
            {grants.map((grant) => (
              <div
                key={grant.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="truncate text-sm">{grant.buyer_email}</span>
                  {grant.accessed_at && (
                    <Badge variant="outline" className="flex-shrink-0 text-[10px]">
                      Opened
                    </Badge>
                  )}
                  {grant.granted_by !== 'manual' && (
                    <Badge variant="secondary" className="flex-shrink-0 text-[10px]">
                      {grant.granted_by}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => handleRevoke(grant.id)}
                  disabled={revokingId === grant.id}
                  title="Revoke access"
                >
                  {revokingId === grant.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
