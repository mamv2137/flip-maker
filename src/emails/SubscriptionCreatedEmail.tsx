import { Section, Text } from '@react-email/components'
import { Layout } from './_components/Layout'
import { Cta } from './_components/Cta'
import { ctaWrap, heading, paragraph, subtle } from './_components/styles'
import { getEmailStrings, planLabel } from '@/lib/email/strings'
import type { Locale } from '@/i18n/config'
import type { Plan } from '@/lib/plans'

export type SubscriptionCreatedEmailProps = {
  locale: Locale
  plan: Plan
  dashboardUrl: string
}

export function SubscriptionCreatedEmail({
  locale,
  plan,
  dashboardUrl,
}: SubscriptionCreatedEmailProps) {
  const t = getEmailStrings(locale).subscriptionCreated
  const label = planLabel(plan, locale)
  return (
    <Layout preview={t.preview(label)} locale={locale}>
      <Text style={heading}>{t.headline}</Text>
      <Text style={paragraph}>{t.body(label)}</Text>
      <Section style={ctaWrap}>
        <Cta href={dashboardUrl} label={t.cta} />
      </Section>
      <Text style={subtle}>{t.receipt}</Text>
    </Layout>
  )
}

export default SubscriptionCreatedEmail
