import { createClient } from '@/supabase/server'
import { getDictionary } from '@/i18n/get-dictionary'
import type { Locale } from '@/i18n/config'
import { LandingNavbar } from './LandingNavbar'
import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { ProcessSection } from './ProcessSection'
import { DemoSection } from './DemoSection'
import { LogoCloud } from './LogoCloud'
import { CtaSection } from './CtaSection'
import { Footer } from './Footer'

export async function LandingPage({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang)
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims

  return (
    <div className="dark bg-black min-h-screen text-white">
      <LandingNavbar isAuthenticated={isAuthenticated} t={dict.landing.nav} lang={lang} />
      <HeroSection isAuthenticated={isAuthenticated} t={dict.landing.hero} />
      <LogoCloud t={dict.landing.logoCloud} />
      <FeaturesSection t={dict.landing.features} />
      <ProcessSection t={dict.landing.process} />
      <DemoSection t={dict.landing.demo} />
      <CtaSection isAuthenticated={isAuthenticated} t={dict.landing.cta} />
      <Footer t={dict.landing.footer} brand={dict.brand.name} />
    </div>
  )
}
