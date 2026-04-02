import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Bukify',
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="h-6 w-6 text-emerald-500" />
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: March 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Bukify (&quot;the Service&quot;), you agree to be bound by these
          Terms of Service. If you do not agree to these terms, do not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Bukify is a platform that transforms PDF content from Google Drive into interactive
          interactive reading experiences. The Service allows creators to publish, share, and manage
          access to their digital books.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          You must create an account to use the Service. You are responsible for maintaining
          the security of your account and for all activities that occur under your account.
          You must provide accurate information when creating your account.
        </p>

        <h2>4. Content Ownership</h2>
        <p>
          You retain all ownership rights to the content you upload or link through Google Drive.
          By using the Service, you grant Bukify a limited, non-exclusive license to display
          your content through our reader for the purpose of providing the Service. We do not
          claim ownership of your content.
        </p>

        <h2>5. Content Protection</h2>
        <p>
          We provide content protection features including view-only access, download prevention,
          and access controls. While we take reasonable measures to protect your content, we cannot
          guarantee absolute protection against all forms of unauthorized access or copying.
        </p>

        <h2>6. Google Drive Integration</h2>
        <p>
          The Service integrates with Google Drive to read PDF files. By connecting your Google Drive,
          you authorize Bukify to access your files in read-only mode. We do not modify, delete,
          or store copies of your files unless you explicitly enable the R2 backup feature.
        </p>

        <h2>7. Subscription Plans</h2>
        <p>
          The Service offers free and paid subscription plans. Paid plans are billed monthly or
          annually through our payment processor (Polar.sh). You may cancel your subscription at
          any time. Upon cancellation, you will retain access to paid features until the end of
          your current billing period.
        </p>

        <h2>8. View Limits & Overages</h2>
        <p>
          Each plan includes a monthly view limit. Views are counted as unique visitors per 24-hour
          period per book. If your views exceed your plan limit, access to your books may be
          temporarily restricted until the next billing cycle.
        </p>

        <h2>9. Prohibited Use</h2>
        <p>You may not use the Service to:</p>
        <ul>
          <li>Distribute illegal, harmful, or infringing content</li>
          <li>Attempt to circumvent content protection measures</li>
          <li>Use automated tools to scrape or download protected content</li>
          <li>Impersonate another person or entity</li>
          <li>Interfere with or disrupt the Service</li>
        </ul>

        <h2>10. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account if you violate these terms.
          You may delete your account at any time. Upon termination, your books will no longer
          be accessible to readers.
        </p>

        <h2>11. Limitation of Liability</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. Bukify shall
          not be liable for any indirect, incidental, or consequential damages arising from your
          use of the Service.
        </p>

        <h2>12. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. We will notify you of significant changes
          via email or through the Service. Your continued use after changes constitutes acceptance
          of the new terms.
        </p>

        <h2>13. Contact</h2>
        <p>
          For questions about these terms, contact us at{' '}
          <a href="mailto:qiubitlabs@gmail.com">qiubitlabs@gmail.com</a>.
        </p>
      </div>
    </div>
  )
}
