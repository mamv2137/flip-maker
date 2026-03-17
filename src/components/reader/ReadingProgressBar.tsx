'use client'

type Props = {
  currentPage: number
  totalPages: number
}

export function ReadingProgressBar({ currentPage, totalPages }: Props) {
  const progress = totalPages <= 1 ? 100 : ((currentPage + 1) / totalPages) * 100

  return (
    <div className="bg-muted h-1 w-full">
      <div
        className="h-full bg-emerald-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
