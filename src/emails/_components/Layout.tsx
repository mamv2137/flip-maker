import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'
import { getEmailStrings } from '@/lib/email/strings'
import type { Locale } from '@/i18n/config'

type LayoutProps = {
  preview: string
  locale: Locale
  children: ReactNode
}

const main = {
  backgroundColor: '#000000',
  fontFamily:
    "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: 0,
}

const container = {
  backgroundColor: '#0a0a0a',
  margin: '0 auto',
  padding: '40px 32px',
  maxWidth: '520px',
  borderRadius: '16px',
}

const wrapper = {
  padding: '32px 16px',
}

const wordmark = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  margin: 0,
}

const wordmarkAccent = {
  color: '#34d399',
  marginRight: '8px',
}

const footer = {
  color: '#525252',
  fontSize: '12px',
  lineHeight: 1.6,
  margin: '8px 0 0 0',
}

const helpLink = {
  color: '#34d399',
  textDecoration: 'none',
}

const divider = {
  borderColor: '#262626',
  margin: '32px 0 24px 0',
}

export function Layout({ preview, locale, children }: LayoutProps) {
  const t = getEmailStrings(locale)
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Section style={wrapper}>
          <Container style={container}>
            <Section style={{ marginBottom: '32px' }}>
              <Text style={wordmark}>
                <span style={wordmarkAccent}>◆</span>Bukify
              </Text>
            </Section>
            {children}
            <Hr style={divider} />
            <Text style={footer}>{t.common.footer}</Text>
            <Text style={footer}>
              {t.common.helpCta}{' '}
              <Link href={t.common.helpHref} style={helpLink}>
                hello@bukify.io
              </Link>
            </Text>
            <Text style={footer}>{t.common.automatedNotice}</Text>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}
