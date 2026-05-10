import { Section, Text } from '@react-email/components'
import { Layout } from './_components/Layout'
import { Cta } from './_components/Cta'
import { ctaWrap, heading, paragraph, subtle } from './_components/styles'
import { getEmailStrings } from '@/lib/email/strings'
import type { Locale } from '@/i18n/config'

export type MagicLinkEmailProps = {
  locale: Locale
  bookTitle: string
  creatorName: string
  magicLinkUrl: string
}

export function MagicLinkEmail({
  locale,
  bookTitle,
  creatorName,
  magicLinkUrl,
}: MagicLinkEmailProps) {
  const t = getEmailStrings(locale).magicLink
  return (
    <Layout preview={t.preview(bookTitle)} locale={locale}>
      <Text style={heading}>{t.greeting}</Text>
      <Text style={paragraph}>{t.body(creatorName, bookTitle)}</Text>
      <Text style={paragraph}>{t.instruction}</Text>
      <Section style={ctaWrap}>
        <Cta href={magicLinkUrl} label={t.cta} />
      </Section>
      <Text style={subtle}>{t.privacy}</Text>
    </Layout>
  )
}

export default MagicLinkEmail
