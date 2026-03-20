'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Save, Check } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  userId: string
  email: string
  displayName: string
  avatarUrl: string
  bio: string
}

function getInitials(name: string, email: string): string {
  const source = name || email
  return source
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')
}

export function ProfileForm({
  userId,
  email,
  displayName: initialName,
  avatarUrl: initialAvatar,
  bio: initialBio,
}: Props) {
  const [displayName, setDisplayName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar)
  const [bio, setBio] = useState(initialBio)
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const hasChanges =
    displayName !== initialName ||
    avatarUrl !== initialAvatar ||
    bio !== initialBio

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
          bio: bio.trim() || null,
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

  const initials = getInitials(displayName, email)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName || 'Avatar'} />}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{displayName || 'Your Name'}</p>
          <p className="text-muted-foreground text-sm">{email}</p>
        </div>
      </div>

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
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell readers a bit about yourself..."
          rows={3}
          maxLength={280}
        />
        <p className="text-muted-foreground text-xs">
          {bio.length}/280 characters
        </p>
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
          Paste a URL to an image. Your initials will show until you add one.
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
