import { Section, Text } from '@react-email/components'
import { Layout } from './_components/Layout'
import { Cta } from './_components/Cta'
import { ctaWrap, heading, paragraph, subtle } from './_components/styles'
import { getEmailStrings, planLabel } from '@/lib/email/strings'
import type { Locale } from '@/i18n/config'
import type { Plan } from '@/lib/plans'

export type PaymentFailedEmailProps = {
  locale: Locale
  plan: Plan
  billingPortalUrl: string
}

export function PaymentFailedEmail({
  locale,
  plan,
  billingPortalUrl,
}: PaymentFailedEmailProps) {
  const t = getEmailStrings(locale).paymentFailed
  return (
    <Layout preview={t.preview} locale={locale}>
      <Text style={heading}>{t.headline}</Text>
      <Text style={paragraph}>{t.body(planLabel(plan, locale))}</Text>
      <Section style={ctaWrap}>
        <Cta href={billingPortalUrl} label={t.cta} />
      </Section>
      <Text style={subtle}>{t.deadline}</Text>
    </Layout>
  )
}

export default PaymentFailedEmail
