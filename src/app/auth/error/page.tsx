import { Suspense } from 'react'
import { AuthErrorContent } from '@/components/auth-error-content'

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense>
          <AuthErrorContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
