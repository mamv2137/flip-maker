'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Send, Check, Copy } from 'lucide-react'
import { useState } from 'react'

type Props = {
  bookId: string
}

export function ShareBookForm({ bookId }: Props) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    magicLinkUrl?: string
    error?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/access/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, buyerEmail: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult({ success: false, error: data.error })
      } else {
        setResult({ success: true, magicLinkUrl: data.magicLinkUrl })
        setEmail('')
      }
    } catch {
      setResult({ success: false, error: 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const copyMagicLink = async () => {
    if (result?.magicLinkUrl) {
      await navigator.clipboard.writeText(result.magicLinkUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-2">
        <Label htmlFor="buyer-email">Reader email</Label>
        <div className="flex gap-2">
          <Input
            id="buyer-email"
            type="email"
            placeholder="reader@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={isLoading || !email.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>

      {result?.success && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Magic link sent! (Check console if Resend is not configured)
          </p>
          {result.magicLinkUrl && (
            <div className="flex items-center gap-2">
              <code className="bg-muted flex-1 truncate rounded p-2 text-xs">
                {result.magicLinkUrl}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyMagicLink}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <p className="text-sm text-red-500">{result.error}</p>
      )}
    </form>
  )
}
