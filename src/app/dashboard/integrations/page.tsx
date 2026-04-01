'use client'

import { motion } from 'motion/react'
import { NotifyButton } from '@/components/notify-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Sparkles,
  ShoppingBag,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

const integrations = [
  {
    name: 'Shopify',
    description: 'Auto-grant access when customers purchase on your Shopify store.',
    icon: ShoppingBag,
    status: 'coming-soon' as const,
  },
  {
    name: 'Hotmart',
    description: 'Connect with Hotmart to auto-deliver books to your buyers.',
    icon: Zap,
    status: 'coming-soon' as const,
  },
  {
    name: 'MercadoPago',
    description: 'Sell your books with MercadoPago checkout integration.',
    icon: Zap,
    status: 'coming-soon' as const,
  },
]

const shopifySteps = [
  {
    step: 1,
    title: 'Copy your webhook URL',
    description: 'Each book has a unique webhook URL. Find it in your book\'s Share & Access settings.',
  },
  {
    step: 2,
    title: 'Go to Shopify Settings',
    description: 'In your Shopify admin, go to Settings → Notifications → Webhooks.',
  },
  {
    step: 3,
    title: 'Create a webhook',
    description: 'Click "Create webhook", select "Order payment" as the event, paste your Bukify webhook URL, and save.',
  },
  {
    step: 4,
    title: 'That\'s it!',
    description: 'When a customer buys, Shopify sends us their email and we auto-grant access to your flipbook.',
  },
]

export default function IntegrationsPage() {
  return (
    <div className="relative min-h-[calc(100vh-10rem)]">
      {/* Content (blurred) */}
      <div className="pointer-events-none max-h-[calc(100vh-10rem)] select-none overflow-hidden blur-[2px]" aria-hidden="true">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
            <p className="text-muted-foreground mt-1">
              Connect your selling platforms to auto-deliver books to buyers.
            </p>
          </div>

          {/* Integration cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.name}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <integration.icon className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{integration.description}</p>
                  <Button size="sm" className="mt-4" disabled>
                    Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Shopify guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBag className="h-5 w-5" />
                Shopify Setup Guide
              </CardTitle>
              <CardDescription>
                Follow these 4 steps to connect your Shopify store with Bukify
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {shopifySteps.map((s) => (
                  <div key={s.step} className="space-y-2">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                      {s.step}
                    </div>
                    <h3 className="text-sm font-medium">{s.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Webhook URL example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Webhook URL</CardTitle>
              <CardDescription>Use this URL in your Shopify webhook settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="bg-muted flex-1 truncate rounded px-3 py-2 text-xs">
                  https://bukify.com/api/webhooks/shopify/a1b2c3d4-e5f6-7890-abcd-ef1234567890
                </code>
                <Button size="sm" variant="outline" disabled>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Coming Soon Overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          className="mx-4 flex max-w-md flex-col items-center rounded-2xl border bg-background/95 p-8 text-center shadow-2xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 150 }}
        >
          <motion.div
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
          >
            <Sparkles className="h-7 w-7 text-emerald-500" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            Integrations Coming Soon
          </motion.h2>

          <motion.p
            className="text-muted-foreground mt-3 text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            We&apos;re building seamless connections with Shopify, Hotmart, and MercadoPago.
            Auto-deliver your books to every buyer — zero manual work.
          </motion.p>

          <motion.div
            className="mt-6 flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            <NotifyButton feature="integrations" />
            <p className="text-muted-foreground text-xs">
              You&apos;ll be the first to know.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
