import { Section, Text } from '@react-email/components'
import { Layout } from './_components/Layout'
import { Cta } from './_components/Cta'
import { ctaWrap, heading, paragraph } from './_components/styles'
import { getEmailStrings, planLabel } from '@/lib/email/strings'
import type { Locale } from '@/i18n/config'
import type { Plan } from '@/lib/plans'

export type SubscriptionUpgradedEmailProps = {
  locale: Locale
  fromPlan: Plan
  toPlan: Plan
  dashboardUrl: string
}

export function SubscriptionUpgradedEmail({
  locale,
  fromPlan,
  toPlan,
  dashboardUrl,
}: SubscriptionUpgradedEmailProps) {
  const t = getEmailStrings(locale).subscriptionUpgraded
  const fromLabel = planLabel(fromPlan, locale)
  const toLabel = planLabel(toPlan, locale)
  return (
    <Layout preview={t.preview(toLabel)} locale={locale}>
      <Text style={heading}>{t.headline}</Text>
      <Text style={paragraph}>{t.body(fromLabel, toLabel)}</Text>
      <Section style={ctaWrap}>
        <Cta href={dashboardUrl} label={t.cta} />
      </Section>
    </Layout>
  )
}

export default SubscriptionUpgradedEmail
