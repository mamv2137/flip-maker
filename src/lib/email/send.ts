import { Resend } from 'resend'
import { render } from '@react-email/render'
import type { ReactElement } from 'react'

export type EmailSender = 'notifications' | 'billing' | 'hello'

export type SendEmailParams = {
  to: string
  subject: string
  template: ReactElement
  sender?: EmailSender
  replyTo?: string
  tags?: { name: string; value: string }[]
}

export type SendEmailResult =
  | { success: true; id: string; mode: 'sent' | 'redirected' | 'logged' }
  | { success: false; error: string }

const FROM_DEFAULTS: Record<EmailSender, string> = {
  notifications: 'Bukify <notifications@bukify.io>',
  billing: 'Bukify Billing <billing@bukify.io>',
  hello: 'Bukify <hello@bukify.io>',
}

const FROM_ENV: Record<EmailSender, string> = {
  notifications: 'RESEND_FROM_NOTIFICATIONS',
  billing: 'RESEND_FROM_BILLING',
  hello: 'RESEND_FROM_HELLO',
}

function resolveFrom(sender: EmailSender): string {
  return process.env[FROM_ENV[sender]] || FROM_DEFAULTS[sender]
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

/**
 * Decide where the email actually goes.
 * Order:
 *  1. RESEND_TEST_TO set → always reroute (also outside production, in case the user wants a staging override).
 *  2. NODE_ENV !== 'production' AND no test override → log only, never call Resend (protects the 3K/mo quota).
 *  3. Otherwise → real recipient.
 */
function resolveRecipient(to: string): {
  to: string
  mode: 'sent' | 'redirected' | 'logged'
  subjectPrefix: string
} {
  const testTo = process.env.RESEND_TEST_TO?.trim()
  const isProd = process.env.NODE_ENV === 'production'

  if (testTo) {
    return { to: testTo, mode: 'redirected', subjectPrefix: '[TEST] ' }
  }
  if (!isProd) {
    return { to, mode: 'logged', subjectPrefix: '' }
  }
  return { to, mode: 'sent', subjectPrefix: '' }
}

export async function sendEmail({
  to,
  subject,
  template,
  sender = 'notifications',
  replyTo,
  tags,
}: SendEmailParams): Promise<SendEmailResult> {
  const recipient = resolveRecipient(to)
  const finalSubject = `${recipient.subjectPrefix}${subject}`
  const html = await render(template)
  const text = await render(template, { plainText: true })
  const from = resolveFrom(sender)

  if (recipient.mode === 'logged') {
    console.log('[email] logged (dev mode, no Resend call)', {
      from,
      to: recipient.to,
      originalTo: to,
      subject: finalSubject,
      sender,
    })
    return { success: true, id: 'dev-logged', mode: 'logged' }
  }

  const resend = getResend()
  if (!resend) {
    console.warn(
      '[email] RESEND_API_KEY missing in production — skipping send.',
      { to: recipient.to, subject: finalSubject },
    )
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  const { data, error } = await resend.emails.send({
    from,
    to: recipient.to,
    subject: finalSubject,
    html,
    text,
    replyTo,
    tags,
  })

  if (error) {
    console.error('[email] send failed', {
      to: recipient.to,
      subject: finalSubject,
      error,
    })
    return { success: false, error: error.message ?? 'Unknown Resend error' }
  }

  if (recipient.mode === 'redirected') {
    console.log('[email] redirected to test inbox', {
      originalTo: to,
      testTo: recipient.to,
      subject: finalSubject,
    })
  }

  return { success: true, id: data?.id ?? '', mode: recipient.mode }
}
