import { Section, Text } from '@react-email/components'
import { Layout } from './_components/Layout'
import { Cta } from './_components/Cta'
import { ctaWrap, heading, paragraph, subtle } from './_components/styles'
import {
  formatPeriodEnd,
  getEmailStrings,
  planLabel,
} from '@/lib/email/strings'
import type { Locale } from '@/i18n/config'
import type { Plan } from '@/lib/plans'

export type SubscriptionCanceledEmailProps = {
  locale: Locale
  plan: Plan
  periodEndIso: string | null
  reactivateUrl: string
}

export function SubscriptionCanceledEmail({
  locale,
  plan,
  periodEndIso,
  reactivateUrl,
}: SubscriptionCanceledEmailProps) {
  const t = getEmailStrings(locale).subscriptionCanceled
  const periodEnd = formatPeriodEnd(periodEndIso, locale)
  return (
    <Layout preview={t.preview} locale={locale}>
      <Text style={heading}>{t.headline}</Text>
      <Text style={paragraph}>
        {t.body(planLabel(plan, locale), periodEnd)}
      </Text>
      <Section style={ctaWrap}>
        <Cta href={reactivateUrl} label={t.cta} variant="secondary" />
      </Section>
      <Text style={subtle}>{t.feedback}</Text>
    </Layout>
  )
}

export default SubscriptionCanceledEmail
