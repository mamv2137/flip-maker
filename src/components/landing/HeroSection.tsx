import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

type Props = {
  isAuthenticated: boolean
}

export function HeroSection({ isAuthenticated }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Turn your content into
        <br />
        <span className="text-emerald-500">interactive flipbooks</span>
      </h1>
      <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl">
        Upload a PDF or write in Markdown. Get a premium 3D flipbook reader
        you can share instantly with anyone.
      </p>
      <div className="mt-10 flex items-center justify-center gap-4">
        {isAuthenticated ? (
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <>
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#demo">See it in action</Link>
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
