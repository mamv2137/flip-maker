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
  Eye,
  EyeOff,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
  visibility: 'public' | 'private' | 'password'
  customDomain?: string | null
  hasCustomDomainFeature?: boolean
}

export function ShareBookForm({ bookId, bookSlug, visibility: initialVisibility, customDomain: initialCustomDomain, hasCustomDomainFeature }: Props) {
  const [visibility, setVisibility] = useState(initialVisibility)
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false)
  const [bookPassword, setBookPassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
  const [customDomain, setCustomDomain] = useState(initialCustomDomain ?? '')
  const [domainSaved, setDomainSaved] = useState(!!initialCustomDomain)
  const [isSavingDomain, setIsSavingDomain] = useState(false)
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

  const handleChangeVisibility = async (newVisibility: 'public' | 'private' | 'password') => {
    if (newVisibility === visibility) return
    setIsTogglingVisibility(true)
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility }),
      })
      if (res.ok) {
        setVisibility(newVisibility)
        setPasswordSaved(false)
        router.refresh()
        toast.success(`Access changed to ${newVisibility}`)
      }
    } finally {
      setIsTogglingVisibility(false)
    }
  }

  const handleSavePassword = async () => {
    if (!bookPassword.trim() || bookPassword.length < 4) return
    setIsTogglingVisibility(true)
    try {
      const res = await fetch(`/api/books/${bookId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: bookPassword }),
      })
      if (res.ok) {
        setPasswordSaved(true)
        setVisibility('password')
        router.refresh()
        toast.success('Password saved')
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
        toast.error(data.error || 'Failed to send invite')
      } else {
        setSendResult({ success: true, magicLinkUrl: data.magicLinkUrl })
        setEmail('')
        fetchGrants()
        toast.success(`Invite sent to ${email.trim()}`)
      }
    } catch {
      setSendResult({ success: false, error: 'An error occurred' })
      toast.error('Failed to send invite')
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
        toast.success('Access revoked')
      }
    } finally {
      setRevokingId(null)
    }
  }

  const handleSaveDomain = async () => {
    const domain = customDomain.trim().toLowerCase()
    setIsSavingDomain(true)
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_domain: domain || null }),
      })
      if (res.ok) {
        setDomainSaved(!!domain)
        router.refresh()
        toast.success(domain ? 'Custom domain saved' : 'Custom domain removed')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save domain')
      }
    } catch {
      toast.error('Failed to save domain')
    } finally {
      setIsSavingDomain(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Visibility Options */}
      <div className="space-y-2">
        <Label className="text-xs">Access level</Label>
        <div className="grid gap-2">
          {/* Public */}
          <button
            type="button"
            onClick={() => handleChangeVisibility('public')}
            disabled={isTogglingVisibility}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
              visibility === 'public' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
          >
            <Globe className={`h-4 w-4 shrink-0 ${visibility === 'public' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">Public</p>
              <p className="text-muted-foreground text-xs">Anyone with the link can read</p>
            </div>
            {visibility === 'public' && <Check className="h-4 w-4 shrink-0 text-primary" />}
          </button>

          {/* Password */}
          <div>
            <button
              type="button"
              onClick={() => handleChangeVisibility('password')}
              disabled={isTogglingVisibility}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                visibility === 'password' ? 'border-primary bg-primary/5 rounded-b-none' : 'hover:bg-muted/50'
              }`}
            >
              <Lock className={`h-4 w-4 shrink-0 ${visibility === 'password' ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">Password</p>
                <p className="text-muted-foreground text-xs">Readers need a password to access</p>
              </div>
              {visibility === 'password' && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
            {visibility === 'password' && (
              <div className="space-y-2 rounded-b-lg border border-t-0 border-primary bg-primary/5 p-3">
                <Label htmlFor="book-password" className="text-xs">Set password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="book-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 4 characters"
                      value={bookPassword}
                      onChange={(e) => { setBookPassword(e.target.value); setPasswordSaved(false) }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSavePassword}
                    disabled={isTogglingVisibility || bookPassword.length < 4}
                  >
                    {passwordSaved ? <Check className="h-4 w-4" /> : 'Save'}
                  </Button>
                </div>
                {passwordSaved && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Password saved. Share it with your readers.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Private */}
          <button
            type="button"
            onClick={() => handleChangeVisibility('private')}
            disabled={isTogglingVisibility}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
              visibility === 'private' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
          >
            <Lock className={`h-4 w-4 shrink-0 ${visibility === 'private' ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">Private</p>
              <p className="text-muted-foreground text-xs">Only people you invite can read</p>
            </div>
            {visibility === 'private' && <Check className="h-4 w-4 shrink-0 text-primary" />}
          </button>
        </div>
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

      {/* Custom Domain */}
      {hasCustomDomainFeature && (
        <div className="border-t pt-4">
          <Label className="mb-2 block text-xs">Custom domain</Label>
          <p className="text-muted-foreground mb-3 text-xs">
            Point your domain&apos;s CNAME to <code className="bg-muted rounded px-1">cname.bukify.com</code> then enter it here.
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="docs.yourdomain.com"
              value={customDomain}
              onChange={(e) => { setCustomDomain(e.target.value); setDomainSaved(false) }}
            />
            <Button
              size="sm"
              onClick={handleSaveDomain}
              disabled={isSavingDomain}
            >
              {domainSaved ? <Check className="h-4 w-4" /> : isSavingDomain ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
          {domainSaved && customDomain.trim() && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
              Domain configured. Your book is accessible at <strong>https://{customDomain.trim()}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
