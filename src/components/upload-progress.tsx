'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Loader2, BookOpen, Shield, Sparkles, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const STEPS = [
  {
    icon: Loader2,
    spin: true,
    title: 'Uploading your content...',
    subtitle: 'Securely transferring your file to our servers.',
  },
  {
    icon: BookOpen,
    spin: false,
    title: 'Preparing your flipbook...',
    subtitle: 'Formatting pages and optimizing for the best reading experience.',
  },
  {
    icon: Shield,
    spin: false,
    title: 'Securing your content...',
    subtitle: 'Applying protection so only your readers can access it.',
  },
]

const SUCCESS_STEP = {
  icon: Sparkles,
  title: 'Your flipbook is ready!',
  subtitle: 'Share it with the world or keep it private — you\'re in control.',
}

type Props = {
  isActive: boolean
  isComplete: boolean
  bookId: string | null
}

export function UploadProgress({ isActive, isComplete, bookId }: Props) {
  const [currentStep, setCurrentStep] = useState(0)

  // Cycle through steps while uploading
  useEffect(() => {
    if (!isActive || isComplete) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1
        return prev
      })
    }, 2200)

    return () => clearInterval(interval)
  }, [isActive, isComplete])

  // Reset on new upload
  useEffect(() => {
    if (isActive && !isComplete) {
      setCurrentStep(0)
    }
  }, [isActive, isComplete])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mx-auto flex max-w-md flex-col items-center px-6 text-center">
            <AnimatePresence mode="wait">
              {!isComplete ? (
                <motion.div
                  key={`step-${currentStep}`}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {/* Icon */}
                  {(() => {
                    const step = STEPS[currentStep]
                    const Icon = step.icon
                    return (
                      <motion.div
                        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                      >
                        {step.spin ? (
                          <Icon className="h-8 w-8 text-primary animate-spin" />
                        ) : (
                          <motion.div
                            initial={{ rotate: -10 }}
                            animate={{ rotate: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon className="h-8 w-8 text-primary" />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })()}

                  {/* Copy */}
                  <h2 className="text-xl font-semibold tracking-tight">
                    {STEPS[currentStep].title}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {STEPS[currentStep].subtitle}
                  </p>

                  {/* Progress dots */}
                  <div className="mt-8 flex items-center gap-2">
                    {STEPS.map((_, i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 rounded-full"
                        animate={{
                          width: i === currentStep ? 24 : 8,
                          backgroundColor:
                            i <= currentStep
                              ? 'hsl(var(--primary))'
                              : 'hsl(var(--muted))',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  {/* Success icon with ring animation */}
                  <motion.div
                    className="relative mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                      <Check className="h-10 w-10 text-emerald-500" />
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: 2, ease: 'easeOut' }}
                    />
                  </motion.div>

                  {/* Success copy */}
                  <motion.h2
                    className="text-2xl font-bold tracking-tight"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {SUCCESS_STEP.title}
                  </motion.h2>
                  <motion.p
                    className="text-muted-foreground mt-2 text-sm leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    {SUCCESS_STEP.subtitle}
                  </motion.p>

                  {/* CTA */}
                  {bookId && (
                    <motion.div
                      className="mt-8 flex gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      <Button asChild>
                        <Link href={`/dashboard/books/${bookId}`}>
                          Go to your book
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
