import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Bukify',
}

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: March 2026</p>

        <h2>1. Information We Collect</h2>

        <h3>Account Information</h3>
        <p>
          When you create an account, we collect your email address, display name, and
          profile information. If you sign in with Google, we receive your name, email,
          and profile picture from Google.
        </p>

        <h3>Google Drive Data</h3>
        <p>
          If you connect Google Drive, we request read-only access to your files. We access
          only the files you explicitly select. We do not scan, index, or store your Drive
          files unless you enable the R2 backup feature on a paid plan. Your PDFs are read
          on-demand through Google&apos;s API and served through our secure reader.
        </p>

        <h3>Usage Data</h3>
        <p>
          We collect anonymized usage data including page views, reader sessions, and feature
          usage to improve the Service. View counts are tracked using a hashed fingerprint
          (IP + User-Agent) for deduplication purposes. We do not sell this data.
        </p>

        <h3>Payment Information</h3>
        <p>
          Payments are processed by Polar.sh. We do not store your credit card information.
          We receive your subscription status and customer ID from Polar for plan management.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain the Service</li>
          <li>To manage your account and subscription</li>
          <li>To enforce plan limits (view counting)</li>
          <li>To deliver flipbooks to authorized readers</li>
          <li>To send important service notifications</li>
          <li>To improve the Service based on usage patterns</li>
        </ul>

        <h2>3. Content Protection</h2>
        <p>
          PDFs served through our reader are proxied server-side. We do not expose direct
          download URLs to readers. Your content is served in view-only mode through our
          protected reader. However, no digital content protection is absolute.
        </p>

        <h2>4. Data Storage</h2>
        <p>
          Account and flipbook metadata is stored in Supabase (PostgreSQL) hosted in the
          United States. Google Drive files remain in your Google account. If you enable
          R2 backup, a copy of your PDF is stored in Cloudflare R2.
        </p>

        <h2>5. Data Sharing</h2>
        <p>We do not sell your personal data. We share data only with:</p>
        <ul>
          <li><strong>Supabase</strong> — Database and authentication</li>
          <li><strong>Google</strong> — Drive API access (only files you select)</li>
          <li><strong>Polar.sh</strong> — Payment processing</li>
          <li><strong>Vercel</strong> — Hosting and analytics</li>
        </ul>

        <h2>6. Cookies</h2>
        <p>
          We use essential cookies for authentication and session management. We use a
          locale preference cookie for language selection. Password-protected book access
          uses a temporary cookie (24-hour expiry). We use Vercel Analytics which does
          not use cookies for tracking.
        </p>

        <h2>7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Update or correct your information</li>
          <li>Delete your account and associated data</li>
          <li>Disconnect Google Drive at any time</li>
          <li>Export your data</li>
          <li>Cancel your subscription at any time</li>
        </ul>

        <h2>8. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. If you delete your
          account, we delete your personal data and flipbook metadata within 30 days.
          Anonymized analytics data may be retained for longer.
        </p>

        <h2>9. Security</h2>
        <p>
          We implement industry-standard security measures including encrypted connections
          (HTTPS), hashed passwords, Row Level Security on our database, and OAuth 2.0
          for third-party integrations. We regularly review our security practices.
        </p>

        <h2>10. Children</h2>
        <p>
          The Service is not intended for children under 13. We do not knowingly collect
          personal data from children under 13.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. We will notify you of significant
          changes via email or through the Service.
        </p>

        <h2>12. Contact</h2>
        <p>
          For questions about this privacy policy, contact us at{' '}
          <a href="mailto:privacy@bukify.com">privacy@bukify.com</a>.
        </p>
      </div>
    </div>
  )
}
