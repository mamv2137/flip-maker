import type { Locale } from '@/i18n/config'

type EmailStrings = {
  common: {
    footer: string
    helpCta: string
    helpHref: string
    automatedNotice: string
  }
  magicLink: {
    subject: (bookTitle: string) => string
    preview: (bookTitle: string) => string
    greeting: string
    body: (creatorName: string, bookTitle: string) => string
    instruction: string
    cta: string
    privacy: string
  }
  subscriptionCreated: {
    subject: (planLabel: string) => string
    preview: (planLabel: string) => string
    headline: string
    body: (planLabel: string) => string
    cta: string
    receipt: string
  }
  paymentFailed: {
    subject: string
    preview: string
    headline: string
    body: (planLabel: string) => string
    cta: string
    deadline: string
  }
  subscriptionCanceled: {
    subject: string
    preview: string
    headline: string
    body: (planLabel: string, periodEnd: string | null) => string
    cta: string
    feedback: string
  }
  subscriptionUpgraded: {
    subject: (toLabel: string) => string
    preview: (toLabel: string) => string
    headline: string
    body: (fromLabel: string, toLabel: string) => string
    cta: string
  }
}

const PLAN_LABELS: Record<Locale, Record<string, string>> = {
  es: {
    free: 'Gratis',
    creator: 'Creator',
    pro_seller: 'Pro Seller',
    agency: 'Agency',
  },
  en: {
    free: 'Free',
    creator: 'Creator',
    pro_seller: 'Pro Seller',
    agency: 'Agency',
  },
}

export function planLabel(plan: string, locale: Locale): string {
  return PLAN_LABELS[locale]?.[plan] ?? plan
}

const es: EmailStrings = {
  common: {
    footer: 'Bukify · Convierte PDFs en experiencias que venden',
    helpCta: '¿Necesitas ayuda?',
    helpHref: 'mailto:hello@bukify.io',
    automatedNotice:
      'Este es un correo automático. Si tienes dudas, respondé y te ayudamos.',
  },
  magicLink: {
    subject: (bookTitle) => `Tu libro está listo — ${bookTitle}`,
    preview: (bookTitle) => `Empezá a leer "${bookTitle}" en Bukify.`,
    greeting: 'Hola,',
    body: (creatorName, bookTitle) =>
      `${creatorName} compartió "${bookTitle}" con vos.`,
    instruction:
      'Tocá el botón para empezar a leer al instante — sin contraseña:',
    cta: 'Leer ahora',
    privacy: 'Este link es personal. Por favor no lo compartas.',
  },
  subscriptionCreated: {
    subject: (planLabel) => `Bienvenido al plan ${planLabel} de Bukify`,
    preview: (planLabel) => `Tu plan ${planLabel} ya está activo.`,
    headline: '¡Listo! Tu plan está activo.',
    body: (planLabel) =>
      `Acabás de activar el plan ${planLabel}. Ya podés publicar libros sin marca de agua, proteger con contraseña y todo lo que tu plan incluye.`,
    cta: 'Ir al panel',
    receipt: 'Vas a recibir el recibo desde Polar en otro correo.',
  },
  paymentFailed: {
    subject: 'No pudimos procesar tu pago',
    preview: 'Actualizá tu método de pago para no perder acceso.',
    headline: 'Hubo un problema con tu pago',
    body: (planLabel) =>
      `Intentamos cobrar tu plan ${planLabel} y no fue posible. Para no perder los beneficios, actualizá tu método de pago lo antes posible.`,
    cta: 'Actualizar método de pago',
    deadline: 'Tenés unos días antes de que tu acceso vuelva al plan gratuito.',
  },
  subscriptionCanceled: {
    subject: 'Tu suscripción a Bukify se canceló',
    preview:
      'Confirmamos la cancelación. Vas a seguir teniendo acceso hasta el fin del período.',
    headline: 'Confirmamos la cancelación',
    body: (planLabel, periodEnd) => {
      const tail = periodEnd
        ? ` Vas a seguir con acceso completo hasta el ${periodEnd}.`
        : ''
      return `Cancelaste tu plan ${planLabel}.${tail} Después de eso, tu cuenta vuelve al plan gratuito.`
    },
    cta: 'Reactivar mi plan',
    feedback: '¿Algo que podamos mejorar? Respondé este correo y lo leemos.',
  },
  subscriptionUpgraded: {
    subject: (toLabel) => `Plan actualizado a ${toLabel}`,
    preview: (toLabel) => `Ya estás en ${toLabel}.`,
    headline: 'Plan actualizado',
    body: (fromLabel, toLabel) =>
      `Pasaste de ${fromLabel} a ${toLabel}. Ya tenés todos los beneficios del nuevo plan disponibles.`,
    cta: 'Ver lo que se desbloqueó',
  },
}

