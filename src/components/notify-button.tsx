'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  feature: string
}

export function NotifyButton({ feature }: Props) {
  const storageKey = `notify-${feature}`
  const [subscribed, setSubscribed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(storageKey) === 'true'
  })

  const handleClick = () => {
    localStorage.setItem(storageKey, 'true')
    setSubscribed(true)
  }

  return (
    <AnimatePresence mode="wait">
      {subscribed ? (
        <motion.div
          key="subscribed"
          className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Check className="h-4 w-4" />
          We&apos;ll notify you!
        </motion.div>
      ) : (
        <motion.div
          key="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Button className="gap-2" onClick={handleClick}>
            <Bell className="h-4 w-4" />
            Notify me when it&apos;s ready
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
