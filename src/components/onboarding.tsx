'use client'

import { motion } from 'motion/react'
import { BookOpen, HardDrive, Share2, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const steps = [
  {
    icon: HardDrive,
    title: 'Add your PDF',
    description: 'Paste a public Google Drive link — or connect your Drive to browse private files. Your PDF stays in Drive.',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    icon: BookOpen,
    title: 'Customize & publish',
    description: 'Add a title, cover, and category. Set it as public or private. Publish instantly.',
    color: 'bg-violet-500/10 text-violet-500',
  },
  {
    icon: Share2,
    title: 'Share with the world',
    description: 'Get a unique link. Embed on any website or invite readers by email.',
    color: 'bg-blue-500/10 text-blue-500',
  },
]

export function Onboarding({ displayName }: { displayName: string | null }) {
  const name = displayName?.split(' ')[0] || 'there'

  return (
    <div className="flex flex-col items-center py-8">
      {/* Welcome header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="bg-primary/10 text-primary mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Sparkles className="h-8 w-8" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          Welcome, {name}!
        </motion.h1>
        <motion.p
          className="text-muted-foreground mt-2 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          Create your first interactive flipbook in minutes.
        </motion.p>
      </motion.div>

      {/* Steps */}
      <div className="mt-12 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            className="relative flex flex-col items-center rounded-xl border p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + index * 0.15, ease: 'easeOut' }}
          >
            {/* Step number */}
            <motion.div
              className="bg-muted absolute -top-3 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full text-xs font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.15, type: 'spring' }}
            >
              {index + 1}
            </motion.div>

            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${step.color}`}>
              <step.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
      >
        <Button size="lg" asChild className="px-8">
          <Link href="/dashboard/books/new">
            Create your first book
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
