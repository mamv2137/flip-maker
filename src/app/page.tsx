import { createClient } from '@/supabase/server'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ProcessSection } from '@/components/landing/ProcessSection'
import { DemoSection } from '@/components/landing/DemoSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { LogoCloud } from '@/components/landing/LogoCloud'
import { Footer } from '@/components/landing/Footer'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims

  return (
    <div className="dark bg-black min-h-screen text-white">
      <LandingNavbar isAuthenticated={isAuthenticated} />
      <HeroSection isAuthenticated={isAuthenticated} />
      <LogoCloud />
      <FeaturesSection />
      <ProcessSection />
      <DemoSection />
      <CtaSection isAuthenticated={isAuthenticated} />
      <Footer />
    </div>
  )
}
