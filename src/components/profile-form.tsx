'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Check } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  userId: string
  email: string
  displayName: string
  avatarUrl: string
}

export function ProfileForm({ userId, email, displayName: initialName, avatarUrl: initialAvatar }: Props) {
  const [displayName, setDisplayName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar)
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const hasChanges = displayName !== initialName || avatarUrl !== initialAvatar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          display_name: displayName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        }),
      })

      if (res.ok) {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 2000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="bg-muted" />
        <p className="text-muted-foreground text-xs">Email cannot be changed</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="display-name">Display Name</Label>
        <Input
          id="display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="avatar-url">Avatar URL</Label>
        <Input
          id="avatar-url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
        />
        <p className="text-muted-foreground text-xs">
          Paste a URL to an image for your profile picture
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button type="submit" disabled={isLoading || !hasChanges} size="sm">
        {saved ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Saved!
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </>
        )}
      </Button>
    </form>
  )
}
