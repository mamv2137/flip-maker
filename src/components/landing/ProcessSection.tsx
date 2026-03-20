'use client'

import { Upload, Palette, Globe } from 'lucide-react'
import { InView } from '@/components/ui/in-view'
import { motion } from 'motion/react'

const steps = [
  {
    icon: Upload,
    number: '1',
    title: 'Upload Your Content',
    description:
      'Drag and drop a PDF or paste your Markdown. We handle the rest — automatic pagination, formatting, and optimization.',
  },
  {
    icon: Palette,
    number: '2',
    title: 'Customize & Publish',
    description:
      'Set your book as public or private, customize the slug, and publish instantly. Your flipbook gets a unique shareable URL.',
  },
  {
    icon: Globe,
    number: '3',
    title: 'Share Anywhere',
    description:
      'Share the link directly, embed on any website, or invite readers via email. Track engagement with built-in analytics.',
  },
]

export function ProcessSection() {
  return (
    <section id="process" className="border-t border-white/5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <InView
          variants={{
            hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-400">
            The Process
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Create a flipbook in 3 steps
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Follow these simple steps to publish and share your interactive flipbook.
          </p>
        </InView>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <InView
              key={step.number}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
            >
              <motion.div
                className="group relative rounded-xl border border-white/5 bg-neutral-900/50 p-8 transition-colors hover:border-white/10"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Step icon */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10">
                  <step.icon className="h-6 w-6 text-emerald-400" />
                </div>

                {/* Step number */}
                <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                  {step.number}
                </div>

                <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                  {step.description}
                </p>
              </motion.div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  )
}
