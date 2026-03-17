import { BookUploadForm } from '@/components/book-upload-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Books
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Book</h1>
        <p className="text-muted-foreground">
          Upload a Markdown or PDF file to create a flipbook
        </p>
      </div>

      <BookUploadForm />
    </div>
  )
}
