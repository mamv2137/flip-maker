import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

type SendMagicLinkParams = {
  to: string
  bookTitle: string
  creatorName: string
  magicLinkUrl: string
}

export async function sendMagicLinkEmail({
  to,
  bookTitle,
  creatorName,
  magicLinkUrl,
}: SendMagicLinkParams) {
  if (!resend) {
    console.log('[Email] Resend not configured. Magic link URL:', magicLinkUrl)
    return { success: true, id: 'dev-mode' }
  }

  const { data, error } = await resend.emails.send({
    from: 'Flipbooks <noreply@flipbooks.com>',
    to,
    subject: `Your book is ready — ${bookTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi,</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          <strong>${creatorName}</strong> has shared "<strong>${bookTitle}</strong>" with you.
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Click below to start reading instantly — no password needed:
        </p>
        <a href="${magicLinkUrl}" style="display: inline-block; background: #171717; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500; margin: 16px 0;">
          Read Now
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px;">
          This link is personal to you. Please don't share it.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('[Email] Failed to send:', error)
    return { success: false, error }
  }

  return { success: true, id: data?.id }
}
