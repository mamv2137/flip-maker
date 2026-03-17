import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

type Props = {
  isAuthenticated: boolean
}

export function CtaSection({ isAuthenticated }: Props) {
  return (
    <section className="border-t py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to create your first flipbook?
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Free to start. No credit card required.
        </p>
        <div className="mt-8">
          {isAuthenticated ? (
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
