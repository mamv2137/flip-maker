import type { Plan } from '@/lib/plans'
import type { Locale } from '@/i18n/config'
import { getEmailStrings, planLabel } from './strings'
import { sendEmail, type SendEmailResult } from './send'
import { SubscriptionCreatedEmail } from '@/emails/SubscriptionCreatedEmail'
import { PaymentFailedEmail } from '@/emails/PaymentFailedEmail'
import { SubscriptionCanceledEmail } from '@/emails/SubscriptionCanceledEmail'
import { SubscriptionUpgradedEmail } from '@/emails/SubscriptionUpgradedEmail'

const PLAN_TIER: Record<Plan, number> = {
  free: 0,
  creator: 1,
  pro_seller: 2,
  agency: 3,
}

export function isUpgrade(from: Plan, to: Plan): boolean {
  return PLAN_TIER[to] > PLAN_TIER[from]
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

function dashboardUrl(): string {
  return `${appUrl()}/dashboard`
}

function billingUrl(): string {
  return `${appUrl()}/dashboard/profile`
}

type CommonArgs = { to: string; locale?: Locale }

export async function sendSubscriptionCreatedEmail({
  to,
  plan,
  locale = 'es',
}: CommonArgs & { plan: Plan }): Promise<SendEmailResult> {
  const t = getEmailStrings(locale).subscriptionCreated
  return sendEmail({
    to,
    subject: t.subject(planLabel(plan, locale)),
    template: SubscriptionCreatedEmail({
      locale,
      plan,
      dashboardUrl: dashboardUrl(),
    }),
    sender: 'billing',
    tags: [
      { name: 'kind', value: 'subscription_created' },
      { name: 'plan', value: plan },
      { name: 'locale', value: locale },
    ],
  })
}

export async function sendPaymentFailedEmail({
  to,
  plan,
  locale = 'es',
}: CommonArgs & { plan: Plan }): Promise<SendEmailResult> {
  const t = getEmailStrings(locale).paymentFailed
  return sendEmail({
    to,
    subject: t.subject,
    template: PaymentFailedEmail({
      locale,
      plan,
      billingPortalUrl: billingUrl(),
    }),
    sender: 'billing',
    tags: [
      { name: 'kind', value: 'payment_failed' },
      { name: 'plan', value: plan },
      { name: 'locale', value: locale },
    ],
  })
}

export async function sendSubscriptionCanceledEmail({
  to,
  plan,
  periodEndIso,
  locale = 'es',
}: CommonArgs & {
  plan: Plan
  periodEndIso: string | null
}): Promise<SendEmailResult> {
  const t = getEmailStrings(locale).subscriptionCanceled
  return sendEmail({
    to,
    subject: t.subject,
    template: SubscriptionCanceledEmail({
      locale,
      plan,
      periodEndIso,
      reactivateUrl: billingUrl(),
    }),
    sender: 'billing',
    tags: [
      { name: 'kind', value: 'subscription_canceled' },
      { name: 'plan', value: plan },
      { name: 'locale', value: locale },
    ],
  })
}

export async function sendSubscriptionUpgradedEmail({
  to,
  fromPlan,
  toPlan,
  locale = 'es',
}: CommonArgs & { fromPlan: Plan; toPlan: Plan }): Promise<SendEmailResult> {
  const t = getEmailStrings(locale).subscriptionUpgraded
  return sendEmail({
    to,
    subject: t.subject(planLabel(toPlan, locale)),
    template: SubscriptionUpgradedEmail({
      locale,
      fromPlan,
      toPlan,
      dashboardUrl: dashboardUrl(),
    }),
    sender: 'billing',
    tags: [
      { name: 'kind', value: 'subscription_upgraded' },
      { name: 'from_plan', value: fromPlan },
      { name: 'to_plan', value: toPlan },
      { name: 'locale', value: locale },
    ],
  })
}
