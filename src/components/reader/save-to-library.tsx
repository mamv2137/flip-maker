'use client'

import { useCallback, useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/supabase/client'
import { toast } from 'sonner'

type Props = {
  bookId: string
  alreadySaved: boolean
}

export function SaveToLibrary({ bookId, alreadySaved }: Props) {
  const [saved, setSaved] = useState(alreadySaved)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = useCallback(async () => {
    if (saved) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('save_book_to_library', { p_book_id: bookId })
      if (error) throw error
      setSaved(true)
      toast.success('Saved to your library')
    } catch {
      toast.error('Could not save to library')
    } finally {
      setIsLoading(false)
    }
  }, [bookId, saved])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleSave}
      disabled={saved || isLoading}
      title={saved ? 'In your library' : 'Save to library'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="h-4 w-4 text-emerald-500" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  )
}
