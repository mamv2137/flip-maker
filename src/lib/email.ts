import { sendEmail, type SendEmailResult } from './email/send'
import { getEmailStrings } from './email/strings'
import { MagicLinkEmail } from '@/emails/MagicLinkEmail'
import type { Locale } from '@/i18n/config'

type SendMagicLinkParams = {
  to: string
  bookTitle: string
  creatorName: string
  magicLinkUrl: string
  locale?: Locale
}

export async function sendMagicLinkEmail({
  to,
  bookTitle,
  creatorName,
  magicLinkUrl,
  locale = 'es',
}: SendMagicLinkParams): Promise<SendEmailResult> {
  const t = getEmailStrings(locale).magicLink
  return sendEmail({
    to,
    subject: t.subject(bookTitle),
    template: MagicLinkEmail({ locale, bookTitle, creatorName, magicLinkUrl }),
    sender: 'notifications',
    tags: [
      { name: 'kind', value: 'magic_link' },
      { name: 'locale', value: locale },
    ],
  })
}
