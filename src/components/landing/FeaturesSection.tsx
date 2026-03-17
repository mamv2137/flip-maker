import { BookOpen, FileText, Share2, Smartphone } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Realistic 3D page flip',
    description:
      'Smooth, physics-based page turning animation that feels like reading a real book.',
  },
  {
    icon: FileText,
    title: 'PDF & Markdown support',
    description:
      'Upload a PDF or write in Markdown — your content is automatically paginated.',
  },
  {
    icon: Share2,
    title: 'Instant sharing',
    description:
      'Every book gets a unique link. Share via email, social media, or magic links.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first design',
    description:
      'Looks great on any device with responsive layout and touch gestures.',
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Everything you need
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-center text-lg">
          Create, customize, and share beautiful flipbooks in minutes.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-lg">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
