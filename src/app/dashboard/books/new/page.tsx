'use client'

import { BookUploadForm } from '@/components/book-upload-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'motion/react'

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Books
          </Link>
        </motion.div>
        <motion.h1
          className="text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        >
          Create New Book
        </motion.h1>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Upload a Markdown or PDF file to create a flipbook
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
      >
        <BookUploadForm />
      </motion.div>
    </div>
  )
}
