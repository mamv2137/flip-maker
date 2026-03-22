'use client'

import { Marquee } from '@/components/ui/marquee'
import { InView } from '@/components/ui/in-view'
import type { Dictionary } from '@/i18n/get-dictionary'

const platforms = ['Hotmart', 'Notion', 'Gumroad', 'Teachable', 'WordPress', 'Shopify', 'Substack', 'Medium']

type Props = {
  t: Dictionary['landing']['logoCloud']
}

export function LogoCloud({ t }: Props) {
  return (
    <InView
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="border-t border-white/5 py-12"
    >
      <p className="mb-6 text-center text-sm text-neutral-600">{t.tagline}</p>
      <div
        className="relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        }}
      >
        <Marquee pauseOnHover className="[--duration:30s] [--gap:3rem]">
          {platforms.map((name) => (
            <span key={name} className="text-sm font-medium tracking-wide text-neutral-500">
              {name}
            </span>
          ))}
        </Marquee>
      </div>
    </InView>
  )
}
