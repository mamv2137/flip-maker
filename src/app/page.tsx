import { createClient } from '@/supabase/server'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { DemoSection } from '@/components/landing/DemoSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { Footer } from '@/components/landing/Footer'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims

  return (
    <div className="bg-background min-h-screen">
      <LandingNavbar isAuthenticated={isAuthenticated} />
      <HeroSection isAuthenticated={isAuthenticated} />
      <FeaturesSection />
      <DemoSection />
      <CtaSection isAuthenticated={isAuthenticated} />
      <Footer />
    </div>
  )
}