const en: EmailStrings = {
  common: {
    footer: 'Bukify · Turn PDFs into experiences that sell',
    helpCta: 'Need a hand?',
    helpHref: 'mailto:hello@bukify.io',
    automatedNotice:
      'This is an automated email. Reply if you need help — we read every one.',
  },
  magicLink: {
    subject: (bookTitle) => `Your book is ready — ${bookTitle}`,
    preview: (bookTitle) => `Start reading "${bookTitle}" on Bukify.`,
    greeting: 'Hi,',
    body: (creatorName, bookTitle) =>
      `${creatorName} shared "${bookTitle}" with you.`,
    instruction:
      'Tap the button to start reading instantly — no password needed:',
    cta: 'Read now',
    privacy: "This link is personal to you. Please don't share it.",
  },
  subscriptionCreated: {
    subject: (planLabel) => `Welcome to Bukify ${planLabel}`,
    preview: (planLabel) => `Your ${planLabel} plan is now active.`,
    headline: "You're all set. Your plan is active.",
    body: (planLabel) =>
      `You just activated the ${planLabel} plan. You can publish without watermarks, protect with passwords, and use everything your plan includes.`,
    cta: 'Go to dashboard',
    receipt: 'Polar will email you a receipt separately.',
  },
  paymentFailed: {
    subject: "We couldn't process your payment",
    preview: 'Update your payment method to keep your access.',
    headline: 'Payment failed',
    body: (planLabel) =>
      `We tried to charge your ${planLabel} plan but it didn't go through. Update your payment method to keep your benefits.`,
    cta: 'Update payment method',
    deadline:
      'You have a few days before your access drops back to the free plan.',
  },
  subscriptionCanceled: {
    subject: 'Your Bukify subscription was canceled',
    preview:
      "We've confirmed the cancellation. You keep access until the period ends.",
    headline: 'Cancellation confirmed',
    body: (planLabel, periodEnd) => {
      const tail = periodEnd
        ? ` You'll keep full access until ${periodEnd}.`
        : ''
      return `You canceled your ${planLabel} plan.${tail} After that, your account moves back to the free plan.`
    },
    cta: 'Reactivate my plan',
    feedback: 'Anything we could do better? Just reply — we read every email.',
  },
  subscriptionUpgraded: {
    subject: (toLabel) => `Plan upgraded to ${toLabel}`,
    preview: (toLabel) => `You're now on ${toLabel}.`,
    headline: 'Plan upgraded',
    body: (fromLabel, toLabel) =>
      `You moved from ${fromLabel} to ${toLabel}. All the new perks are unlocked and ready to use.`,
    cta: "See what's unlocked",
  },
}

const STRINGS: Record<Locale, EmailStrings> = { es, en }

export function getEmailStrings(locale: Locale): EmailStrings {
  return STRINGS[locale] ?? STRINGS.es
}

export function formatPeriodEnd(
  iso: string | null | undefined,
  locale: Locale,
): string | null {
  if (!iso) return null
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-AR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return null
  }
}
